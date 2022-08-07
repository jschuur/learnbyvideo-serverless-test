import minimost from 'minimost';

import config from '../config.js';
import runFunction from '../functions/index.js';
import findVideos from '../functions/findVideosFunc.js';

const options = minimost(process.argv.slice(2), {
  string: ['channels', 'min-last-updated', 'max-last-updated', 'order-by'],
  boolean: ['find-new-videos', 'recheck-videos', 'force'],
  default: config.functionDefaults.findVideos,
  alias: {
    c: 'channels',
    m: 'min-last-updated',
    x: 'max-last-updated',
    l: 'limit',
    o: 'order-by',
    f: 'force',
    n: 'find-new-videos',
    r: 'recheck-videos',
  },
}).flags;

(async () => {
  await runFunction({ func: findVideos, params: [options] });
})();
