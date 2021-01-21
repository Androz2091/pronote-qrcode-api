navigator.persistentStorage = navigator.persistentStorage || navigator.webkitPersistentStorage;

var GTraductions = new ObjetTraductions(),
    GApplication = new ObjetApplication();


/** polyfill pour android 4.4 */
if (typeof Object.assign !== 'function') {
  (function () {
    Object.assign = function (target) {
      'use strict';
      // We must check against these specific cases.
      if (target === undefined || target === null) {
        throw new TypeError('Cannot convert undefined or null to object');
      }

      var output = Object(target);
      for (var index = 1; index < arguments.length; index++) {
        var source = arguments[index];
        if (source !== undefined && source !== null) {
          for (var nextKey in source) {
            if (source.hasOwnProperty(nextKey)) {
              output[nextKey] = source[nextKey];
            }
          }
        }
      }
      return output;
    };
  })();
}
if (!Array.prototype.find) {
  Object.defineProperty(Array.prototype, 'find', {
    value: function (predicate) {
      // 1. Let O be ? ToObject(this value).
      if (this == null) {
        throw new TypeError('"this" is null or not defined');
      }

      var o = Object(this);

      // 2. Let len be ? ToLength(? Get(O, "length")).
      var len = o.length >>> 0;

      // 3. If IsCallable(predicate) is false, throw a TypeError exception.
      if (typeof predicate !== 'function') {
        throw new TypeError('predicate must be a function');
      }

      // 4. If thisArg was supplied, let T be thisArg; else let T be undefined.
      var thisArg = arguments[1];

      // 5. Let k be 0.
      var k = 0;

      // 6. Repeat, while k < len
      while (k < len) {
        // a. Let Pk be ! ToString(k).
        // b. Let kValue be ? Get(O, Pk).
        // c. Let testResult be ToBoolean(? Call(predicate, T, « kValue, k, O »)).
        // d. If testResult is true, return kValue.
        var kValue = o[k];
        if (predicate.call(thisArg, kValue, k, o)) {
          return kValue;
        }
        // e. Increase k by 1.
        k++;
      }

      // 7. Return undefined.
      return undefined;
    },
    configurable: true,
    writable: true
  });
}

/** pour Windows Phone */
function executerFonctionAffichage (aFonction) {
  if (window.MSApp && MSApp.execUnsafeLocalFunction) {
    MSApp.execUnsafeLocalFunction(aFonction);
  } else {
    aFonction();
  }
}

/** pour protocole personnalisé */
function handleOpenURL (aUrl) {
  var lTemp = {};
  aUrl = decodeURIComponent(aUrl);
  aUrl.substr(aUrl.indexOf('?') + 1).split('&').forEach(function (ele) {
    if (ele && ele.indexOf('=') > -1) {
      lTemp[ele.split('=')[0]] = ele.split('=')[1].slice(1, -1);
    }
  });
  if (JSON.stringify(lTemp).length > 2) {
    window.sessionStorage.setItem('caller', JSON.stringify(lTemp));
    if (GApplication && GApplication.interface && $.isFunction(GApplication.interface.executer)) {
      GApplication.interface.executer();
    }
  }
}

function start () {
  navigator.globalization.getPreferredLanguage(function (aLang) {
    var lLang = aLang.value.substr(0, 2).toLowerCase();
    GApplication.log(GApplication.niveauxLog.INFO, 'main.js - start() - get Language : ' + lLang);
    if (GTraductions[lLang]) {
      GTraductions.lang = lLang;
    } else {
      GTraductions.lang = 'fr';
    }
    GApplication.init();
  }, function (aError) {
    GTraductions.lang = 'fr';
    GApplication.log(GApplication.niveauxLog.ERROR, 'main.js - start() - navigator.globalization.getPreferredLanguage : ' + JSON.stringify(aError));
    GApplication.init();
  });
  GApplication.log(GApplication.niveauxLog.INFO, 'main.js - start()');
  if (window.Keyboard && window.Keyboard.hideFormAccessoryBar) {
    window.Keyboard.hideFormAccessoryBar(false);
  }
}