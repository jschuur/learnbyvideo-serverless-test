import 'dotenv/config';

import delay from 'delay';
import { map } from 'lodash';
import pluralize from 'pluralize';

import {
  getMonitoredChannels,
  getRecheckVideos,
  removeKnownVideos,
  updateChannelMany,
  updateVideos,
  upsertVideos,
} from '../db.js';
import { checkForDeletedVideos, updateHomePage } from '../lib.js';
import { warn } from '../util.js';
import { getRecentVideosFromRSS, getVideoDetails } from '../youtube.js';

import config from '../config.js';

async function getChannelsForUpdate({ minLastUpdated, maxLastUpdated, orderBy, limit, channels }) {
  console.log(`Looking for new videos... (${JSON.stringify({ minLastUpdated, maxLastUpdated, limit, channels })})`);

  const channelsForUpdate = await getMonitoredChannels({
    where: channels
      ? { youtubeId: { in: channels.split(',') } }
      : {
          OR: [
            {
              lastPublishedAt: {
                gte: minLastUpdated
                  ? new Date(Date.now() - 1000 * 60 * 60 * 24 * parseInt(minLastUpdated, 10))
                  : new Date(0),
                lt: maxLastUpdated
                  ? new Date(Date.now() - 1000 * 60 * 60 * 24 * parseInt(maxLastUpdated, 10))
                  : new Date(),
              },
            },
            {
              lastPublishedAt: null,
            },
          ],
        },
    orderBy: orderBy === 'updated' ? { updatedAt: 'asc' } : { publishedAt: 'desc' },
    take: limit,
  });

  console.log(`Using ${pluralize('channel', channelsForUpdate.length, true)}`);

  return channelsForUpdate;
}

// Get the YouTube video IDs for new video from channels
async function findNewVideos(channels) {
  const allNewVideos = [];

  // Use RSS just to grab recent video IDs and see if we have them in the DB
  for (const channel of channels) {
    const recentVideos = await getRecentVideosFromRSS(channel);
    const newVideos = await removeKnownVideos(recentVideos);

    if (newVideos?.length) {
      console.log(`  Found ${pluralize('new video', newVideos.length, true)}`);

      allNewVideos.push(...newVideos);
    }

    // TODO use the API if a channel has more than 15 new videos
    if (newVideos?.length === 15) warn(`RSS feed for ${channel.channelName} has 15 new videos, check API for more`);

    // Don't spam the feed URLs
    await delay(config.RSS_FEED_UPDATE_DELAY_MS);
  }

  return allNewVideos;
}

export default async function findVideosFunc({ options, quotaTracker }) {
  // Include recent videos from the frequent recheck
  const recentVideosCondition = {
    publishedAt: {
      gte: new Date(Date.now() - 1000 * 60 * 60 * config.RECENT_VIDEOS_RECHECK_HOURS),
    },
  };

  // Also include recent videos in the recheck list
  const recheckVideos = options.recheckVideos
    ? await getRecheckVideos({
        include: recentVideosCondition,
      })
    : [];
  const channels = options.findNewVideos ? await getChannelsForUpdate(options) : [];
  const newVideos = options.findNewVideos ? await findNewVideos(channels) : [];

  console.log(`New videos: ${newVideos?.length || 0}, rechecking: ${recheckVideos?.length || 0}`);

  const [newVideosResult, recheckVideosResult] = await getVideoDetails({
    videos: [newVideos, recheckVideos],
    part: 'snippet,statistics,contentDetails,liveStreamingDetails',
    quotaTracker,
  });

  // Add what are probably all new videos
  if (newVideosResult?.length) await upsertVideos(newVideosResult);

  // Update the state of videos that we rechecked (upcoming, live)
  if (recheckVideosResult?.length) await updateVideos(recheckVideosResult);

  // Set updatedAt for all the channels we used in the update
  await updateChannelMany({ where: { id: { in: map(channels, 'id') } }, data: { lastCheckedAt: new Date() } });

  const removedCount = await checkForDeletedVideos({
    originalVideos: recheckVideos,
    latestVideos: recheckVideosResult,
  });

  if (process.env.NODE_ENV === 'production') await updateHomePage();

  return `New videos: ${newVideos?.length || 0}, rechecked: ${recheckVideos?.length || 0}, removed: ${removedCount}`;
}
