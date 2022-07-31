import minimost from 'minimost';

import channelTest from '../lib/commands/channelTest.js';

const options = minimost(process.argv.slice(2), {
  string: ['channel-count'],
  default: {
    'channel-count': 10,
  },
  alias: {
    c: 'channel-count',
  },
}).flags;

(async () => {
  await channelTest(options);
})();
