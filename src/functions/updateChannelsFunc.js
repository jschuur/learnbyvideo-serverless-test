import { map } from 'lodash';
import pluralize from 'pluralize';

import { getChannels, updateChannels } from '../db.js';
import { extractChannelInfo } from '../youtube.js';
import { youTubeChannelsList } from '../youtubeApi.js';

export default async function updateChannelsFunc({ quotaTracker }) {
  const channels = await getChannels();

  console.log(`Updating ${pluralize('channel', channels.length, true)}`);

  const channelData = await youTubeChannelsList({
    ids: map(channels, 'youtubeId'),
    part: 'snippet,statistics',
    quotaTracker,
  });

  await updateChannels(channelData.map((channel) => extractChannelInfo(channel)));

  return `Channels processed: ${channels.length}`;
}
