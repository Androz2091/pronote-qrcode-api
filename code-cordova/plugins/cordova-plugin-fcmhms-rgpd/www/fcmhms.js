cordova.define("cordova-plugin-fcmhms-rgpd.FCMHMSPlugin", function(require, exports, module) {
var exec = require('cordova/exec');

exports.isGMS = function (success, error) {
  exec(success, error, "FCMHMSPlugin", "isGMS", []);
};

exports.isHMS = function (success, error) {
  exec(success, error, "FCMHMSPlugin", "isHMS", []);
};

exports.initFcmHms = function (success, error) {
  exec(success, error, "FCMHMSPlugin", "initFcmHms", []);
};

exports.initCrashlytics = function (success, error) {
  exec(success, error, "FCMHMSPlugin", "initCrashlytics", []);
};

exports.initAnalytics = function (success, error) {
  exec(success, error, "FCMHMSPlugin", "initAnalytics", []);
};

exports.initPerformance = function (success, error) {
  exec(success, error, "FCMHMSPlugin", "initPerformance", []);
};

exports.initRemoteConfig = function (success, error) {
  exec(success, error, "FCMHMSPlugin", "initRemoteConfig", []);
};

exports.getVerificationID = function (number, success, error) {
  exec(success, error, "FCMHMSPlugin", "getVerificationID", [number]);
};

exports.getInstanceId = function (success, error) {
  exec(success, error, "FCMHMSPlugin", "getInstanceId", []);
};

exports.getId = function (success, error) {
  exec(success, error, "FCMHMSPlugin", "getId", []);
};

exports.getToken = function (success, error) {
  exec(success, error, "FCMHMSPlugin", "getToken", []);
};

exports.onNotificationOpen = function (success, error) {
  exec(success, error, "FCMHMSPlugin", "onNotificationOpen", []);
};

exports.onTokenRefresh = function (success, error) {
  exec(success, error, "FCMHMSPlugin", "onTokenRefresh", []);
};

exports.grantPermission = function (success, error) {
  exec(success, error, "FCMHMSPlugin", "grantPermission", []);
};

exports.hasPermission = function (success, error) {
  exec(success, error, "FCMHMSPlugin", "hasPermission", []);
};

exports.setBadgeNumber = function (number, success, error) {
  exec(success, error, "FCMHMSPlugin", "setBadgeNumber", [number]);
};

exports.getBadgeNumber = function (success, error) {
  exec(success, error, "FCMHMSPlugin", "getBadgeNumber", []);
};

exports.subscribe = function (topic, success, error) {
  exec(success, error, "FCMHMSPlugin", "subscribe", [topic]);
};

exports.unsubscribe = function (topic, success, error) {
  exec(success, error, "FCMHMSPlugin", "unsubscribe", [topic]);
};

exports.unregister = function (success, error) {
  exec(success, error, "FCMHMSPlugin", "unregister", []);
};

exports.logEvent = function (name, params, success, error) {
  exec(success, error, "FCMHMSPlugin", "logEvent", [name, params]);
};

exports.logError = function (message, success, error) {
  exec(success, error, "FCMHMSPlugin", "logError", [message]);
};

exports.setScreenName = function (name, success, error) {
  exec(success, error, "FCMHMSPlugin", "setScreenName", [name]);
};

exports.setUserId = function (id, success, error) {
  exec(success, error, "FCMHMSPlugin", "setUserId", [id]);
};

exports.setUserProperty = function (name, value, success, error) {
  exec(success, error, "FCMHMSPlugin", "setUserProperty", [name, value]);
};

exports.activateFetched = function (success, error) {
  exec(success, error, "FCMHMSPlugin", "activateFetched", []);
};

exports.fetch = function (cacheExpirationSeconds, success, error) {
  var args = [];
  if (typeof cacheExpirationSeconds === 'number') {
    args.push(cacheExpirationSeconds);
  } else {
    error = success;
    success = cacheExpirationSeconds;
  }
  exec(success, error, "FCMHMSPlugin", "fetch", args);
};

exports.getByteArray = function (key, namespace, success, error) {
  var args = [key];
  if (typeof namespace === 'string') {
    args.push(namespace);
  } else {
    error = success;
    success = namespace;
  }
  exec(success, error, "FCMHMSPlugin", "getByteArray", args);
};

exports.getValue = function (key, namespace, success, error) {
  var args = [key];
  if (typeof namespace === 'string') {
    args.push(namespace);
  } else {
    error = success;
    success = namespace;
  }
  exec(success, error, "FCMHMSPlugin", "getValue", args);
};

exports.getInfo = function (success, error) {
  exec(success, error, "FCMHMSPlugin", "getInfo", []);
};

exports.setConfigSettings = function (settings, success, error) {
  exec(success, error, "FCMHMSPlugin", "setConfigSettings", [settings]);
};

exports.setDefaults = function (defaults, namespace, success, error) {
  var args = [defaults];
  if (typeof namespace === 'string') {
    args.push(namespace);
  } else {
    error = success;
    success = namespace;
  }
  exec(success, error, "FCMHMSPlugin", "setDefaults", args);
};

exports.startTrace = function (name, success, error) {
  exec(success, error, "FCMHMSPlugin", "startTrace", [name]);
};

exports.incrementCounter = function (name, counterNamed, success, error) {
  exec(success, error, "FCMHMSPlugin", "incrementCounter", [name, counterNamed]);
};

exports.stopTrace = function (name, success, error) {
  exec(success, error, "FCMHMSPlugin", "stopTrace", [name]);
};

exports.setAnalyticsCollectionEnabled = function (enabled, success, error) {
  exec(success, error, "FCMHMSPlugin", "setAnalyticsCollectionEnabled", [enabled]);
};

exports.setPerformanceCollectionEnabled = function (enabled, success, error) {
  exec(success, error, "FCMHMSPlugin", "setPerformanceCollectionEnabled", [enabled]);
};

exports.clearAllNotifications = function (success, error) {
  exec(success, error, "FCMHMSPlugin", "clearAllNotifications", []);
};
});
