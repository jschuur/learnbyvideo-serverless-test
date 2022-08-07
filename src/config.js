// Allow the .env file to override any config constant
import { merge } from 'lodash';

const defaultValues = (defs) =>
  defs.reduce((acc, [name, value]) => ({ ...acc, [name]: process.env[name] || value }), {});

const getFunctionDefaults = ({ defaults, functionName, handlerName, serverless }) =>
  merge(
    {},
    ...[defaults[handlerName], defaults[functionName]].map(({ serverlessOnly, ...rest } = {}) =>
      serverless ? merge({}, rest, serverlessOnly) : rest
    )
  );

const config = {
  ...defaultValues([
    ['RSS_FEED_UPDATE_DELAY_MS', 100],
    ['SHORTS_CHECK_DELAY_MS', 1000],
    ['MISSING_VIDEO_STATUS_CHECK_DELAY_MS', 200],
    ['GRAPHQL_MAX_RECENT_VIDEOS', 240],
    ['GRAPHQL_DEFAULT_SEARCH_RESULTS_LIMIT', 96],
    ['GRAPHQL_DEFAULT_RECENT_VIDEOS_LIMIT', 24],
    ['GRAPHQL_MAX_SEARCH_RESULTS_LIMIT', 500],
    ['MAX_YOUTUBE_BATCH_SIZE', 50],
    ['MAX_VIDEO_UPDATE_COUNT', 5000],
    ['RECENT_VIDEOS_RECHECK_HOURS', 24],
    ['VIDEO_OVERDUE_MINUTES', 180],
  ]),

  taskQuotas: {
    all: 10000,
    findVideos: 1000,
    updateVideos: 3000,
    updateChannels: 500,
    add_channel: 2000,
  },

  youTubeApiPartQuotas: {
    auditDetails: 4,
    brandingSettings: 2,
    contentDetails: 2,
    contentOwnerDetails: 2,
    fileDetails: 1,
    id: 0,
    liveStreamingDetails: 2,
    localizations: 2,
    player: 0,
    processingDetails: 1,
    recordingDetails: 2,
    snippet: 2,
    statistics: 2,
    status: 2,
    suggestions: 1,
    topicDetails: 2,
  },

  videoStatusHints: {
    PRIVATE: 'This is a private video',
    DELETED_ACCOUNT: 'This video is no longer available because the uploader has closed their YouTube account',
    UNAVAILABLE: `This video isn't available anymore`,
    REMOVED: `This video has been removed by the uploader`,
  },

  functionDefaults: ({ functionName, handlerName, serverless = false }) =>
    getFunctionDefaults({
      defaults: {
        findVideos: {
          findNewVideos: true,
          recheckVideos: true,
        },
        updateVideos: {
          orderBy: 'published',
        },
        updateRecentVideos: {
          serverlessOnly: {
            minLastPublished: 5,
            recheckVideos: true,
          },
        },
        updateOlderVideos: {
          serverlessOnly: {
            orderBy: 'updated',
            limit: 500,
          },
        },
      },
      functionName,
      handlerName,
      serverless,
    }),
};

export default config;
