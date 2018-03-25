function createWinstonContainer (config) {
  var winston = require("winston");
  var processName = require('./process-name');

  function getTransports () {
    var results = [];

    if(config.getBool("logging:logToUDP")) {
      var appName = processName.getGenericProcessName();

      if (appName) {
        require('winston-udp');
        var os = require('os');

        var udpTransport = new winston.transports.UDP({
          host: config.get("logging:udpHost") || '127.0.0.1',
          port: config.get("logging:udpPort") || 24224,
          level: config.get("logging:level"),
          timestamp: function () {
            return Date.now();
          },
          formatter: function (options) {
            return JSON.stringify({
              "app": appName,
              "env": process.env.NODE_ENV,
              "level": options.level,
              "message": options.message,
              "host": os.hostname(),
              "meta": options.meta
            });
          }
        });

        results.push(udpTransport);
      }
    }

    if(!config.getBool("logging:disableConsole") && !process.env.DISABLE_CONSOLE_LOGGING) {
      var consoleTransport = new winston.transports.Console({
        colorize: config.getBool("logging:colorize"),
        timestamp: config.getBool("logging:timestamp"),
        level: config.get("logging:level"),
        prettyPrint: config.get("logging:prettyPrint")
      });

      results.push(consoleTransport);
    }

    return results;
  }

  var container = new winston.Container({
    transports: getTransports()
  });

  return container;
}

export function create (options) {
  var transformMeta = require('./transform-meta');

  var config = options.config;
  if(!config) throw new Error("options must contain config");

  var container = createWinstonContainer(config);

  // var statsdClient = require('./stats-client').create({
  //   config: config,
  //   prefix: config.get('stats:statsd:prefix')
  // });

  var loggers = {};
  function get (category) {
    if (loggers[category]) {
      return loggers[category];
    }

    // Create and setup a logger
    var logger = container.get(category);
    loggers[category] = logger;

    var logTags;
    if (category) {
      logTags = ['category:' + category];
    } else {
      logTags = undefined;
    }

    logger.on('logging', function (transport, level) {
      switch(level) {
        case 'warn':
          // Record 20% of warnings
          // statsdClient.increment('logged.warn', 1, 0.2, logTags);
          break;
        case 'error':
          // Record 50% of errors
          // statsdClient.increment('logged.error', 1, 0.5, logTags);
          break;
        case 'fatal':
          // Record 100% of fatal
          // statsdClient.increment('logged.fatal', 1, 1, logTags);
          break;
      }
    });


    logger.on('error', function (err) {
      console.error('Logging error: ' + err, err);
      if(err && err.stack) {
        console.error(err.stack);
      }
    });

    logger.rewriters.push(function (level, msg, meta) {
      meta = transformMeta(meta);
      if (category) {
        meta.category = category;
      }
      return meta;
    });

    return logger;
  }

  var defaultLogger = get('');
  defaultLogger.get = get;
  return defaultLogger;
}
