import shutdown from 'shutdown';

export function create(options) {
  var winston = options.logger;
  var errorReporter = options.errorReporter;

  return function dealWithUnhandledError(err) {
    try {
      errorReporter(err, { type: 'uncaught' });

      winston.error('----------------------------------------------------------------');
      winston.error('-- Server crash has happened.');
      winston.error('----------------------------------------------------------------');
      winston.error('Uncaught exception' + err, { message: err.message, name: err.name });

      if(err.stack) {
        winston.error('' + err.stack);
      }

      winston.error('Uncaught exception' + err + ' forcing shutdown');
    } catch(e) {
      /* This might seem strange, but sometime just logging the error will crash your process a second time */
      try {
        console.log('The error handler crashed too');
      } catch(e) {
        /* */
      }
    }

    try {
      shutdown.shutdownGracefully(10);
    } catch(e) {
      console.log('The shutdown handler crashed too');
    }
  };
}