export default function create (configDirectory) {
  const config = require('./config').create(configDirectory);
  const logger = require('./logger').create({ config: config });

  var env = {
    config: config,
    logger: logger,
  };

  return env;
};