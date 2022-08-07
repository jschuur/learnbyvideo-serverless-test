/* eslint-disable import/prefer-default-export */
import { merge } from 'lodash';
import pc from 'picocolors';

import findVideos from './findVideosFunc.js';
import updateChannels from './updateChannelsFunc.js';
import updateVideos from './updateVideosFunc.js';

import config from '../config.js';
import QuotaTracker from '../youtubeQuota.js';

import { error, logMemoryUsage, logTimeSpent } from '../util.js';

const optionsWarning = ({ functionName, event }) => {
  if (event && typeof event !== 'object')
    console.log(
      `${pc.red(
        'Warning'
      )}: expected input data passed for ${functionName} to be an object, instead got ${typeof event}: ${event}!\nWrap in single quotes in an npm script and double quotes in a direct shell command.\n`
    );
};

export default async function runFunction({ handler, params: [event = {}, context, callback] }) {
  let response;
  const functionName = context.functionName.split('-').pop();
  const handlerName = handler.name.replace(/Func$/, '');
  const options = merge(
    {},
    config.functionDefaults({
      handlerName,
      functionName,
      serverless: true,
    }),
    typeof event === 'object' ? event : {}
  );
  const startTime = Date.now();

  optionsWarning({ functionName, event });

  console.log(`Starting ${functionName} (${JSON.stringify({ options })})`);
  const quotaTracker = new QuotaTracker({ task: handlerName, source: functionName, force: options.force });

  try {
    response = await handler({ options, context, callback, quotaTracker });
  } catch ({ message }) {
    error(`Error during ${functionName}: ${message}`);
  }

  await quotaTracker.showSummary();

  console.log();
  logTimeSpent(startTime);
  logMemoryUsage();

  optionsWarning({ functionName, event });

  return `${functionName} complete: ${response}`;
}

export const findVideosHandler = async (...params) => runFunction({ handler: findVideos, params });
export const updateChannelsHandler = async (...params) => runFunction({ handler: updateChannels, params });
export const updateVideosHandler = async (...params) => runFunction({ handler: updateVideos, params });
