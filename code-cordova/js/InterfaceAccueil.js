function InterfaceAccueil (aNom, aGenre) {
  this.nom = aNom;
  this.genre = aGenre;
}

(function () {
InterfaceAccueil.prototype.construire = function () {
  GApplication.log(GApplication.niveauxLog.TRACE, 'getInterfaceAccueil()');
  var H = [];
  H.push('<div style="height:100%;vertical-align:middle;"></div>');
  H.push('<div style="text-align:center;vertical-align:middle;">');
  H.push('<img src="images/PRONOTEPapillons.svg" style="width:50%;" role="presentation" /><br />');
  if (GApplication.profils.length === 0) {
    H.push('<button class="btn-floating waves-effect waves-light" onclick="GApplication.chargerInterface(GApplication.interfaces.profils)" style="position:fixed;bottom:10px;right:10px;" aria-label="' + GTraductions.getValeur('AideNouveauProfil') + '"><i class="material-icons icon_plus"></i></button>');
    H.push('<div class="text-align:center;"><button class="firstLand btn-flat waves-effect waves-light" onclick="GApplication.chargerInterface(GApplication.interfaces.profils)">' + GTraductions.getValeur('AideNouveauProfil') + '</button></div>');
  } else if (GApplication.profils.filter(function (aEle) {
    return !!aEle.login && !!aEle.mdp;
  }).length === 0) {
    H.push('<p>' + GTraductions.getValeur('AidePasDeProfils') + '</p>');
  } else {
    H.push('<p class="firstLand" tabIndex="0">' + GTraductions.getValeur('selectionnerProfilChargement') + '</p>');
  }
  H.push('</div>');
  if (GApplication.profils.length !== 0 && GApplication.profils.filter(function (aEle) {
    return !!aEle.login && !!aEle.mdp;
  }).length !== 0) {
    H.push('<ul class="collection">');
    for (var lInc = 0; GApplication.profils && lInc < GApplication.profils.length; lInc++) {
      if (!!GApplication.profils[lInc].login && !!GApplication.profils[lInc].mdp) {
        H.push('<li role="button" class="collection-item with-action" onclick="GApplication.chargerProfil(', lInc, ');"><span class="title">', GApplication.profils[lInc].nomEtab, '</span><br />', GApplication.profils[lInc].nomEsp, ' - ', (GApplication.profils[lInc].libelle || GApplication.profils[lInc].login), '</li>');
      }
    }
    H.push('</ul>');
  }
  return H.join('');
};

InterfaceAccueil.prototype.executer = function () {
  var lCaller = JSON.parse(window.sessionStorage.getItem('caller'));
  if (lCaller && lCaller.action && lCaller.action === "setprofil") {
    if (GApplication && GApplication.communicationMessage && GApplication.communicationMessage.browser) {
      GApplication.communicationMessage.browser.close();
    }
    for (var lInc = 0; GApplication.profils && lInc < GApplication.profils.length; lInc++) {
      if (lCaller.url === GApplication.profils[lInc].serverUrl + GApplication.profils[lInc].espaceUrl) {
        GApplication.chargerProfil(lInc);
        return;
      }
    }
    GApplication.chargerInterface(GApplication.interfaces.profils);
  } else if (GApplication.firstLaunch && GApplication.getProfilParDefaut() !== false) {
    GApplication.chargerProfil(GApplication.getProfilParDefaut());
  }

  if (!GApplication.configUtil.init) {
    var lBody = [];
    lBody.push('<div style="padding:1rem;">',
                  '<div>', GTraductions.getValeur('textInitialisationParametres'), '</div>',
                  '</div>');
    var lFooter = [];
    lFooter.push('<button onclick="GApplication.fermerPopup();GApplication.chargerInterface(GApplication.interfaces.parametres);" class="btn-flat waves-effect waves-light">', GTraductions.getValeur('parametres'), '</button>',
                  '<button style="margin-left: 1rem;" onclick="GApplication.fermerPopup();GApplication.initParametres()" class="btn waves-effect waves-light">', GTraductions.getValeur('accepter'), '</button>');
    GApplication.ouvrirPopup(
      {
        header: '<h2 id="idTitreFormConfig">' + GTraductions.getValeur('initialisationParametres') + '</h2>',
        content: lBody.join(''),
        footer: lFooter.join('')
      },
      null,
      false
    );
  }
};
})();