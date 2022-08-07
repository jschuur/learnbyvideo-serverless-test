import 'dotenv/config';

import { VideoStatus } from '@prisma/client';
import { uniqBy } from 'lodash';
import pluralize from 'pluralize';

import { getRecheckVideos, getVideos, updateVideos } from '../db.js';
import { checkForDeletedVideos, updateHomePage } from '../lib.js';
import { debug, error } from '../util.js';
import { getVideoDetails } from '../youtube.js';

import config from '../config.js';

function getVideosForUpdate({ minLastPublished, orderBy, allStatuses, ids, limit, offset }) {
  const queryOptions = {
    where: {},
    select: {
      title: true,
      youtubeId: true,
      status: true,
      channel: true,
    },
    take: limit ? Math.min(parseInt(limit, 10), config.MAX_VIDEO_UPDATE_COUNT) : config.MAX_VIDEO_UPDATE_COUNT,
    skip: offset ? parseInt(offset, 10) : undefined,
  };

  if (!allStatuses)
    queryOptions.where.NOT = {
      status: {
        in: [VideoStatus.HIDDEN, VideoStatus.PRIVATE, VideoStatus.DELETED, VideoStatus.UNKNOWN],
      },
    };

  if (minLastPublished) {
    queryOptions.where.publishedAt = {
      gte: minLastPublished ? new Date(Date.now() - 1000 * 60 * 60 * 24 * parseInt(minLastPublished, 10)) : new Date(0),
    };
  } else if (ids) {
    queryOptions.where.youtubeId = { in: ids.split(',') };
  }

  if (orderBy === 'updated') {
    queryOptions.orderBy = { updatedAt: 'asc' };
  } else {
    queryOptions.orderBy = { publishedAt: 'desc' };
  }

  debug(JSON.stringify(queryOptions, null, 2));

  console.log('Loading videos to update from database...');

  return getVideos(queryOptions);
}

export default async function updateVideosFunc({ options, quotaTracker }) {
  const { limit, minLastPublished, ids, revalidate } = options;

  if (!(limit || minLastPublished || ids)) {
    error('Specify either a channel count --limit, video --ids list or a --min-last-published time in days');

    process.exit(1);
  }

  const videos = uniqBy([...(await getVideosForUpdate(options)), ...(await getRecheckVideos())], 'youtubeId');
  const videoUpdates = await getVideoDetails({
    videos,
    part: 'snippet,statistics,contentDetails,liveStreamingDetails',
    quotaTracker,
  });

  console.log(`Updating ${pluralize('video', videoUpdates.length, true)} in the database...`);
  await updateVideos(videoUpdates);

  const removedVideos = await checkForDeletedVideos({ originalVideos: videos, latestVideos: videoUpdates });

  if (process.env.NODE_ENV === 'production' && revalidate) await updateHomePage();

  return `Videos processed: ${videos.length || 0}, removed: ${removedVideos.length || 0}`;
}
