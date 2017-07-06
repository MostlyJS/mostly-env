import { EventEmitter } from 'events';
import hjson from 'hjson';
import nconf from 'nconf';
import path from 'path';

function configureNodeEnv() {
  var nodeEnv = process.env.NODE_ENV;
  if (nodeEnv) return nodeEnv;

  /* Default to NODE_ENV=dev */
  process.env.NODE_ENV = 'dev';
  return 'dev';
}

/* Factory */
export function create(configDirectory) {

  /* Load configuration parameters */
  var nodeEnv = configureNodeEnv();

  var configDir = configDirectory;

  // Monkey-patch an event-emitter onto nconf (for now)
  nconf.events = new EventEmitter();

  nconf.argv()
       .env('__');

  nconf.add('envUser', {
    type: 'file',
    file: path.join(configDir, 'config.' + nodeEnv + '.user.hjson'),
    format: hjson
  });

  nconf.add('user', {
    type: 'file',
    file: path.join(configDir, 'config.user.hjson'),
    format: hjson
  });

  nconf.add('nodeEnv', {
    type: 'file',
    file: path.join(configDir, 'config.' + nodeEnv + '.hjson'),
    format: hjson
  });

  nconf.add('defaults', {
    type: 'file',
    file: path.join(configDir, 'config.default.hjson'),
    format: hjson
  });

  process.on('SIGHUP', function() {
    return Promise.map([
      nconf.stores.user,
      nconf.stores.nodeEnv,
      nconf.stores.defaults
    ], function(store) {
      return Promise.fromCallback(function(callback) {
        return store.load(callback);
      });
    })
    .then(function() {
      nconf.events.emit('reload');
      return null;
    })
    .catch(function(err) {
      console.log('gitter-config: Reload failed: ' + err, err);
    });
  });

  nconf.runtimeEnvironment = nodeEnv;

  function parseBool(value) {
    switch(typeof value) {
      case 'boolean':
        return value;
      case 'number':
        return !!value;
      case 'string':
        return !!JSON.parse(value);
      default:
        return undefined;
    }
  }

  /**
   * Monkey-patch `getBool`
   */
  nconf.getBool = function(key) {
    var value = this.get(key);
    return parseBool(value);
  }

  return nconf;
}