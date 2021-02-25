/**
 * @param aNom (description)
 * @param aGenre (description)
 */
function InterfaceProfil (aNom, aGenre) {
  this.nom = aNom;
  this.genre = aGenre;
  this.indexCourant = -1;
  this.profilCourant = {
    serverUrl: '',
    espaceUrl: '',
    nomEtab: '',
    nomEsp: '',
    login: '',
    mdp: '',
    libelle: '',
    bypassCAS: false,
    estCAS: false,
    casURL: '',
    modeJeton: false,
    essai: 0
  };
  this.externalBrowser = null;
}

(function () {
/**
     * Construction de l'interface
     *
     * @returns {String} HTML généré
     */
InterfaceProfil.prototype.construire = function () {
  GApplication.log(GApplication.niveauxLog.TRACE, 'construire()');
  var H = [];
  H.push('<button onclick="', this.nom, '.addProfil();" class="btn-floating waves-effect waves-light" style="position:fixed;bottom:10px;right:10px;" aria-label="', GTraductions.getValeur('ajouterUnProfil'),'"><i class="material-icons icon_plus"></i></button>');
  H.push('<div style="padding:10px;">');
  H.push('<h4 tabIndex="0" class="firstLand">', GTraductions.getValeur('listeDesProfils'), '</h4>');
  H.push('<div style="text-align:center;"><button class="btn-flat waves-effect waves-light" onclick="', this.nom, '.addProfil();">', GTraductions.getValeur('ajouterUnProfil'), '</button></div>');
  H.push('</div>');
  if (GApplication.profils && GApplication.profils.length) {
    H.push('<ul class="collection">');
    for (var lInc = 0; GApplication.profils && lInc < GApplication.profils.length; lInc++) {
      H.push('<li role="button" class="collection-item with-action" onclick="', this.nom, '.visualisationProfil(', lInc, ');">', (!GApplication.profils[lInc].login || !GApplication.profils[lInc].mdp ? '<i class="material-icons icon_warning_sign" style="color:red;"></i>' : ''), '<span class="title">', GApplication.profils[lInc].nomEtab, '</span><br />', GApplication.profils[lInc].nomEsp, ' - ', GApplication.profils[lInc].login, '</a></li>');
    }
    H.push('</ul>');
  }
  return H.join('');
};

InterfaceProfil.prototype.executer = function () {
  var lCaller = JSON.parse(window.sessionStorage.getItem('caller'));
  if (lCaller && lCaller.action && lCaller.action === "setprofil" && lCaller.url) {
    setTimeout((function () {
      if (GApplication.communicationMessage && GApplication.communicationMessage.etat !== GApplication.communicationMessage.genreEtat.EnFermeture) {
        GApplication.communicationMessage.etat = GApplication.communicationMessage.genreEtat.FermetureDemande;
      }
      this.addProfil(lCaller.url);
    }).bind(this), 250);
    window.sessionStorage.removeItem('caller');
  } else if (GApplication.profils.length === 0) {
    this.addProfil();
  }
};

InterfaceProfil.prototype.addProfil = function (aUrl) {
  GApplication.log(GApplication.niveauxLog.TRACE, 'addProfil()');
  if (this.externalBrowser) {
    this.externalBrowser.close();
  }
  this.externalBrowser = null;
  if (window.returnToApp) {
    clearInterval(window.returnToApp);
  }
  if (cordova && cordova.plugins && cordova.plugins.notification && cordova.plugins.notification.local) {
    cordova.plugins.notification.local.clearAll();
  }
  if (GApplication.etatConnexion) {
    this.indexCourant = -1;
    this.profilCourant = {
      serverUrl: '',
      espaceUrl: '',
      nomEtab: '',
      nomEsp: '',
      login: '',
      mdp: '',
      libelle: '',
      bypassCAS: false,
      estCAS: false,
      casURL: '',
      modeJeton: false,
      essai: 0
    };
    var H = [];
    H.push('<div style="padding:1rem;">',
                '<div id="idGroupStart">',
                '<p>',
                GTraductions.getValeur('aideConfiguration'),
                '<br />',
                '<a onclick="cordova.InAppBrowser.open(\'', GTraductions.getValeur('aideVideoURL'), '\', \'_system\');">', GTraductions.getValeur('aideVideo'), '</a>',
                '</p>',
                '<ul class="collection">',
                '<li role="button" tabIndex="0" class="collection-item with-action avatar" onclick="' + this.nom + '.getBarcode();">',
                '<i class="material-icons icon_qr_code"></i><div class="title">', GTraductions.getValeur('flasherCodeJeton'), '</div><div>', GTraductions.getValeur('flasherCodeJetonComplement', ['<i class="material-icons icon_qr_code" style="left:0;"></i>']), '</div>',
                '</li>',
                '</ul>',
                '<p><a tabIndex="0" role="button" onclick="$(\'#idTitreFormProfil\').focus();$(\'#idGroupStart\').hide();$(\'#idGroupButton\').show();">', GTraductions.getValeur('autresMethodes'), '</a></p>',
                '</div>',
                '<ul id="idGroupButton" class="collection" style="display:none;">',
                '<li role="button" tabIndex="0" class="collection-item with-action avatar" onclick="' + this.nom + '.getPosition();">',
                '<i class="material-icons icon_map_marker"></i><div class="title">', GTraductions.getValeur('geolocaliserMoi'), '</div><div>', GTraductions.getValeur('geolocaliserMoiComplement'), '</div>',
                '</li>',
                '<li role="button" tabIndex="0" class="collection-item with-action avatar" onclick="' + this.nom + '.saisirURL();">',
                '<i class="material-icons icon_pencil"></i><div class="title">', GTraductions.getValeur('saisirURL'), '</div><div>', GTraductions.getValeur('saisirURLComplement'), '</div>',
                '</li>',
                '</ul>',
                '<div id="idGroupSelectEtab" style="display:none;">',
                '<select id="idSelectEtab" class="browser-default" style="display:none;" onchange="' + this.nom + '.changeSelect();"></select>',
                '</div>',
                '<div id="idGroupInputURL" style="display:none;">',
                '<div class="input-field inline" style="width:calc(100% - 34px - 5px - 6px);">',
                '<label for="idInputURL">', GTraductions.getValeur('champURLEtab'), '</label>',
                '<input id="idInputURL" type="text" value="', (!!aUrl ? aUrl : ''), '" autocomplete="off" autocorrect="off" autocapitalize="off" spellcheck="false" />',
                '</div>',
                '<button onclick="' + this.nom + '.changeURL()" class="btn-floating btn-flat waves-effect waves-light" aria-label="', GTraductions.getValeur('Valider'), '"><i class="material-icons icon_search"></i></button>',
                '</div>',
                '<div id="idGroupInputCP" style="display:none;">',
                '<div class="input-field inline" style="width:calc(100% - 34px - 5px - 6px);">',
                '<label for="idInputCP">', GTraductions.getValeur('champCPEtab'), '</label>',
                '<input id="idInputCP" type="text" value="" autocomplete="off" autocorrect="off" autocapitalize="off" spellcheck="false" maxlength="5" />',
                '</div>',
                '<button onclick="' + this.nom + '.getListeEtab($(\'#idInputCP\').val())" class="btn-floating btn-flat waves-effect waves-light"><i class="material-icons icon_search"></i></button>',
                '</div>',
                '<div id="idGroupSelectEspace" style="display:none;"></div>',
                '</div>');
    GApplication.ouvrirPopup({
      header: '<h2 id="idTitreFormProfil" role="heading" tabIndex="0">' + GTraductions.getValeur('ajoutProfil') + '</h2>',
      content: H.join(''),
      footer: ''
    }, (function () {
      this.indexCourant = -1;
      this.profilCourant = {
        serverUrl: '',
        espaceUrl: '',
        nomEtab: '',
        nomEsp: '',
        login: '',
        mdp: '',
        libelle: '',
        bypassCAS: false,
        estCAS: false,
        casURL: '',
        modeJeton: false,
        essai: 0
      };
    }).bind(this), true);
    if (aUrl) {
      this.saisirURL();
    } else {
      this.setComboVisible('idGroupStart', []);
    }
  } else {
    navigator.notification.alert(GTraductions.getValeur('horsConnexion'), null, '');
  }
};

/**
     * Remise à zéro du formulaire
     */
InterfaceProfil.prototype.resetFormProfil = function () {
  GApplication.log(GApplication.niveauxLog.TRACE, 'resetFormProfil()');
  $('#idInputURL').val('');
  $('#idSelectEtab').html('');
  $('#idFieldSelectEspace, #idFieldInputLogin').hide();
};


/**
     * Selection dans la liste des établissements
     */
InterfaceProfil.prototype.changeSelect = function () {
  if ($('#idSelectEtab').val() !== '') {
    $('#idInputURL').val($('#idSelectEtab').val());
    this.changeURL();
  } else {
    navigator.notification.alert(GTraductions.getValeur('etabNonRenseigne'), null, '');
  }
};


/**
     * Recupération des informations sur le .Net sur l'URL fournie
     */
InterfaceProfil.prototype.changeURL = function () {
  var lUrl = this.estUrlValide($('#idInputURL').val());
  if (lUrl) {
    $('#idInputURL').val(lUrl.href);
    this.validerURL(lUrl);
  } else {
    navigator.notification.alert(GTraductions.getValeur('validURLEchoue'), null, '');
  }
};


/**
 * Recupération des informations sur le .Net sur l'URL fournie
 * 
 * @param {string} aUrl Correspond au json du qr code (.url)
 * @param {object} aInfoSupp Objet complet du qr code
 */
InterfaceProfil.prototype.validerURL = function (aUrl, aInfoSupp) {
  var eBro = null,
      lThis = this,
      lData = null;

  function _surLoadStop (event) {
    eBro.executeScript({
      code: '(function(){return document.body.innerText;})()'
    }, function (aData) {
      if (aData && aData[0] && aData[0].length) {
        try {
          lData = JSON.parse(aData[0]);
        } catch (e) {
        }
      }
      if (eBro) {
        eBro.close();
      }
    });
  }

  function _surLoadError (event) {
    GApplication.log(GApplication.niveauxLog.ERROR, 'validerURL error : ' + JSON.stringify(event));
    GApplication.log(GApplication.niveauxLog.DEBUG, {nom: 'profil_configuration error infoMobile', url: aUrl, result: event});
    GApplication.fermerLoader();
    navigator.notification.alert(GTraductions.getValeur('etabNonTrouve'), null, '');
    if (eBro) {
      eBro.close();
    }
  }

  function _surExitOK (event) {
    if (lData) {
      lThis.surInfoMobile(aUrl, aInfoSupp, lData);
    }
    if (eBro || lThis.externalBrowser) {
      lThis.externalBrowser = eBro = null;
    }
    GApplication.log(GApplication.niveauxLog.TRACE, 'validerURL - sortie du browser');
  }

  function _surExitVieuxBrowser () {
    lThis.validerURL(aUrl, aInfoSupp);
    if (eBro || lThis.externalBrowser) {
      lThis.externalBrowser = eBro = null;
    }
  }

  // Au cas où il reste un vieux browser d'une tentative précédente
  if (!!this.externalBrowser) {
    this.externalBrowser.removeEventListener('exit', _surExitOK);
    this.externalBrowser.addEventListener('exit', _surExitVieuxBrowser);
    this.externalBrowser.close();
    return;
  }

  if (GApplication.etatConnexion) {
    var lUrl = aUrl.href + GApplication.urlInfoMobile;
    GApplication.log(GApplication.niveauxLog.TRACE, 'validerURL(' + lUrl + ')');
    GApplication.ouvrirLoader(GTraductions.getValeur('recupInfo'), function () {
      navigator.notification.alert(GTraductions.getValeur('tempsDepasse'), null, '');
    });

    if (device.platform.toLowerCase() !== 'windows' || parseInt(device.version) >= 10) {
      eBro = this.externalBrowser = cordova.InAppBrowser.open(lUrl, '_blank', 'usewkwebview=yes,location=no,hidden=yes,zoom=no,toolbar=no,fullscreen=yes,keyboardDisplayRequiresUserAction=no,clearcache=yes,clearsessioncache=yes');
      this.externalBrowser.addEventListener('loadstop', _surLoadStop);
      this.externalBrowser.addEventListener('loaderror', _surLoadError);
      this.externalBrowser.addEventListener('exit', _surExitOK);
    } else { // on passera ici sur windows 8.1 en espérant qu'il n'y ai pas de problème de certificat
      $.ajax({
        dataType: 'json',
        url: lUrl,
        success: this.surInfoMobile.bind(this, aUrl, aInfoSupp),
        error: function (jqXHR, textStatus, errorThrown) {
          GApplication.log(GApplication.niveauxLog.ERROR, 'validerURL : error ajax ' + textStatus + ' message ' + errorThrown.message);
          GApplication.log(GApplication.niveauxLog.DEBUG, {nom: 'profil_configuration error infoMobile', url: aUrl, result: errorThrown});
          GApplication.fermerLoader();
          if (textStatus === 'timeout') {
            navigator.notification.alert(GTraductions.getValeur('tempsDepasse'), null, '');
          } else if (textStatus === 'error') {
            navigator.notification.alert(GTraductions.getValeur('etabNonTrouve'), null, '');
          } else if (textStatus === 'abort') {
            navigator.notification.alert(GTraductions.getValeur('annulationUtil'), null, '');
          } else if (textStatus === 'parsererror') {
            navigator.notification.alert(GTraductions.getValeur('etabNonTrouve'), null, '');
          } else {
            navigator.notification.alert(GTraductions.getValeur('etabNonTrouve'), null, '');
          }
        },
        timeout: 10000
      });
    }
  } else {
    navigator.notification.alert(GTraductions.getValeur('horsConnexion'), null, '');
  }
};

/**
 * Traitement des infos reçues
 * 
 * @param {*} aUrl
 * @param {*} aInfoSupp 
 * @param {object} aJSON Le JSON renvoyé sur infoMobileApp.json
 */
InterfaceProfil.prototype.surInfoMobile = function (aUrl, aInfoSupp, aJSON) {
  var lSelf = this;
  GApplication.log(GApplication.niveauxLog.TRACE, 'surInfoMobile()');
  GApplication.fermerLoader();
  if (aJSON && aJSON.espaces && aJSON.espaces.length) {
    this.profilCourant.nomEtab = aJSON.nomEtab;
    this.profilCourant.bypassCAS = aUrl.bypassCas;
    this.profilCourant.estCAS = aJSON.CAS.actif;
    this.profilCourant.casURL = aJSON.CAS.casURL;
    this.profilCourant.login = aInfoSupp ? aInfoSupp.login : '';
    this.profilCourant.jeton = aInfoSupp ? aInfoSupp.jeton : '';
    GApplication.log(GApplication.niveauxLog.DEBUG, {nom: 'profil_configuration success infoMobile', url: aUrl, result: aJSON});
    if (aUrl.espace && aJSON.espaces.filter(function (aEle) {
      return aEle.URL.indexOf(aUrl.espace) > -1;
    }).length === 1) {
      var lEspace = aJSON.espaces.filter(function (aEle) {
        return aEle.URL.indexOf(aUrl.espace) > -1;
      })[0];
      if (this.profilCourant.jeton) {
        executerFonctionAffichage((function () {
          $('#idGroupSelectEspace').html('<div class="input-field"><h5>' + GTraductions.getValeur('entrerCodeDecodage') + '</h5><em style="display:block;margin-bottom:2rem;">' + GTraductions.getValeur('entrerCodeDecodageDetail') + '</em><div style="text-align:center;">' +
                            '<input type="number" maxlength="4" style="width:50px;" onkeypress="if(event.keyCode === 13)$(this).siblings(\'button:first\').click();"/><br />' +
                            '<button onclick="if($(this).siblings(\'input:first\').val())' + lSelf.nom + '.profilRemplit(\'' + lEspace.nom + '\', \'' + lEspace.URL + '\', $(this).siblings(\'input:first\').val());" class="btn-flat waves-effect waves-light">' + GTraductions.getValeur('Valider') + '</button>' +
                            '</div></div>');
          $('#idGroupSelectEspace input:first').focus();
        }).bind(this));
        this.setComboVisible('idGroupSelectEspace');
      } else {
        setTimeout((function () {
          this.profilRemplit(lEspace.nom, lEspace.URL);
        }).bind(this), 500);
      }
    } else {
      executerFonctionAffichage((function () {
        $('#idGroupSelectEspace').html('<div class="input-field"><h5 role="heading" tabIndex="0">' + GTraductions.getValeur('selectionnerEspace') + '</h5><em style="display:block;margin-bottom:2rem;">' + GTraductions.getValeur('selectionnerEspaceDetails') + '</em><div style="text-align:center;">' + aJSON.espaces.map(function (ele) {
          return '<button onclick="' + lSelf.nom + '.profilRemplit(\'' + ele.nom + '\', \'' + ele.URL + '\');" class="btn-flat waves-effect waves-light">' + ele.nom + '</button>';
        }).join('<br /><br />') + '</div></div>');
      }).bind(this));
      this.setComboVisible('idGroupSelectEspace');
    }
  } else {
    navigator.notification.alert(GTraductions.getValeur('espaceNonTrouve'), null, '');
    GApplication.log(GApplication.niveauxLog.ERROR, 'surInfoMobile() espace non trouvé');
    GApplication.log(GApplication.niveauxLog.DEBUG, {nom: 'profil_configuration error infoMobile', url: aUrl, result: aJSON});
  }
};

/**
     * gestion visibilité combo
     *
     * @param {String} aGroupe id du groupe
     * @param {String[]} aCombo tableau des id a rendre visible
     */
InterfaceProfil.prototype.setComboVisible = function (aGroupe, aCombo) {
  $('[id^="idGroup"]').hide();
  if (aGroupe !== undefined) {
    $('#' + aGroupe).show().focus();
    if (aCombo && aCombo.length) {
      $('#' + aGroupe).find('select').filter('#' + aCombo.join(', #')).show()
        .last().focus().end()
        .end().end()
        .find('label').hide()
        .filter('[for="' + aCombo.join('"], [for="') + '"]').show();
    }
  }
};

/**
     * Saisie direct d'URL
     */
InterfaceProfil.prototype.saisirURL = function () {
  GApplication.log(GApplication.niveauxLog.TRACE, 'saisirURL()');
  this.setComboVisible('idGroupInputURL');
  $('#idInputURL').focus().blur();
};

/**
     * Mise à jour du combo des établissements
     *
     * @param aLat (description)
     * @param aLong (description)
     */
InterfaceProfil.prototype.setListeEtab = function (aLat, aLong) {
  GApplication.log(GApplication.niveauxLog.TRACE, 'getListeEtab()');
  $.ajax('https://www.index-education.com/swie/geoloc.php', {
    crossDomain: true,
    data: {
      data: JSON.stringify({
        "nomFonction": "geoLoc",
        "lat": aLat,
        "long": aLong
      })
    },
    method: 'POST',
    success: (function (lListe) {
      var lRayter = 6356.7523142,
          lRayLong = 6378.137 * Math.cos(aLat * Math.PI / 180);
      lListe = lListe.map(function (ele) {
        var lDLat = (ele.lat - aLat) * (2 * lRayter * Math.PI / 360);
        var lDLong = (ele.long - aLong) * (2 * lRayLong * Math.PI / 360);
        ele.dist = Math.sqrt(Math.pow(lDLat, 2) + Math.pow(lDLong, 2));
        return ele;
      });
      lListe.sort(function (a, b) {
        return a.dist > b.dist ? 1 : a.dist < b.dist ? -1 : a.nomEtab > b.nomEtab ? 1 : a.nomEtab < b.nomEtab ? -1 : 0;
      });
      executerFonctionAffichage((function () {
        $('#idSelectEtab').html('<option disabled selected="selected">' + GTraductions.getValeur('selectionnerEtab') + '</option>' +
                        lListe.map(function (ele) {
                          return ele.nomEtab ? ('<option value="' + ele.url + '">' + ele.nomEtab + (ele.cp ? ' (' + ele.cp + ')' : '') + (ele.dist ? ' ' + (Math.round(ele.dist * 10) / 10) + 'km' : '') + '</option>') : '';
                        }).join('') +
                        (device.platform.toLowerCase() === 'ios' ? '<optgroup label="" disabled></optgroup>' : '') //pour que le texte s'adapte
        );
      }).bind(this));
      GApplication.fermerLoader();
      this.setComboVisible('idGroupSelectEtab', ['idSelectEtab']);
    }).bind(this),
    error: function (jqXHR, textStatus) {
      GApplication.fermerLoader();
      if (textStatus === 'timeout') {
        navigator.notification.alert(GTraductions.getValeur('tempsDepasse'), null, '');
      } else if (textStatus === 'error') {
        navigator.notification.alert(GTraductions.getValeur('serviceNonDispo'), null, '');
      } else if (textStatus === 'abort') {
        navigator.notification.alert(GTraductions.getValeur('annulationUtil'), null, '');
      } else if (textStatus === 'parsererror') {
        navigator.notification.alert(GTraductions.getValeur('serviceNonDispo'), null, '');
      } else {
        navigator.notification.alert(GTraductions.getValeur('serviceNonDispo') + ' (' + jqXHR.status + ')', null, '');
      }
    }
  });
};

/**
 * (description)
 * 
 * @param {string} aNomEsp Nom de l'espace (x)
 * @param {string} aUrlEsp URL de l'espace (url/mobile.x.html)
 * @param {string} code Le code du QR Code (à 4 chiffres)
 */
InterfaceProfil.prototype.profilRemplit = function (aNomEsp, aUrlEsp, aCode) {
  GApplication.log(GApplication.niveauxLog.TRACE, 'profilRempli()');
  this.profilCourant.serverUrl = $('#idInputURL').val();
  this.profilCourant.espaceUrl = aUrlEsp;
  this.profilCourant.nomEsp = aNomEsp;
  this.profilCourant.codeJeton = aCode;
  if (!this.profilCourant.codeJeton && this.profilCourant.estCAS && !this.profilCourant.bypassCAS) {
    // normalement c'est le cas le plus courant
    this.validerProfilCAS();
  } else {
    this.validerProfil(this.profilCourant.bypassCAS || !!this.profilCourant.codeJeton);
  }
};

/**
     * (description)
     */
InterfaceProfil.prototype.editerProfil = function (aIndex) {
  GApplication.log(GApplication.niveauxLog.TRACE, 'editerProfil()');
  this.indexCourant = aIndex;
  this.profilCourant = {
    serverUrl: GApplication.profils[aIndex].serverUrl,
    espaceUrl: GApplication.profils[aIndex].espaceUrl,
    nomEtab: GApplication.profils[aIndex].nomEtab,
    nomEsp: GApplication.profils[aIndex].nomEsp,
    login: GApplication.profils[aIndex].login,
    mdp: GApplication.profils[aIndex].mdp,
    jeton: GApplication.profils[aIndex].jeton,
    libelle: GApplication.profils[aIndex].libelle,
    bypassCAS: GApplication.profils[aIndex].bypassCAS,
    estCAS: GApplication.profils[aIndex].estCAS,
    casURL: GApplication.profils[aIndex].casURL,
    modeJeton: GApplication.profils[aIndex].modeJeton,
    essai: 0
  };
  if (this.profilCourant.estCAS && !this.profilCourant.bypassCAS) {
    this.validerProfilCAS();
  } else {
    this.validerProfil(this.profilCourant.bypassCAS);
  }
};

/**
     * Validation du profil en mode standard
     */
InterfaceProfil.prototype.validerProfil = function (aBypassCAS) {
  GApplication.log(GApplication.niveauxLog.TRACE, 'validerProfil()');

  // en premier on va détruire les cookies
  try {
    cookieMaster.clearCookies(
      (function () {
        GApplication.log(GApplication.niveauxLog.TRACE, 'validerProfil - supp cookie ok');
      }).bind(this),
      (function () {
        GApplication.log(GApplication.niveauxLog.ERROR, 'validerProfil - erreur supp cookie');
      }).bind(this)
    );
    this.validerProfilApresSuppCookies(aBypassCAS);
  } catch (e) {
    GApplication.log(GApplication.niveauxLog.ERROR, 'validerProfil - erreur supp cookie : ' + e.message);
    this.validerProfilApresSuppCookies(aBypassCAS);
  }
};

/**
     * Validation du profil en mode standard apres avoir essayé de supprimer les cookies
     */
InterfaceProfil.prototype.validerProfilApresSuppCookies = function (aBypassCAS) {
  GApplication.log(GApplication.niveauxLog.TRACE, 'validerProfilApresSuppCookies()');
  if (GApplication.etatConnexion) {
    if (this.profilCourant.serverUrl[this.profilCourant.serverUrl.length - 1] !== '/') {
      this.profilCourant.serverUrl += '/';
    }
    var eBro, lThis = this;
    GApplication.ouvrirLoader(GTraductions.getValeur('chargementDuSite'), function () {
      navigator.notification.alert(GTraductions.getValeur('tempsDepasse'), null, '');
    });
    // Dans le cas de l'hébergement il peut y avoir le cookie, pour être sur de le détruire on passe par la page commune
    if (this.profilCourant.serverUrl.indexOf('index-education.net') > -1) {
      var eDummyBro = cordova.InAppBrowser.open(this.profilCourant.serverUrl + '?fd=1' + (aBypassCAS ? '&bydlg=A6ABB224-12DD-4E31-AD3E-8A39A1C2C335' : '') + (this.profilCourant.estCAS && this.profilCourant.bypassCAS ? '&login=true' : ''), '_blank', 'usewkwebview=yes,location=no,hidden=yes,zoom=no,toolbar=no,fullscreen=yes,keyboardDisplayRequiresUserAction=no,clearcache=yes,clearsessioncache=yes');
      eDummyBro.addEventListener('loadstop', function (event) {
        if (eDummyBro) {
          eDummyBro.close();
        }
      });
      eDummyBro.addEventListener('loaderror', function (event) {
        if (eDummyBro) {
          eDummyBro.close();
        }
      });
      eDummyBro.addEventListener('exit', function (event) {
        if (eDummyBro) {
          eDummyBro = null;
        }
      });
    }
    // on n'utilise pas login=true car si le serveur n'est pas configuré pour, on ne pourra pas se connecter avec le jeton mobile
    eBro = this.externalBrowser = cordova.InAppBrowser.open(this.profilCourant.serverUrl + this.profilCourant.espaceUrl + '?fd=1' + (aBypassCAS ? '&bydlg=A6ABB224-12DD-4E31-AD3E-8A39A1C2C335' : '') + (this.profilCourant.estCAS && this.profilCourant.bypassCAS ? '&login=true' : ''), '_blank', 'usewkwebview=yes,location=no,hidden=yes,zoom=no,toolbar=no,fullscreen=yes,keyboardDisplayRequiresUserAction=no,clearcache=yes,clearsessioncache=yes');
    this.externalBrowser.addEventListener('loadstop', function (event) {
      var lObjectURL = {};
      if (!lThis.profilCourant.jeton) {
        eBro.executeScript({
          code: '(function(){window.hookAccesDepuisAppli = function(){this.passerEnModeValidationAppliMobile(\'' + (lThis.profilCourant.login.replace("'", "\\'") || '') + '\', \'' + device.uuid + '\');};return \'\';})()'
        });
      } else {
        eBro.executeScript({
          code: '(function(){window.hookAccesDepuisAppli = function(){this.passerEnModeValidationAppliMobile(\'' + (lThis.profilCourant.login.replace("'", "\\'") || '') + '\', \'' + device.uuid + '\', \'' + lThis.profilCourant.jeton + '\', \'' + lThis.profilCourant.codeJeton + '\');};return \'\';})()'
        });
      }
      eBro.executeScript({
        code: '(function(){return JSON.stringify(location);})();'
      }, function (aData) {
        if (aData && aData[0] && aData[0].length) {
          lObjectURL = JSON.parse(aData[0]);
        }
      });
      if (!lThis.profilCourant.jeton) {
        GApplication.fermerLoader();
        GApplication.cacherPopup();
        eBro.show();
      }
      if (window.returnToApp) {
        clearInterval(window.returnToApp);
      }
      window.returnToApp = setInterval(function () {
        try {
          if (eBro) {
            eBro.executeScript({
              code: '(function(){return window && window.loginState ? JSON.stringify(window.loginState) : \'\';})();'
            }, lThis.onLogin.bind(lThis, lObjectURL.href));
          } else if (window.returnToApp) {
            clearInterval(window.returnToApp);
          }
        } catch (e) {
          GApplication.log(GApplication.niveauxLog.ERROR, '- validerProfilApresSuppCookies erreur : ' + e.message);
          GApplication.log(GApplication.niveauxLog.DEBUG, {nom: 'profil_configuration error validerProfil', url: lObjectURL.href, result: e});
          if (window.returnToApp) {
            clearInterval(window.returnToApp);
          }
        }
      }, 250);
    });
    this.externalBrowser.addEventListener('loaderror', function (event) {
      var lUrl = lThis.estUrlValide(event.url);
      // on va autoriser les erreurs sur iOS l'event loaderror est déclenché même si la page arrive à se charger
      if (device.platform.toLowerCase() === 'ios' && event.type === 'loaderror' && lThis.profilCourant.serverUrl.toLowerCase().indexOf(lUrl.host.toLowerCase()) > -1) {
        GApplication.log(GApplication.niveauxLog.TRACE, 'validerProfil - _surLoadError bypass ' + JSON.stringify(event));
        GApplication.log(GApplication.niveauxLog.DEBUG, {nom: 'profil_configuration warning validerProfil', url: lThis.profilCourant.serverUrl, result: event});
      } else {
        GApplication.fermerLoader();
        if (eBro) {
          eBro.close();
        }
        navigator.notification.alert(GTraductions.getValeur('erreurChargementPage'), null, '');
        GApplication.log(GApplication.niveauxLog.ERROR, 'validerProfilApresSuppCookies - erreur chargement site : ' + JSON.stringify(event));
        GApplication.log(GApplication.niveauxLog.DEBUG, {nom: 'profil_configuration error validerProfil', url: lThis.profilCourant.serverUrl, result: event});
      }
    });
    this.externalBrowser.addEventListener('exit', function (event) {
      if (window.returnToApp) {
        clearInterval(window.returnToApp);
      }
      GApplication.montrerPopup();
      GApplication.log(GApplication.niveauxLog.TRACE, 'validerProfilApresSuppCookies - sortie du site');
      if (eBro || lThis.externalBrowser) {
        lThis.externalBrowser = eBro = null;
      }
    });
  } else {
    navigator.notification.alert(GTraductions.getValeur('horsConnexion'), null, '');
  }
};

/**
     * Validation du profil en mode CAS
     */
InterfaceProfil.prototype.validerProfilCAS = function () {
  var eBro, lThis = this,
      lJetonCas;

  function _surExit (event) {
    GApplication.fermerLoader();
    GApplication.fermerPopup();
    if (window.returnToApp) {
      clearInterval(window.returnToApp);
    }
    GApplication.log(GApplication.niveauxLog.TRACE, 'validerProfilCAS - sortie du site - event ' + JSON.stringify(event));
    if (eBro || lThis.externalBrowser) {
      lThis.externalBrowser = eBro = null;
    }
  }

  function _surLoadError (event) {
    var lUrl = lThis.estUrlValide(event.url);
    // on va autoriser les erreurs sur iOS l'event loaderror est déclenché même si la page arrive à se charger
    if (device.platform.toLowerCase() === 'ios' && event.type === 'loaderror') {
      GApplication.log(GApplication.niveauxLog.TRACE, 'validerProfilCAS - _surLoadError bypass ' + JSON.stringify(event));
      GApplication.log(GApplication.niveauxLog.DEBUG, {nom: 'profil_configuration warning validerProfilCAS', url: lThis.profilCourant.serverUrl, result: event});
      if (lThis.profilCourant.serverUrl.toLowerCase().indexOf(lUrl.host.toLowerCase()) > -1) {
        _surChargementCAS();
      }
    } else {
      GApplication.fermerLoader();
      if (eBro) {
        eBro.close();
      }
      navigator.notification.alert(GTraductions.getValeur('erreurChargementENT'), null, '');
      GApplication.log(GApplication.niveauxLog.ERROR, 'validerProfilCAS - erreur chargement site ' + JSON.stringify(event));
      GApplication.log(GApplication.niveauxLog.DEBUG, {nom: 'profil_configuration error validerProfilCAS', url: lThis.profilCourant.serverUrl, result: event});
    }
  }

  function _surChargementCAS (event) {
    GApplication.log(GApplication.niveauxLog.TRACE, '- _surChargementCAS()');
    try {
      eBro.executeScript({
        code: '(function(){return JSON.stringify(location);})();'
      }, function (aData) {
        // {"ancestorOrigins":{},"href":"https://cas.mon-ent-occitanie.fr/login?service=https:%2F%2F0310047H.index-education.net%2Fpronote%2Fmobile.eleve.html%3Ffd=1","origin":"https://cas.mon-ent-occitanie.fr","protocol":"https:","host":"cas.mon-ent-occitanie.fr","hostname":"cas.mon-ent-occitanie.fr","port":"","pathname":"/login","search":"?service=https:%2F%2F0310047H.index-education.net%2Fpronote%2Fmobile.eleve.html%3Ffd=1","hash":""}
        if (aData && aData[0] && aData[0].length) {
          aData[0] = JSON.parse(aData[0]);
        }
        // Si on est encore sur l'appMobileInfo
        if (aData && aData[0] && aData[0].href.toLowerCase().indexOf(lThis.profilCourant.serverUrl.toLowerCase() + GApplication.urlInfoMobile.toLowerCase()) === 0) {
          // _surChargementInfoMobile ne nous a pas redirigé
          GApplication.fermerLoader();
          eBro.close();
          GApplication.fermerPopup();
          navigator.notification.alert(GTraductions.getValeur('erreurChargementENT'), null, '');
          GApplication.log(GApplication.niveauxLog.ERROR, 'validerProfilCAS _surChargementCAS - erreur redirection CAS');
          GApplication.log(GApplication.niveauxLog.DEBUG, {nom: 'profil_configuration error validerProfilCAS', url: lThis.profilCourant.serverUrl, result: {message: 'erreur redirection CAS', data: aData}});
        } else if (aData && aData[0] && lThis.profilCourant.serverUrl.toLowerCase().indexOf(aData[0].host.toLowerCase()) > -1) {
          GApplication.log(GApplication.niveauxLog.TRACE, '- _surChargementCAS - retour sur le .net');
          if (window.returnToApp) {
            clearInterval(window.returnToApp);
          }
          window.returnToApp = setInterval(function () {
            if (eBro) {
              eBro.executeScript({
                code: '(function(){return window.loginState ? JSON.stringify(window.loginState) : \'\';})();'
              }, lThis.onLogin.bind(lThis, aData[0].href));
            } else if (window.returnToApp) {
              clearInterval(window.returnToApp);
            }
          }, 250);
        } else {
          GApplication.log(GApplication.niveauxLog.TRACE, '- _surChargementCAS - arrivee sur l\'ent');
          GApplication.fermerLoader();
          GApplication.cacherPopup();
          eBro.show();
          // windows ouvre les liens en target _blank en externe
          if (device.platform.toLowerCase() === 'windows') {
            eBro.executeScript({code: 'setTimeout(function(){[].slice.call(document.getElementsByTagName("a")).forEach(function(ele){ele.target = "";});}, 750);'});
          }
        }
      });
    } catch (e) {
      GApplication.log(GApplication.niveauxLog.ERROR, '- validerProfilCAS _surChargementCAS erreur : ' + e.message);
      GApplication.log(GApplication.niveauxLog.DEBUG, {nom: 'profil_configuration error validerProfilCAS', url: lThis.profilCourant.serverUrl, result: e});
      if (window.returnToApp) {
        clearInterval(window.returnToApp);
      }
    }
  }

  function _surChargementInfoMobile (event) {
    GApplication.log(GApplication.niveauxLog.TRACE, '- _surChargementInfoMobile()');
    eBro.executeScript({
      code: '(function(){try{' +
                    'var lJetonCas = "", lJson = JSON.parse(document.body.innerText);' +
                    'lJetonCas = !!lJson && !!lJson.CAS && lJson.CAS.jetonCAS;' +
                    'document.cookie = "appliMobile=;expires=" + new Date(0).toUTCString();' +
                    'if(!!lJetonCas) {' +
                    'document.cookie = "validationAppliMobile="+lJetonCas+";expires=" + new Date(new Date().getTime() + (5*60*1000)).toUTCString();' +
                    'document.cookie = "uuidAppliMobile=' + device.uuid + ';expires=" + new Date(new Date().getTime() + (5*60*1000)).toUTCString();' +
                    'document.cookie = "ielang=' + GTraductions.lcid[GTraductions.lang] + ';expires=" + new Date(new Date().getTime() + (365*24*60*60*1000)).toUTCString();' +
                    'return "ok";' +
                    '} else return "ko";' +
                    '} catch(e){return "ko";}})();'
    }, function (aData) {
      if (aData[0] === 'ok') {
        // on a le cookie pour le retour, on charge le site pour être authentifié par CAS
        eBro.executeScript({
          code: 'location.assign("' + lThis.profilCourant.serverUrl + lThis.profilCourant.espaceUrl + '?fd=1")'
        });
        eBro.removeEventListener('loadstop', _surChargementInfoMobile);
        eBro.addEventListener('loadstop', _surChargementCAS);
      } else {
        GApplication.fermerLoader();
        if (eBro) {
          eBro.close();
        }
        GApplication.fermerPopup();
        navigator.notification.alert(GTraductions.getValeur('erreurChargementPage'), null, '');
        GApplication.log(GApplication.niveauxLog.ERROR, 'validerProfilCAS - erreur affectation cookie');
        GApplication.log(GApplication.niveauxLog.DEBUG, {nom: 'profil_configuration error validerProfilCAS', url: lThis.profilCourant.serverUrl, result: {message: 'erreur affectation cookie'}});
      }
    });
  }

  function _lancerProcess () {
    GApplication.log(GApplication.niveauxLog.TRACE, '- _lancerProcess()');
    // en premier on va charger une page pour mettre le cookie
    eBro = lThis.externalBrowser = cordova.InAppBrowser.open(lThis.profilCourant.serverUrl + GApplication.urlInfoMobile, '_blank', 'usewkwebview=yes,location=no,hidden=yes,zoom=no,toolbar=no,fullscreen=yes,clearcache=no,clearsessioncache=no,keyboardDisplayRequiresUserAction=no');
    eBro.addEventListener('loadstop', _surChargementInfoMobile);
    eBro.addEventListener('loaderror', _surLoadError);
    eBro.addEventListener('exit', _surExit);
  }
  GApplication.log(GApplication.niveauxLog.TRACE, 'validerProfilCAS()');
  if (GApplication.etatConnexion) {
    if (this.profilCourant.serverUrl[this.profilCourant.serverUrl.length - 1] !== '/') {
      this.profilCourant.serverUrl += '/';
    }
    GApplication.ouvrirLoader(GTraductions.getValeur('chargementDeLENT'), function () {
      navigator.notification.alert(GTraductions.getValeur('erreurChargementENT'), null, '');
    });
    // en premier on va détruire les cookies
    try {
      cookieMaster.clearCookies(
                    function () {
                      GApplication.log(GApplication.niveauxLog.TRACE, 'validerProfilCAS - supp cookie ok');
                    },
                    function () {
                      GApplication.log(GApplication.niveauxLog.ERROR, 'validerProfilCAS - erreur supp cookie');
                    }
      );
      _lancerProcess();
    } catch (e) {
      GApplication.log(GApplication.niveauxLog.ERROR, 'validerProfilCAS - erreur supp cookie : ' + e.message);
      _lancerProcess();
    }
  } else {
    navigator.notification.alert(GTraductions.getValeur('horsConnexion'), null, '');
  }
};

/**
     * (description)
     */
InterfaceProfil.prototype.onLogin = function (aURL, aState) {
  if (aState && aState[0]) {
    aState[0] = JSON.parse(aState[0]);
    GApplication.log(GApplication.niveauxLog.TRACE, 'onLogin()');
    if (window.returnToApp) {
      clearInterval(window.returnToApp);
    }
    if (this.externalBrowser) {
      this.externalBrowser.close();
    }
    this.externalBrowser = null;
    // On a réussi on va enregistrer le profil
    if (aState[0].status === 0 && !!this.profilCourant.serverUrl) {
      GApplication.log(GApplication.niveauxLog.TRACE, '- onLogin() - success');
      var lObjURLCourant = this.estUrlValide(this.profilCourant.serverUrl + this.profilCourant.espaceUrl);
      var aObjURL = this.estUrlValide(aURL);
      if (lObjURLCourant.protocol !== aObjURL.protocol || lObjURLCourant.host !== aObjURL.host || lObjURLCourant.pathname !== aObjURL.pathname || lObjURLCourant.espace !== aObjURL.espace) {
        GApplication.log(GApplication.niveauxLog.TRACE, '- onLogin() - changement d\'URL ' + (this.profilCourant.serverUrl + this.profilCourant.espaceUrl) + ' -> ' + (aObjURL.protocol + '//' + aObjURL.host + aObjURL.pathname + aObjURL.espace));
        this.profilCourant.serverUrl = aObjURL.protocol + '//' + aObjURL.host + aObjURL.pathname;
        this.profilCourant.espaceUrl = aObjURL.espace;
      }
      this.profilCourant.login = aState[0].login;
      this.profilCourant.mdp = aState[0].mdp;
      this.profilCourant.libelle = aState[0].libelle;
      this.profilCourant.modeJeton = !!this.profilCourant.codeJeton && !!this.profilCourant.jeton;
      delete this.profilCourant.codeJeton;
      delete this.profilCourant.jeton;
      GApplication.profilCourant = this.indexCourant; // pour ajouter un profil
      // blindage des cas de rebond
      if (GApplication.profilCourant === -1) {
        var lClesProfils = GApplication.profils.map(function (aEle) {
          return aEle.serverUrl + aEle.espaceUrl + aEle.login;
        });
        GApplication.profilCourant = lClesProfils.indexOf(this.profilCourant.serverUrl + this.profilCourant.espaceUrl + this.profilCourant.login);
      }
      if (GApplication.profilCourant > -1) {
        GApplication.profils[GApplication.profilCourant] = this.profilCourant;
      } else {
        GApplication.profilCourant = GApplication.profils.push(this.profilCourant) - 1;
      }
      GApplication.profils = GApplication.profils.filter(_filtrerProfil);
      GApplication.ecrireProfils(function () {
        GApplication.montrerPopup();
        GApplication.fermerPopup();
        GApplication.chargerInterface(GApplication.interfaces.accueil);
      });
      GApplication.log(GApplication.niveauxLog.DEBUG, {nom: 'profil_configuration success login', url: this.profilCourant.serverUrl, result: {}});
    } else if (aState[0].status === 1 && !this.profilCourant.jeton) {
      // il y a eu un problème, on propose de ré-essayer
      GApplication.log(GApplication.niveauxLog.TRACE, '- onLogin() - fail');
      var lThis = this;
      navigator.notification.confirm(aState[0].message, function (aNumBouton) {
        if (parseInt(aNumBouton) === 1 && lThis.profilCourant.essai < 3) {
          lThis.profilCourant.essai++;
          lThis.profilRemplit(lThis.profilCourant.nomEsp, lThis.profilCourant.espaceUrl);
        }
      }, '', [GTraductions.getValeur('Reessayer'), GTraductions.getValeur('Annuler')]);
    }
  }
};

var _filtrerProfil = function (aEle) {
  return !!aEle.serverUrl && !!aEle.espaceUrl && !!aEle.nomEsp && !!aEle.login && !!aEle.mdp;
};

/**
     * (description)
     *
     * @param aIndex (description)
     */
InterfaceProfil.prototype.visualisationProfil = function (aIndex) {
  GApplication.log(GApplication.niveauxLog.TRACE, 'visualisationProfil() : ' + aIndex);
  if (parseInt(aIndex) > -1 && parseInt(aIndex) < GApplication.profils.length) {
    var H = [];
    H.push('<div style="padding:0.5rem;">',
                '<p>', GTraductions.getValeur('visualisationProfilEtab', [GApplication.profils[aIndex].nomEtab]), '<br /><br />',
                GTraductions.getValeur('visualisationProfilURL', ['<span class="selectBlock">' + GApplication.profils[aIndex].serverUrl + GApplication.profils[aIndex].espaceUrl + (GApplication.profils[aIndex].bypassCAS ? '?login=true' : '') + '</span>']),
                '</p>',
                '<p style="text-align:center;">', kjua({
                  text: GApplication.profils[aIndex].serverUrl + (GApplication.profils[aIndex].bypassCAS ? '?login=true' : '')
                }).outerHTML, '</p>',
                '<p><label>',
                GTraductions.getValeur('profilParDefaut'), ' : ',
                '<div class="switch"><label>', GTraductions.getValeur('Non'), '<input type="checkbox" ', (GApplication.profils[aIndex].estParDefaut ? 'checked' : ''), ' onchange="', this.nom, '.changeDefautProfil(', aIndex, ', this.checked);" /><span class="lever"></span>', GTraductions.getValeur('Oui'), '</label></div>',
                '</label></p>',
                '</div>');
    GApplication.ouvrirPopup({
      header: '<h2>' + GTraductions.getValeur('titreVisualisationProfil', [GApplication.profils[aIndex].login]) + '</h2>',
      content: H.join(''),
      footer: ([(this.estProfilEditable(GApplication.profils[aIndex]) ? '<button onclick="' + this.nom + '.editerProfil(' + aIndex + ');" class="btn-flat waves-effect waves-light">' + GTraductions.getValeur('Editer') + '</button>' :
                                                                        '<button onclick="' + this.nom + '.getBarcode();" class="btn-flat waves-effect waves-light">' + GTraductions.getValeur('flasherCodeJeton') + '</button>'),
                '<button onclick="' + this.nom + '.validationSuppressionProfil(' + aIndex + ');" class="btn-flat waves-effect waves-light">' + GTraductions.getValeur('Supprimer') + '</button>']).join('')
    }, null, true);
  }
};

/**
     * (description)
     *
     * @param aIndex (description)
     */
InterfaceProfil.prototype.estProfilEditable = function (aProfil) {
  return (!aProfil.login || !aProfil.mdp) && !(aProfil.estCAS && !aProfil.bypassCAS && aProfil.modeJeton);
};

/**
     * (description)
     *
     * @param aIndex (description)
     */
InterfaceProfil.prototype.validationSuppressionProfil = function (aIndex) {
  var lSelf = this;
  var lIndex = parseInt(aIndex);
  var _finishDeleteProfil = function () {
    if (lSelf && lSelf.objComm && lSelf.objComm.onExitBrowser) {
      lSelf.objComm.onExitBrowser();
    }
    GApplication.fermerPopup();
    GApplication.chargerInterface(GApplication.interfaces.profils);
    lSelf.objComm = undefined;
  };

  navigator.notification.confirm(
            GTraductions.getValeur('confirmationSuppressionProfil', [GApplication.profils[lIndex].login]),
            function (aBouton) {
              if (aBouton === 1) {
                GApplication.log(GApplication.niveauxLog.DEBUG, {nom: 'profil_configuration success deleteProfil', url: GApplication.profils[lIndex].serverUrl});

                var lTempProfil = GApplication.profils.splice(lIndex, 1);
                GApplication.profils = GApplication.profils.filter(_filtrerProfil);
                GApplication.profilCourant = -1;
                GApplication.ecrireProfils();

                if (GApplication.configUtil.avecNotification && (GApplication.tokenFCM || GApplication.tokenHMS) && lSelf.estProfilEditable(lTempProfil)) {
                  lSelf.objComm = new ObjetCommMessage(lTempProfil[0], {
                    callbackAuth: (function () {
                      lSelf.objComm.postToken(true);
                      _finishDeleteProfil();
                    }),
                    callbackLoadError: (function () {
                      _finishDeleteProfil();
                    })
                  });
                } else {
                  _finishDeleteProfil();
                }
              }
            },
            '', [GTraductions.getValeur('Oui'), GTraductions.getValeur('Non')]
  );
};

/**
     * bascule le profil par defaut et désactive les autres
     *
     * @param aIndex (description)
     */
InterfaceProfil.prototype.changeDefautProfil = function (aIndex, aChecked) {
  for (var i = 0, lNb = GApplication.profils.length; i < lNb; i++) {
    if (aIndex === i) {
      GApplication.profils[i].estParDefaut = aChecked;
    } else {
      GApplication.profils[i].estParDefaut = false;
    }
  }
  GApplication.ecrireProfils();
};

/**
     * Sur geolocation
     */
InterfaceProfil.prototype.getPosition = function () {
  var lThis = this;
  GApplication.log(GApplication.niveauxLog.TRACE, 'getPosition()');
  GApplication.ouvrirLoader();
  navigator.geolocation.getCurrentPosition(function (aPosition) {
    GApplication.log(GApplication.niveauxLog.TRACE, 'getPosition (lat:' + aPosition.coords.latitude + ' - long:' + aPosition.coords.longitude + ')');
    lThis.setListeEtab(aPosition.coords.latitude, aPosition.coords.longitude);
  }, function (aError) {
    GApplication.fermerLoader();
    GApplication.log(GApplication.niveauxLog.ERROR, 'getPosition (' + aError.code + ') ' + aError.message);
    navigator.notification.alert(GTraductions.getValeur('localisationEchouee'), null, '');
  }, {
    maximumAge: 600000,
    timeout: 5000,
    enableHighAccuracy: true
  });
};

/**
 * vérifier une url
 * 
 * @param {string} aUrl Une URL de serveur Pronote
 */
InterfaceProfil.prototype.estUrlValide = function (aUrl) {
  var lParser = document.createElement('a'),
      lParserPath, lEspace = false,
      lBypassCas = false;
  aUrl = aUrl.toLowerCase();
  lParser.href = aUrl;
  if (lParser.href.indexOf(aUrl) !== 0 || lParser.protocol.indexOf('http') === -1) {
    return false;
  }
  lParserPath = lParser.pathname.split('/');
  if (lParserPath[lParserPath.length - 1] !== '') {
    if (lParserPath[lParserPath.length - 1].indexOf('html') !== -1) {
      lEspace = lParserPath.pop();
    }
    lParserPath.push('');
    lParser.pathname = lParserPath.join('/');
  }
  if (lParser.search.toLowerCase().indexOf('login=true') !== -1) {
    lBypassCas = true;
  }
  lParser.search = '';
  lParser.hash = '';
  lParser.href = lParser.href.replace(/[?#]{1,2}$/, '');
  return {
    protocol: lParser.protocol,
    hostname: lParser.hostname,
    port: lParser.port,
    pathname: lParser.pathname,
    host: lParser.host,
    href: lParser.href,
    espace: lEspace,
    bypassCas: lBypassCas
  };
};

/**
     * Scanner un codebar pour récupérer une url
     */
InterfaceProfil.prototype.getBarcode = function () {
  GApplication.log(GApplication.niveauxLog.TRACE, 'getBarcode ()');
  var lThis = this;
  cordova.plugins.barcodeScanner.scan(
            function (result) {
              GApplication.log(GApplication.niveauxLog.TRACE, 'getBarcode (text:' + result.text + ' - format:' + result.format + ' - cancel:' + result.cancelled + ')');
              if (!result.cancelled && !!result.text) {
                var lUrl = lThis.estUrlValide(result.text);
                if (lUrl) {
                  $('#idInputURL').val(lUrl.href);
                  lThis.validerURL(lUrl);
                } else {
                  var lJetonConnexion = false;
                  try {
                    lJetonConnexion = JSON.parse(result.text);
                  } finally {
                    if (lJetonConnexion && lJetonConnexion.url && lJetonConnexion.login && lJetonConnexion.jeton) {
                      lJetonConnexion.url = lThis.estUrlValide(lJetonConnexion.url);
                      $('#idInputURL').val(lJetonConnexion.url.href);
                      lThis.validerURL(lJetonConnexion.url, lJetonConnexion);
                    } else {
                      navigator.notification.alert(GTraductions.getValeur('scanURLEchoue'), null, '');
                    }
                  }
                }
              }
              GApplication.montrerPopup();
            },
            function (error) {
              GApplication.log(GApplication.niveauxLog.ERROR, 'getBarcode (error:' + error + ')');
              GApplication.montrerPopup();
              navigator.notification.alert(GTraductions.getValeur('scanEchoue'), null, '');
            }
  );
  GApplication.cacherPopup();
};

})();