/**
 * @param aNom (description)
 * @param aCallback (description)
 */
function InterfaceAide (aNom, aGenre) {
  this.nom = aNom;
  this.genre = aGenre;
}

(function () {
/**
     * Construction de l'interface
     *
     * @returns {String} HTML généré
     */
InterfaceAide.prototype.construire = function () {
  GApplication.log(GApplication.niveauxLog.TRACE, 'construire()');
  var H = [];
  H.push('<div style="padding:0 10px;"><h4>', GTraductions.getValeur('aProposApp'), '</h4></div>');
  H.push('<div style="padding:0 10px;">',
            '<p class="firstLand" tabIndex="0" style="margin-bottom:10px;">', GTraductions.getValeur('creditsHtml'), '</p>',
            '<h4>', GTraductions.getValeur('IndexEducation'), '</h4>',
            '<p style="margin-bottom:10px;">', GTraductions.getValeur('adresseIndexFrance'),
            '<br />',
            '<a class="link" href="', GTraductions.getValeur('siteInternetIndex'), '" target="_blank">', GTraductions.getValeur('siteInternetIndex'), '</a>',
            '</p>',
            '<p style="margin-bottom:10px;">', GTraductions.getValeur('declarationConfidentialite'), ' : <a class="link" href="', GTraductions.getValeur('siteInternetdeclarationConfidentialite'), '" target="_blank">', GTraductions.getValeur('siteInternetdeclarationConfidentialite'), '</a></p>',
            '<p>', GTraductions.getValeur('version') + ' ' + GApplication.version, '</p>',
            '<p>', GTraductions.getValeur('platform') + ' ' + device.platform + ' ' + device.version, '</p>',
            '</div>');
  H.push('<div style="text-align:center;padding:0 10px;">');
  H.push('<button onclick="', this.nom, '.ouvrirCredits();" class="btn waves-effect waves-light">', GTraductions.getValeur('creditsOpenSource'), '</button>');
  H.push('</div>');
  return H.join('');
};

InterfaceAide.prototype.ouvrirCredits = function () {
  GApplication.log(GApplication.niveauxLog.TRACE, 'ouvrirCredits()');
  var H = [];
  GApplication.ouvrirPopup({
    header: '<h2>' + GTraductions.getValeur('creditsOpenSourceHtml') + '</h2>',
    content: '<p style="padding:0.5rem;">' +
                '<a class="link" href="https://cordova.apache.org/" target="_blank">Cordova, licence Apache 2.0</a><br />' +
                '<a class="link" href="https://www.npmjs.com/package/cordova-plugin-badge" target="_blank">Cordova Badge Plugin, licence Apache 2.0</a><br />' +
                '<a class="link" href="https://www.npmjs.com/package/cordova-plugin-device" target="_blank">Cordova Device Plugin, licence Apache 2.0</a><br />' +
                '<a class="link" href="https://www.npmjs.com/package/cordova-plugin-network-information" target="_blank">Cordova Network Information Plugin, licence Apache 2.0</a><br />' +
                '<a class="link" href="https://www.npmjs.com/package/cordova-plugin-dialogs" target="_blank">Cordova Dialogs Plugin, licence Apache 2.0</a><br />' +
                '<a class="link" href="https://www.npmjs.com/package/cordova-plugin-file" target="_blank">Cordova File Plugin, licence Apache 2.0</a><br />' +
                '<a class="link" href="https://www.npmjs.com/package/cordova-plugin-geolocation" target="_blank">Cordova Geolocation Plugin, licence Apache 2.0</a><br />' +
                '<a class="link" href="https://www.npmjs.com/package/cordova-plugin-globalization" target="_blank">Cordova Globalization Plugin, licence Apache 2.0</a><br />' +
                '<a class="link" href="https://www.npmjs.com/package/cordova-plugin-inappbrowser" target="_blank">Cordova InAppBrowser Plugin, licence Apache 2.0</a><br />' +
                '<a class="link" href="https://www.npmjs.com/package/cordova-plugin-splashscreen" target="_blank">Cordova Splashscreen Plugin, licence Apache 2.0</a><br />' +
                '<a class="link" href="https://www.npmjs.com/package/cordova-plugin-statusbar" target="_blank">Cordova Statusbar Plugin, licence Apache 2.0</a><br />' +
                '<a class="link" href="https://www.npmjs.com/package/cordova-plugin-whitelist" target="_blank">Cordova Whitelist Plugin, licence Apache 2.0</a><br />' +
                '<a class="link" href="https://www.npmjs.com/package/phonegap-plugin-barcodescanner" target="_blank">PhoneGap BarcodeScanner Plugin, licence MIT</a><br />' +
                '<a class="link" href="https://www.npmjs.com/package/cordova-plugin-calendar" target="_blank">Cordova Calendar Plugin, licence MIT</a><br />' +
                '<a class="link" href="https://github.com/EddyVerbruggen/Custom-URL-scheme" target="_blank">Cordova Custom URL Scheme Plugin, licence MIT</a><br />' +
                '<a class="link" href="https://github.com/edwardgaoyb/cordova-cookie-master" target="_blank">Cordova plugin Cookie Master, licence MIT</a><br />' +
                '<a class="link" href="https://github.com/dpa99c/cordova-custom-config" target="_blank">Cordova Custom Config Plugin, licence MIT</a><br />' +
                '<a class="link" href="https://github.com/dpa99c/cordova-android-support-gradle-release" target="_blank">Cordova Android Support Gradle Release, licence MIT</a><br />' +
                '<a class="link" href="https://github.com/Nexxa/cordova-base64-to-gallery" target="_blank">Cordova Base64 to Gallery Plugin, licence MIT</a><br />' +
                '<a class="link" href="https://github.com/whiteoctober/cordova-plugin-app-version" target="_blank">Cordova App Version Plugin, licence MIT</a><br />' +
                '<a class="link" href="https://www.npmjs.com/package/ionic-plugin-keyboard" target="_blank">Ionic Keyboard Plugin, licence Apache 2.0</a><br />' +
                '<a class="link" href="https://github.com/PolarCape/polarcape-cordova-plugin-document-handler" target="_blank">Cordova Plugin Document Handler, licence MIT</a><br />' +
                '<a class="link" href="https://github.com/katzer/cordova-plugin-local-notifications" target="_blank">Cordova Local Notifications Plugin, licence Apache 2.0</a><br />' +
                '<a class="link" href="https://github.com/lrsjng/kjua" target="_blank">kjua, licence MIT</a><br />' +
                '</p>',
    footer: '<button onclick="GApplication.fermerPopup()" class="btn-flat  waves-effect waves-light">' + GTraductions.getValeur('Fermer') + '</button>'
  }, null, true);
};

})();