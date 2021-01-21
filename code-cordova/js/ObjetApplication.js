function ObjetApplication () {
  // config
  this.supportEmail = 'pronote-mobile@index-education.fr';
  this.urlInfoMobile = 'InfoMobileApp.json?id=0D264427-EEFC-4810-A9E9-346942A862A4';
  this.etatConnexion = true;
  this.timeOutConnexion = null;
  this.timeOutVeille = null;
  this.timeOutLoader = null;
  this.version = 'inconnue';
  this.dureeTimeOutConnexion = 3 * 60 * 1000;
  this.dureeTimeOutVeille = 0.5 * 60 * 1000;
  this.tokenFCM = null;
  this.tokenHMS = null;
  this.firstLaunch = true;
  this.cookie = '';

  this.interfaces = {
    accueil: {
      genre: 0,
      cleLibelle: 'Accueil',
      Interface: window.InterfaceAccueil,
      menu: true,
      classIcon: 'icon_user'
    },
    profils: {
      genre: 1,
      cleLibelle: 'MenuProfils',
      Interface: window.InterfaceProfil,
      menu: true,
      classIcon: 'icon_group'
    },
    parametres: {
      genre: 2,
      cleLibelle: 'MenuParametres',
      Interface: window.InterfaceParametres,
      menu: true,
      classIcon: 'icon_cog'
    },
    aide: {
      genre: 3,
      cleLibelle: 'MenuAPropos',
      Interface: window.InterfaceAide,
      menu: true,
      classIcon: 'icon_question'
    }
  };
  this.subscriptionDefinitions = {
    /*exemple: false*/
  };
  this.configUtil = {
    init: false,
    avecNotification: false,
    avecRemoteConfig: false,
    avecAnalytics: false,
    avecPerformance: false,
    avecCrashlytics: false,
    subscriptions: this.subscriptionDefinitions
  };
  this.analyticsInitialise = false;
  this.crashlyticsInitialise = false;

  this.menuOnglet = null;
  this.interface = null;
  this.idPopup = 'idPopup';
  this.popupOpen = false;
  this.idLoaderPopup = 'idPopupLoader';
  this.loaderOpen = false;
  this.communicationMessage = null;

  this.niveauxLog = {
    OFF: 0,
    FATAL: 1,
    ERROR: 2,
    WARN: 3,
    INFO: 4,
    DEBUG: 5,
    TRACE: 6,
    ALL: 7
  };
  //this.debugInConsole = true;
  // application
  this.profils = [];
  this.profilCourant = -1;
}

(function () {
ObjetApplication.prototype.log = function (aNiveau, aInfo) {
  if (aNiveau <= this.niveauxLog.WARN && this.configUtil.avecCrashlytics && this.crashlyticsInitialise) {
    window.FCMHMSPlugin.logError(JSON.stringify(aInfo).substr(0, 100));
  } else if (this.configUtil.avecAnalytics && this.analyticsInitialise) {
    window.FCMHMSPlugin.logEvent(aInfo.nom || this.strNiveauLog(aNiveau), JSON.stringify(aInfo).substr(0, 100));
  }
  if (this.debugInConsole === true) {
    console.dir(Object.keys(this.niveauxLog)[aNiveau] + ' - ' + aInfo);
  }
};

ObjetApplication.prototype.strNiveauLog = function (aNiveau) {
  return Object.keys(this.niveauxLog).find(function (key) {
    return GApplication.niveauxLog[key] === aNiveau;
  });
};

ObjetApplication.prototype.init = function () {
  GApplication.log(GApplication.niveauxLog.TRACE, 'init()');
  this.cookie = document.cookie;

  // Redirection des erreurs vers le système de log
  window.onerror = function (msg, url, num) {
    GApplication.log(GApplication.niveauxLog.ERROR, {type: 'JSerror', msg: msg.substr(0, 70), url: url, num:num});
    return false;
  };
  // Récupération asynchrone du numero de version de l'app
  cordova.getAppVersion.getVersionNumber().then((function (version) {
    if (version) {
      this.version = version;
    }
  }).bind(this));
  // Affectation du titre
  executerFonctionAffichage((function () {
    $('#idTitre').html(GTraductions.getValeur('titreApplication'));
  }).bind(this));
  // Chargement du menu
  this.chargerMenuOnglet();

  /* Gestion de l'état de la connexion */
  this.etatConnexion = navigator.connection.type !== Connection.NONE;
  document.addEventListener('online', (function () {
    this.etatConnexion = navigator.connection.type !== Connection.NONE;
    if (this.timeOutConnexion !== null) {
      clearTimeout(this.timeOutConnexion);
      this.timeOutConnexion = null;
      if (this.communicationMessage) {
        this.communicationMessage.mettreEnAttente(false);
      }
    }
  }).bind(this), false);
  document.addEventListener('offline', (function () {
    this.etatConnexion = navigator.connection.type !== Connection.NONE;
    if (this.communicationMessage) {
      this.communicationMessage.mettreEnAttente(true);
      this.timeOutConnexion = setTimeout((function () {
        this.communicationMessage.etat = this.communicationMessage.genreEtat.FermetureDemande;
      }).bind(this), this.dureeTimeOutConnexion);
    }
  }).bind(this), false);

  document.addEventListener('resume', (function () {
    this.etatConnexion = navigator.connection.type !== Connection.NONE;
    if (this.timeOutVeille !== null) {
      clearTimeout(this.timeOutVeille);
      this.timeOutVeille = null;
    }
  }).bind(this), false);
  document.addEventListener('pause', (function () {
    this.etatConnexion = navigator.connection.type !== Connection.NONE;
    if (this.communicationMessage) {
      this.timeOutVeille = setTimeout((function () {
        this.communicationMessage.etat = this.communicationMessage.genreEtat.FermetureDemande;
      }).bind(this), this.dureeTimeOutVeille);
    }
  }).bind(this), false);

  /* Gestion de la position du popup si le clavier est ouvert */
  window.addEventListener('keyboardDidShow', (function (aParam) {
    if (!!this.communicationMessage && !!this.communicationMessage.browser && this.communicationMessage.etat === this.communicationMessage.genreEtat.Connecte) {
      this.communicationMessage.browser.executeScript({code: '$("body").css("margin-bottom", ' + aParam.keyboardHeight + ')'});
    }
  }).bind(this), false);
  window.addEventListener('keyboardDidHide', (function () {
    if (!!this.communicationMessage && !!this.communicationMessage.browser) {
      this.communicationMessage.browser.executeScript({code: '$("body").css("margin-bottom", "")'});
    }
  }).bind(this), false);

  this.lireProfils((function () {
    this.lireConfigUtil((function () {
      this.firebaseConfig();
      this.initialisationSubscriptions();
      this.chargerInterface(this.interfaces.accueil);
    }).bind(this));
  }).bind(this));
};

ObjetApplication.prototype.initParametres = function () {
  this.configUtil.init = true;
  this.configUtil.avecNotification = true;
  this.configUtil.avecRemoteConfig = true;
  this.configUtil.avecAnalytics = true;
  this.configUtil.avecPerformance = true;
  this.configUtil.avecCrashlytics = true;
  GApplication.ecrireConfigUtil();
  GApplication.firebaseConfig();
};

ObjetApplication.prototype.initialisationSubscriptions = function () {
  if (this.configUtil.avecNotification) {
    var lSubscriptionsLues = this.configUtil.subscriptions;
    var lSubscriptions = this.subscriptionDefinitions;
    for (var key in lSubscriptionsLues) {
    //On recupere seulement les valeurs des clés existantes
      if (lSubscriptions[key] !== undefined) {
        lSubscriptions[key] = lSubscriptionsLues[key];
      }
    }
    this.configUtil.subscriptions = lSubscriptions;
  }
};

ObjetApplication.prototype.firebaseConfig = function () {
  GApplication.log(GApplication.niveauxLog.TRACE, 'firebaseConfig');
  if (this.configUtil.avecNotification) {
    /* pour iOS il faut demander la permission pour les notifications */
    if (device.platform.toLowerCase() === 'ios') {
      window.FCMHMSPlugin.hasPermission(function (data) {
        // on redemande à chaque fois, si on a déjà l'autorisation cela ne fera rien
        window.FCMHMSPlugin.grantPermission();
      });
    }
    window.FCMHMSPlugin.initFcmHms(function () {
      GApplication.log(GApplication.niveauxLog.TRACE, 'firebaseConfig initFcmHms : success');
      window.FCMHMSPlugin.getToken(function (aToken) {
        GApplication.log(GApplication.niveauxLog.TRACE, 'firebaseConfig getToken success');
        window.FCMHMSPlugin.isGMS(
          function(aIsGMS){
            if(aIsGMS) GApplication.tokenFCM = aToken;
            else window.FCMHMSPlugin.isHMS(
              function(aIsHMS){
                if(aIsHMS) GApplication.tokenHMS = aToken;
              }, function (error) {
                GApplication.log(GApplication.niveauxLog.ERROR, 'firebaseConfig isHMS : ' + JSON.stringify(error));
              }
            );
          }, function (error) {
            GApplication.log(GApplication.niveauxLog.ERROR, 'firebaseConfig isGMS : ' + JSON.stringify(error));
          }
        );
      }, function (error) {
        GApplication.log(GApplication.niveauxLog.ERROR, 'firebaseConfig getToken : ' + JSON.stringify(error));
      });
      window.FCMHMSPlugin.onTokenRefresh(function (aToken) {
        GApplication.log(GApplication.niveauxLog.TRACE, 'firebaseConfig tokenRefresh success');
        window.FCMHMSPlugin.isGMS(
          function(aIsGMS){
            if(aIsGMS) GApplication.tokenFCM = aToken;
            else window.FCMHMSPlugin.isHMS(
              function(aIsHMS){
                if(aIsHMS) GApplication.tokenHMS = aToken;
              }, function (error) {
                GApplication.log(GApplication.niveauxLog.ERROR, 'firebaseConfig isHMS : ' + JSON.stringify(error));
              }
            );
          }, function (error) {
            GApplication.log(GApplication.niveauxLog.ERROR, 'firebaseConfig isGMS : ' + JSON.stringify(error));
          }
        );
        /*if (!!GApplication.communicationMessage) {
          GApplication.communicationMessage.postToken();
        }*/
      }, function (error) {
        GApplication.log(GApplication.niveauxLog.ERROR, 'firebaseConfig tokenRefresh : ' + JSON.stringify(error));
      });
      window.FCMHMSPlugin.onNotificationOpen(function (notification) {
        GApplication.log(GApplication.niveauxLog.TRACE, 'firebaseConfig onNotificationOpen success');
        if (notification && !notification.tap) {
          cordova.plugins.notification.local.schedule({
            priority: 2,
            smallIcon: 'res://notif_smallicon',
            icon: 'res://notif_icon',
            foreground: true,
            title: notification && notification.aps && notification.aps.alert ? notification.aps.alert.title : notification.title,
            text: notification && notification.aps && notification.aps.alert ? notification.aps.alert.body : notification.body,
            vibrate: true
          });
        } else {
          GApplication.firstLaunch = false;
        }
      }, function (error) {
        GApplication.log(GApplication.niveauxLog.ERROR, 'firebaseConfig onNotificationOpen : ' + JSON.stringify(error));
      });
    }, function (error) {
      GApplication.log(GApplication.niveauxLog.ERROR, 'firebaseConfig initFirebase : ' + JSON.stringify(error));
    });
  }
  if (false && this.configUtil.avecRemoteConfig) { // à réactiver quand on en aura l'utilité
    window.FCMHMSPlugin.initRemoteConfig();
  }
  if (this.configUtil.avecAnalytics) {
    window.FCMHMSPlugin.initAnalytics(function () {
      this.analyticsInitialise = true;
    }.bind(this));
  }
  if (this.configUtil.avecPerformance) {
    window.FCMHMSPlugin.initPerformance();
  }
  if (this.configUtil.avecCrashlytics) {
    window.FCMHMSPlugin.initCrashlytics(function () {
      this.crashlyticsInitialise = true;
    }.bind(this));
  }
};

ObjetApplication.prototype.lireConfigUtil = function (aCallback) {
  GApplication.log(GApplication.niveauxLog.TRACE, 'lireConfigUtil()');

  if (NativeStorage) {
    NativeStorage.getItem('configUtil', (function (data) {
      Object.assign(this.configUtil, data);
      if(this.configUtil.avecFCM !== undefined){ // passage version avec huawei
        this.configUtil.avecNotification = this.configUtil.avecFCM;
        this.configUtil.avecFCM = undefined;
      }
      GApplication.log(GApplication.niveauxLog.TRACE, 'lireConfigUtil() NativeStorage ok');
      if ($.isFunction(aCallback)) {
        aCallback();
      }
    }).bind(this), (function (error) {
      GApplication.log(GApplication.niveauxLog.ERROR, 'lireConfigUtil() NativeStorage : '+JSON.stringify(error));
      NativeStorage.setItem("configUtil", this.configUtil, (function () {}).bind(this), function () {
        GApplication.log(GApplication.niveauxLog.ERROR, 'lireConfigUtil() NativeStorage.setItem');
      });
      if ($.isFunction(aCallback)) {
        aCallback();
      }
    }).bind(this));
  }
};

ObjetApplication.prototype.ecrireConfigUtil = function (aCallback) {
  GApplication.log(GApplication.niveauxLog.TRACE, 'ecrireConfigUtil()');
  if (NativeStorage) {
    NativeStorage.setItem('configUtil', this.configUtil, function (data) {
      GApplication.log(GApplication.niveauxLog.TRACE, 'ecrireConfigUtil() NativeStorage ok');
    }, function (error) {
      GApplication.log(GApplication.niveauxLog.ERROR, 'ecrireConfigUtil() NativeStorage : '+JSON.stringify(error));
    });
  } else {
    GApplication.log(GApplication.niveauxLog.ERROR, 'ecrireConfigUtil() no NativeStorage');
  }

  if ($.isFunction(aCallback)) {
    aCallback();
  }
};

ObjetApplication.prototype.lireProfils = function (aCallback) {
  GApplication.log(GApplication.niveauxLog.TRACE, 'lireProfils()');
  var lConfig = {};

  if (NativeStorage) {
    NativeStorage.getItem('profils', (function (data) {
      Object.assign(lConfig, data);
      GApplication.log(GApplication.niveauxLog.TRACE, 'lireProfils() NativeStorage ok');
      this.apreslireProfils(lConfig, aCallback);
    }).bind(this), (function (error) {
      GApplication.log(GApplication.niveauxLog.ERROR, 'lireProfils() NativeStorage : '+JSON.stringify(error));
      lConfig = {
        profils: [],
        dernierProfil: -1
      };
      NativeStorage.setItem("profils", lConfig, (function () {}).bind(this), function () {
        GApplication.log(GApplication.niveauxLog.ERROR, 'lireProfils() NativeStorage.setItem');
      });
      this.apreslireProfils(lConfig, aCallback);
    }).bind(this));
  } else {
    GApplication.log(GApplication.niveauxLog.ERROR, 'lireProfils() no NativeStorage');
    this.apreslireProfils(lConfig, aCallback);
  }
};

ObjetApplication.prototype.apreslireProfils = function (aConfig, aCallback) {
  GApplication.log(GApplication.niveauxLog.TRACE, 'apreslireProfils : '+JSON.stringify(aConfig));
  if (!!aConfig && aConfig.profils) {
    this.profils = [];
    this.profilCourant = -1;
    for (var lInc = 0; aConfig.profils && lInc < aConfig.profils.length; lInc++) {
      this.profils.push(aConfig.profils[lInc]);
    }
  }
  if (aConfig && $.isNumeric(aConfig.dernierProfil)) {
    this.profilCourant = aConfig.dernierProfil;
  } else if (this.profils.length) {
    this.profilCourant = 0;
  }

  if ($.isFunction(aCallback)) {
    aCallback();
  }
};

ObjetApplication.prototype.chargerProfil = function (aProfil) {
  aProfil = parseInt(aProfil);
  if ($.isNumeric(aProfil)) {
    this.profilCourant = aProfil;
  }
  var lProfil = this.profils[this.profilCourant];

  GApplication.log(GApplication.niveauxLog.DEBUG, {nom: "connect success", url: lProfil.serverUrl + lProfil.espaceUrl});

  this.etatConnexion = navigator.connection.type !== Connection.NONE;
  if (this.etatConnexion) {
    if (lProfil.estParDefaut === undefined && this.getProfilParDefaut() === false) { // si le profil n'a pas de valeur par défaut et qu'aucun autre non plus, on propose de le mettre
      navigator.notification.confirm(GTraductions.getValeur('selectionnerProfilDefaut'), function (aBouton) {
        lProfil.estParDefaut = aBouton === 1;
        GApplication.chargerProfil(aProfil);
      }, '', [GTraductions.getValeur('Oui'), GTraductions.getValeur('Non')]);
      return;
    } else if (lProfil.estParDefaut === undefined) { // fallback, si le profil n'a pas de valeur par défaut mais qu'un autre si, on met à false car il ne peut y en avoir qu'un
      lProfil.estParDefaut = false;
    }
    this.firstLaunch = false;
    this.communicationMessage = new ObjetCommMessage(lProfil);
  } else {
    navigator.notification.alert(GTraductions.getValeur('horsConnexion'), null, '');
  }
};

ObjetApplication.prototype.getProfilParDefaut = function () {
  if (this.profils.length > 0) {
    for (var i = 0; i < this.profils.length; i++) {
      if (!!this.profils[i].login && !!this.profils[i].mdp && this.profils[i].estParDefaut === true) {
        return i;
      }
    }
    return false;
  } else {
    return false;
  }
};

ObjetApplication.prototype.ecrireProfils = function (aCallback) {
  GApplication.log(GApplication.niveauxLog.TRACE, 'ecrireProfils()');
  var lConfigPourFichier = {
    profils: this.profils,
    dernierProfil: this.profilCourant
  };
  if (NativeStorage) {
    NativeStorage.setItem("profils", lConfigPourFichier, function () {
      GApplication.log(GApplication.niveauxLog.TRACE, 'ecrireProfils() profils écrit');
      if ($.isFunction(aCallback)) {
        aCallback();
      }
    }, function () {
      GApplication.log(GApplication.niveauxLog.ERROR, 'ecrireProfils() NativeStorage.setItem');
    });
  } else {
    GApplication.log(GApplication.niveauxLog.ERROR, 'ecrireProfils() - no NativeStorage');
  }
};

ObjetApplication.prototype.chargerInterface = function (aInterface) {
  if(this.cookie) document.cookie = this.cookie;
  if (!aInterface || !$.isNumeric(aInterface.genre) || !aInterface.Interface) {
    GApplication.log(GApplication.niveauxLog.ERROR, 'chargerInterface - ' + JSON.stringify(aInterface));
    return;
  }
  GApplication.log(GApplication.niveauxLog.TRACE, 'chargerInterface(' + aInterface.genre + ')');
  if(window.FCMHMSPlugin){
    window.FCMHMSPlugin.setScreenName(aInterface.cleLibelle);
  }
  if (this.interface) {
    if ($.isFunction(this.interface.detruire)) {
      this.interface.detruire();
    }
    this.firstLaunch = false;
  }
  $('#idMenuOnglets').sidenav('close');
  this.fermerLoader();
  this.fermerPopup();
  this.interface = new aInterface.Interface('GApplication.interface', aInterface.genre);
  executerFonctionAffichage((function () {
    $('#idContent').html(this.interface.construire());
    if ($.isFunction(this.interface.executer)) {
      this.interface.executer();
    }
    $('#idContent .firstLand').focus();
    // $('#idBoutonAccueil').css('display', this.interface.genre === GApplication.interfaces.accueil.genre ? 'none' : '');
  }).bind(this));
};

ObjetApplication.prototype.chargerMenuOnglet = function () {
  this.menuOnglet = new InterfaceMenuOnglet('GApplication.menuOnglet', this.surMenuOnglet.bind(this));
  executerFonctionAffichage((function () {
    $('#idMenuOnglets').html(this.menuOnglet.construire());
    $('#idBoutonMenuOnglets').show();
    $('#idMenuOnglets').sidenav({
      edge: 'right',
      draggable: true,
      onOpenEnd: function(){$('#idBoutonMenuOnglets .firstLand').focus();}
    });
  }).bind(this));
};

ObjetApplication.prototype.surMenuOnglet = function (aGenreOnglet) {
  for (var i in this.interfaces) {
    if (this.interfaces[i].genre === aGenreOnglet) {
      this.chargerInterface(this.interfaces[i]);
      break;
    }
  }
};

ObjetApplication.prototype.avecExitApp = function () {
  return navigator.app && navigator.app.exitApp;
};

ObjetApplication.prototype.exitApp = function () {
  navigator.notification.confirm(GTraductions.getValeur('confirmationQuitter'), function (aBouton) {
    if (aBouton === 1) {
      navigator.app.exitApp();
    }
  }, '', [GTraductions.getValeur('Oui'), GTraductions.getValeur('Non')]);
};

ObjetApplication.prototype.ouvrirPopup = function (aObjetHtml, aSurFermer, aAvecFermer) {
  var lPopup = $('#' + this.idPopup),
      lContent = lPopup.children('.modal-content'),
      lHeader = lPopup.children('.modal-header'),
      lFooter = lPopup.children('.modal-footer'),
      lParam = {
        noScroll: false,
        noClose: !aAvecFermer,
        onOpen: undefined,
        onClose: aSurFermer
      };

  executerFonctionAffichage((function () {
    lHeader.html(aObjetHtml.header);
    lContent.html(aObjetHtml.content);
    lFooter.html(aObjetHtml.footer);

    if (lHeader.html()) {
      lPopup.addClass('modal-fixed-header');
      if (!lParam.noClose) {
        $('#' + this.idPopup + ' > .modal-close').removeClass('ui-icon-delete-grey').addClass('ui-icon-delete-white').show();
      } else {
        $('#' + this.idPopup + ' > .modal-close').hide();
      }
      lHeader.show();
    } else {
      lPopup.removeClass('modal-fixed-header');
      if (!lParam.noClose) {
        $('#' + this.idPopup + ' > .modal-close').show();
      } else {
        $('#' + this.idPopup + ' > .modal-close').hide();
      }
      lHeader.hide();
    }
    if (lFooter.html()) {
      lPopup.addClass('modal-fixed-footer');
      lFooter.show();
    } else {
      lPopup.removeClass('modal-fixed-footer');
      lFooter.hide();
    }
    if (lParam.noScroll) {
      lPopup.addClass('modal-no-scroll');
    } else {
      lPopup.removeClass('modal-no-scroll');
    }
    lPopup.find('.collapsible').collapsible();
    lPopup.find('select').formSelect();
    lPopup.find('input[type="text"], textarea').characterCounter();
    if (lPopup.hasClass('open')) {
      if ($.isFunction(lParam.onOpen)) {
        lParam.onOpen();
      }
    } else {
      this.popupOpen = true;
      if (M.Modal.getInstance(lPopup.get(0))) {
        M.Modal.getInstance(lPopup.get(0)).destroy();
        lPopup = $('#' + this.idPopup);
      }
      lPopup.modal({
        dismissible: !lParam.noClose,
        onOpenStart: $.isFunction(lParam.onOpen) ? lParam.onOpen : undefined,
        onCloseEnd: (function () {
          if ($.isFunction(lParam.onClose)) {
            lParam.onClose();
          }
          this.popupOpen = false;
        }).bind(this)
      }).modal('open');
    }
    if (lParam.noScroll) {
      $('body').css('overflow', '');
    }
  }).bind(this));
};

ObjetApplication.prototype.fermerPopup = function () {
  if (this.popupOpen) {
    $('#' + this.idPopup).modal('close');
  }
};

ObjetApplication.prototype.cacherPopup = function () {
  if (this.popupOpen) {
    $('#' + this.idPopup).hide();
    $('.modal-overlay').hide();
  }
};

ObjetApplication.prototype.montrerPopup = function () {
  if (this.popupOpen) {
    $('#' + this.idPopup).show();
    $('.modal-overlay').show();
  }
};

ObjetApplication.prototype.ouvrirLoader = function (aTexte, aToDoTimeout) {
  $('#idPreloader').show();
  if (aTexte) {
    $('#idPreloaderText').text(aTexte);
  }
  if (this.timeOutLoader) {
    clearTimeout(this.timeOutLoader);
  }
  this.timeOutLoader = setTimeout(GApplication.fermerLoader.bind(GApplication, aToDoTimeout), 30000);
};

ObjetApplication.prototype.fermerLoader = function (aToDoClose) {
  $('#idPreloader').hide();
  $('#idPreloaderText').text('');
  if (this.timeOutLoader) {
    clearTimeout(this.timeOutLoader);
  }
  this.timeOutLoader = null;
  if (aToDoClose && $.isFunction(aToDoClose)) {
    aToDoClose();
  }
};
})();