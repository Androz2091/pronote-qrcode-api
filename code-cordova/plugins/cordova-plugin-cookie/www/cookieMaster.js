cordova.define("cordova-plugin-cookie.cookieMaster", function(require, exports, module) {
var cookieMaster = {

    getCookieValue: function(url, cookieName, successCallback, errorCallback) {
        cordova.exec(successCallback,
                    errorCallback,
                    'CookieMaster', 'getCookieValue',
                    [url, cookieName]
        );
    },
    setCookieValue: function (url, cookieName, cookieValue, successCallback, errorCallback) {
        cordova.exec(successCallback,
                    errorCallback,
                    'CookieMaster', 'setCookieValue',
                    [url, cookieName, cookieValue]
        );
    },
    clearCookies: function(successCallback, errorCallback) {
        cordova.exec(successCallback,
                    errorCallback,
                    'CookieMaster', 'clearCookies',
                    []
        );
    }
};
module.exports = cookieMaster;

});
