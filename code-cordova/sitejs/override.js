var lAvecRequire = false;
try {
  lAvecRequire = $.isFunction(require);
} catch (e) {
  lAvecRequire = false;
}

if (lAvecRequire) {
  window.ObjetAffichagePageMenuOnglets = require('InterfacePageMenuOnglets.js');
}
if (window.ObjetMenuOnglet_Mobile || window.ObjetAffichagePageMenuOnglets) {
  var lNomObjet = window.ObjetMenuOnglet_Mobile ? 'ObjetMenuOnglet_Mobile' : 'ObjetAffichagePageMenuOnglets';
  window[lNomObjet].prototype.composeOngletMobileApp = function () {
    var lHTML = [];

    lHTML.push(
            '<li onclick="window.messageData.push({action: \'changerProfil\'});" class="collection-item with-action collection-static-item">',
            '<span style="display:inline-block;position:relative;">', GTraductions.getValeur('ChangerProfils'), '</span>',
            '</li>');

    /*lHTML.push(
            '<li onclick="window.messageData.push({action: \'editerProfil\'});" class="collection-item with-action collection-static-item">',
            '<span style="display:inline-block;position:relative;">', GTraductions.getValeur('MenuProfils'), '</span>',
            '</li>');*/

    return lHTML.join('');
  };

  window[lNomObjet].prototype.seDeconnecterAppliMobile = function () {
    window.messageData.push({action: 'exitApp'});
  };
}

if (lAvecRequire) {
  window.ObjetAffichagePageBulletin = require('InterfacePageBulletin.js');
}
if (window.ObjetAffichagePageBulletin && ObjetAffichagePageBulletin.prototype.actionAppliMobile) { // PN2020
  ObjetAffichagePageBulletin.prototype.actionAppliMobile = function () {
    if (!this.idBoutonGraph) {
      this.idBoutonGraph = this.Nom + '.idBoutonGraph';
    }
    if ($('#' + this.idBoutonGraph.escapeJQ()).length === 0) {
      $('#' + GInterface.idZoneSelection.escapeJQ()).append('<div style="display:inline-block;padding:8px 0;width:48px;"><a id="' + this.idBoutonGraph + '" target="_blank"><button class="btn-floating btn-flat waves-effect waves-light"><i class="material-icons icon_bar_chart" style="margin:0;"></i></button></a></div>').children('div:first').css({display: 'inline-block', width: 'calc(100% - 48px)'});
    }
    if (this.graph) {
      $('#' + this.idBoutonGraph.escapeJQ()).attr('href', 'data:image/png;base64,' + this.graph).show();
    } else {
      $('#' + this.idBoutonGraph.escapeJQ()).attr('href', '').hide();
    }
  };
}

if (lAvecRequire) {
  window.ObjetAffichagePageAgenda_Mobile = require('InterfacePageAgenda.js');
}
if (window.ObjetAffichagePageAgenda_Mobile) {
  ObjetAffichagePageAgenda_Mobile.prototype.doForMobileApp = function () {
    var lThis = this;
    $('#' + this.Nom.escapeJQ() + ' [data-numero]').append('<i class="icon_nouvel_evenement" style="position:absolute;bottom:5px;right:5px;font-size:22px;"></i>').on('click', 'i', function () {
      var lEvent = lThis.listeEvenements.GetElementParNumeroEtGenre($(this).parent().data('numero'), parseInt($(this).parent().data('genre')));
      if (lEvent && lEvent.publie) {
        window.messageData.push({
          action: 'calendarEvent',
          event: {
            titre: lEvent.GetLibelle(),
            start: lEvent.DateDebut.toISOString(),
            stop: lEvent.DateFin.toISOString(),
            note: lEvent.Commentaire
          }
        });
      }
    });
  };
}

(function () {
$(document).on('click', '*:not(.tab) > a[href][target="_blank"], *:not(.tab) > a[href]:not([target])', function (aEvent) {
  webkit.messageHandlers.cordova_iab.postMessage(JSON.stringify({action: 'openLink', link: aEvent.currentTarget.href}));
  aEvent.preventDefault();
  aEvent.stopImmediatePropagation();
  return false;
});

window.open = function () {
  return function (url/*, target, options*/) {
    webkit.messageHandlers.cordova_iab.postMessage(JSON.stringify({action: 'openLink', link: url}));
  };
}();

})();