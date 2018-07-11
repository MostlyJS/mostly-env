const path = require('path');

/**
 * These functions are used to determine the current app name.
 * Before each function there is an example of the returned
 * value when the input is "mostly-webapp-1".
 *
 * Returns "mostly-webapp-1"
 */
function getFullProcessName () {
  var upstartJob = process.env.UPSTART_JOB || process.env.JOB;
  if (upstartJob) return upstartJob;

  var main = require.main;
  if (!main || !main.filename) return 'unknown';

  return path.basename(main.filename, '.js');
}

/* Returns "mostly-webapp" */
function getGenericProcessName (){
  return getFullProcessName().replace(/\-\d*$/,'');
}

/* Returns "webapp" */
function getShortProcessName (){
  return getGenericProcessName().replace(/^mostly-/, '');
}

module.exports = {
  getFullProcessName,
  getGenericProcessName,
  getShortProcessName
};