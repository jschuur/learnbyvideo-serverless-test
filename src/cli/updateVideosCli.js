import minimost from 'minimost';

import updateVideos from '../functions/updateVideosFunc.js';

const options = minimost(process.argv.slice(2), {
  string: ['limit', 'offset', 'ids', 'min-last-published', 'order-by'],
  boolean: ['force', 'all-statuses', 'revalidate'],
  default: { 'order-by': 'published' },
  alias: {
    l: 'limit',
    m: 'min-last-published',
    o: 'offset',
    i: 'ids',
    b: 'order-by',
    f: 'force',
    a: 'all-statuses',
    r: 'revalidate',
  },
}).flags;

(async () => {
  await updateVideos(options);
})();
