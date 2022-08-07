/* eslint-disable import/no-extraneous-dependencies */
const fs = require('fs');
const path = require('path');

const jsonfile = require('jsonfile');

const configFilePath = (file) => path.join(__dirname, '../config', file);

module.exports = async ({ options, resolveConfigurationProperty }) => {
  const params =
    options.param?.reduce((acc, param) => {
      const [key, value] = param.split('=');

      return { ...acc, [key]: value };
    }, {}) || {};

  const { stage } = options;
  const configFile =
    params.config || fs.existsSync(configFilePath(`schedule.${stage}.json`))
      ? configFilePath(`schedule.${stage}.json`)
      : configFilePath('schedule.json');

  console.log(`Setting up functions based on ${configFile}`);
  const configData = jsonfile.readFileSync(configFile);

  const config = {
    functions: configData.reduce(
      (acc, { functionName, handlerName, handler, timeout = 900, enabled = true, rate, input, ...rest }) => ({
        ...acc,
        [functionName]: {
          handler: handler || `src/functions/index.${handlerName || functionName}Handler`,
          timeout,
          ...rest,
          events: [{ schedule: { enabled, rate, input } }],
        },
      }),
      (await resolveConfigurationProperty(['custom', 'functions'])) || {}
    ),
  };

  if (process.env.DEBUG) console.log(`serverless.yml functions: ${JSON.stringify(config.functions, null, 2)}`);

  return config;
};
