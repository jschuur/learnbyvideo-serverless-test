import { getChannels } from '../../db.js';

export default (event) => {
  console.log(JSON.stringify(event, null, 2));

  return getChannels({
    select: {
      id: true,
      channelName: true,
      lastPublishedAt: true,
    },
    orderBy: {
      lastPublishedAt: 'desc',
    },
    take: 10,
  });
};
