import path from 'path';

/**
 * These functions are used to determine the current app name.
 * Before each function there is an example of the returned
 * value when the input is "mostly-webapp-1".
 *
 * Returns "mostly-webapp-1"
 */
export function getFullProcessName () {
  var upstartJob = process.env.UPSTART_JOB || process.env.JOB;
  if (upstartJob) return upstartJob;

  var main = require.main;
  if (!main || !main.filename) return 'unknown';

  return path.basename(main.filename, '.js');
}

/* Returns "mostly-webapp" */
export function getGenericProcessName (){
  return getFullProcessName().replace(/\-\d*$/,'');
}

/* Returns "webapp" */
export function getShortProcessName (){
  return getGenericProcessName().replace(/^mostly-/, '');
}

