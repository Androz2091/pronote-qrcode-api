function InterfaceMenuOnglet(aNom, aCallback) {
  this.nom = aNom;
  this.callback = aCallback;
  this.genreAction = {
    profil: 0
  };
}

InterfaceMenuOnglet.prototype.construire = function () {
  GApplication.log(GApplication.niveauxLog.TRACE, 'construire()');
  var lContent = [],
    lInc;

  lContent.push(
    '<section class="global-menu-container ">',
    '<header class="user-container">',
    '<div class="user-container-profil">',
    '<div class="membre-photo_container">',
    '<div class="membre-photo"><img src="images/mobile/ldpi.png" alt="logo" role="presentation" /></div>',
    '<span class="label-membre firstLand" role="heading" tabIndex="0">' + GTraductions.getValeur('titreApplication') + '</span>',
    '</div>',
    '</div>',
    '</header>',
    '<div class="menu-container">',
    '<ul class="menu-liste collection collapsible" role="menu">'
  );

  for (lInc in GApplication.interfaces) {
    var lInterface = GApplication.interfaces[lInc];
    if (lInterface.menu) {
      lContent.push(
        '<li role="menuitem" tabIndex="0" class="collection-item with-action" onclick="' + this.nom + '.callback(' + lInterface.genre + ')">',
        lInterface.classIcon ? '<i class="material-icons ' + lInterface.classIcon + '"></i>' : '',
        '<span style="display:inline-block;position:relative;">', GTraductions.getValeur(lInterface.cleLibelle), '</span>',
        '</li>');
    }
  }
  lContent.push(
    '</ul>',
    '</div>',
    '</section>',
    '<section class="btn-commands-container">'
  );
  lContent.push('<div class="home-action-conteneur">',
    '<div role="button" tabIndex="0" class="toggler-btn" onclick="$(\'#idMenuOnglets\').sidenav(\'close\')">',
    '<i class="material-icons icon_reorder">', GTraductions.getValeur('Fermer'), '</i>',
    '</div>',
    '</div>'
  );
  if (GApplication.avecExitApp()) {
    lContent.push('<div class="cta-mobile-conteneur">',
      '<hr />',
      '<div role="button" tabIndex="0" class="toggler-btn" onclick="GApplication.exitApp()">',
      '<i class="material-icons icon_off">', GTraductions.getValeur('Quitter'), '</i>',
      '</div>'
    );
  }
  lContent.push('</section>');

  return lContent.join('');
};