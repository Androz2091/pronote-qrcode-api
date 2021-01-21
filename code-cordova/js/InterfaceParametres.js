/**
 * @param aNom (description)
 * @param aCallback (description)
 */
function InterfaceParametres (aNom, aGenre) {
  this.nom = aNom;
  this.genre = aGenre;
  this.notificationHasPermission = true;
}

(function () {
/**
     * Construction de l'interface
     *
     * @returns {String} HTML généré
     */
InterfaceParametres.prototype.construire = function () {
  GApplication.log(GApplication.niveauxLog.TRACE, 'construire()');
  var H = [];
  H.push('<div style="padding:0 10px;"><h4 class="firstLand" tabIndex="0">', GTraductions.getValeur('MenuParametres'), '</h4></div>');

  H.push('<div style="padding:0px 10px; width: 100%;">');
  H.push('<ul role="list" class="collection">');
  H.push('<li role="listitem" class="collection-item with-action">');
  H.push('<div style="width: 100%;" class="switch"><label class="title" style="display: block; width: 100%;">',
            GTraductions.getValeur('activerPush'),
            '<input class="IFC_Parametre_AvecNotification" type="checkbox" ', (GApplication.configUtil && GApplication.configUtil.avecNotification ? 'checked' : ''), ' onchange="', this.nom, '.changeNotif(this.checked);"/>',
            '<span style="position:absolute; right:5px;" class="lever"></span>',
            '</label></div>');
  H.push('</li>');
  H.push('<li role="listitem" class="collection-item with-action">');
  H.push('<div style="width: 100%;" class="switch"><label class="title" style="display: block; width: 100%;">',
            GTraductions.getValeur('activerAnalyticsCollection'),
            '<input class="IFC_Parametre_AvecACE" type="checkbox" ', (GApplication.configUtil && GApplication.configUtil.avecAnalytics ? 'checked' : ''), ' onchange="', this.nom, '.changeACE(this.checked);"/>',
            '<span style="position:absolute; right:5px;" class="lever"></span>',
            '</label></div>');
  H.push('</li>');
  H.push('<li role="listitem" class="collection-item with-action">');
  H.push('<div style="width: 100%;" class="switch"><label class="title" style="display: block; width: 100%;">',
            GTraductions.getValeur('activerCrashlyticsCollection'),
            '<input class="IFC_Parametre_AvecACE" type="checkbox" ', (GApplication.configUtil && GApplication.configUtil.avecCrashlytics ? 'checked' : ''), ' onchange="', this.nom, '.changeCrash(this.checked);"/>',
            '<span style="position:absolute; right:5px;" class="lever"></span>',
            '</label></div>');
  H.push('</li>');
  if (GApplication.configUtil && GApplication.configUtil.subscriptions) {
    for (var key in GApplication.configUtil.subscriptions) {

      H.push('<li role="listitem" class="collection-item with-action">');
      H.push('<div style="width: 100%;" class="switch"><label class="title" style="display: block; width: 100%;">',
                    GTraductions.getValeur('subscribe'), ' "', key, '"',
                    '<input class="IFC_Parametre_AvecSubscribe" name="', key, '" type="checkbox" ', (GApplication.configUtil.subscriptions[key] ? 'checked' : ''), ' onchange="', this.nom, '.changeSubscription(this.checked, this.name);"/>',
                    '<span style="position:absolute; right:5px;" class="lever"></span>',
                    '</label></div>');
      H.push('</li>');
    }
  }
  H.push('</ul>');
  H.push('<p>', GTraductions.getValeur('reloadPourParametres'), '</p>');
  H.push('</div>');
  return H.join('');
};

InterfaceParametres.prototype.changeNotif = function (aValue) {
  GApplication.log(GApplication.niveauxLog.TRACE, 'changeNotif()');
  GApplication.configUtil.avecNotification = aValue;
  GApplication.configUtil.avecRemoteConfig = aValue;
  GApplication.ecrireConfigUtil();
  if (GApplication.configUtil.avecNotification || GApplication.configUtil.avecRemoteConfig) {
    GApplication.log(GApplication.niveauxLog.TRACE, 'InterfaceParametres.js - Register');
    GApplication.firebaseConfig();
  } else {
    GApplication.log(GApplication.niveauxLog.TRACE, 'InterfaceParametres.js - Unregister');
    window.FCMHMSPlugin.unregister();
  }
};

InterfaceParametres.prototype.changeACE = function (aValue) {
  GApplication.log(GApplication.niveauxLog.TRACE, 'changeACE()');
  GApplication.configUtil.avecAnalytics = aValue;
  GApplication.ecrireConfigUtil();
  if (GApplication.configUtil.avecAnalytics) {
    window.FCMHMSPlugin.initAnalytics();
  } else {
    window.FCMHMSPlugin.setAnalyticsCollectionEnabled(false);
  }
};

InterfaceParametres.prototype.changeCrash = function (aValue) {
  GApplication.log(GApplication.niveauxLog.TRACE, 'changeCrash()');
  GApplication.configUtil.avecCrashlytics = aValue;
  GApplication.configUtil.avecPerformance = aValue;
  GApplication.ecrireConfigUtil();
  if (GApplication.configUtil.avecCrashlytics || GApplication.configUtil.avecPerformance) {
    GApplication.firebaseConfig();
  } else {
    window.FCMHMSPlugin.setPerformanceCollectionEnabled(false);
  }
};

InterfaceParametres.prototype.changeSubscription = function (aValue, aName) {
  GApplication.log(GApplication.niveauxLog.TRACE, 'changeSubscription()');
  GApplication.configUtil.subscriptions[aName] = aValue;
  GApplication.ecrireConfigUtil();
  if (GApplication.configUtil.subscriptions[aName]) {
    window.FCMHMSPlugin.subscribe(aName);
  } else {
    window.FCMHMSPlugin.unsubscribe(aName);
  }
};

InterfaceParametres.prototype.executer = function () {
  GApplication.log(GApplication.niveauxLog.TRACE, 'executer()');
  if (!GApplication.configUtil.init) {
    GApplication.configUtil.init = true;
    GApplication.ecrireConfigUtil();
  }
  window.FCMHMSPlugin.hasPermission(function (data) {
    this.notificationHasPermission = data.isEnabled;
    if (!this.notificationHasPermission) {
      $('.IFC_Parametre_AvecNotification').prop("disabled", true);
      $('.IFC_Parametre_AvecSubscribe').prop("disabled", true);
    }
  }.bind(this));
};

})();