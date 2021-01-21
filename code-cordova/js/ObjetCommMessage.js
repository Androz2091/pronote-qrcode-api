function ObjetCommMessage (aProfil, aCallbackParam) {
  this.genreEtat = {
    Instancie: 0,
    EnChargement: 1,
    Connecte: 2,
    EnFermeture: 3,
    FermetureDemande: 4
  };
  this.profil = aProfil;
  this.browser = null;
  this.etat = this.genreEtat.Instancie;
  this.connexion();
  this.timeoutReturn = null;
  this.lastTimeoutReturn = null;
  this.watchdogReturn = 0;
  this.timeoutRefresh = null;
  this.refreshRate = 3 * 60 * 1000;
  this.callbackLoadError = aCallbackParam ? (aCallbackParam.callbackLoadError || false) : false;
  this.callbackAuth = aCallbackParam ? (aCallbackParam.callbackAuth || false) : false;

  this.watchdog = setInterval((function () {
    if (this.etat === this.genreEtat.Connecte) {
      if ((this.timeoutReturn === null || this.timeoutReturn === this.lastTimeoutReturn) && this.watchdogReturn === 3) {
        GApplication.log(GApplication.niveauxLog.ERROR, 'watchdog 3x');
        this.watchdogReturn = 0;
        this.waitMessageData();
      } else if (this.timeoutReturn === null || this.timeoutReturn === this.lastTimeoutReturn) {
        this.watchdogReturn++;
      } else {
        this.watchdogReturn = 0;
      }
      this.lastTimeoutReturn = this.timeoutReturn;
    }
  }).bind(this), 2500);
}

(function () {
ObjetCommMessage.prototype.connexion = function () {
  var lThis = this;

  function _connect () {
    lThis.browserCallbacks = {
      'loadstop' : lThis.onLoadStop.bind(lThis),
      'loaderror': lThis.onLoadError.bind(lThis),
      'exit'     : lThis.onExit.bind(lThis),
      'message'  : lThis.onMessage.bind(lThis)
    };
    lThis.browser = cordova.InAppBrowser.open(lThis.profil.serverUrl + lThis.profil.espaceUrl + '?fd=1&bydlg=A6ABB224-12DD-4E31-AD3E-8A39A1C2C335' + (lThis.profil.estCAS && lThis.profil.bypassCAS ? '&login=true' : ''), '_blank', 'usewkwebview=yes,location=no,hidden=yes,zoom=no,toolbar=no,fullscreen=yes,clearcache=no,clearsessioncache=no,keyboardDisplayRequiresUserAction=no', lThis.browserCallbacks);
  }

  GApplication.ouvrirLoader(GTraductions.getValeur('chargementDuSite'), function () {
    navigator.notification.alert(GTraductions.getValeur('tempsDepasse'), null, '');
  });

  if (lThis.etat !== lThis.genreEtat.FermetureDemande) {
    this.etat = this.genreEtat.EnChargement;
  }

  var lBrowserCookie = cordova.InAppBrowser.open(this.profil.serverUrl + GApplication.urlInfoMobile, '_blank', 'usewkwebview=yes,location=no,hidden=yes,zoom=no,toolbar=no,fullscreen=yes,clearcache=no,clearsessioncache=no,keyboardDisplayRequiresUserAction=no');
  lBrowserCookie.addEventListener('loadstop', (function (event) {
    lBrowserCookie.executeScript({
      code: '(function(){try{' +
                    (this.profil.estCAS && !this.profil.bypassCAS ? 'document.cookie = "appliMobile=1;expires=" + new Date(new Date().getTime() + (365*24*60*60*1000)).toUTCString();' : '') +
                    'document.cookie = "ielang=' + GTraductions.lcid[GTraductions.lang] + ';expires=" + new Date(new Date().getTime() + (365*24*60*60*1000)).toUTCString();' +
                    'return "ok";' +
                    '}catch(e){return JSON.stringify(e);}})();'
    }, function (aData) {
      if (lBrowserCookie) {
        lBrowserCookie.close();
      }
      if (aData[0] !== 'ok') {
        GApplication.log(GApplication.niveauxLog.ERROR, 'erreur cookie : '+aData[0]);
      }
    });
  }).bind(this));

  lBrowserCookie.addEventListener('loaderror', function (event) {
    GApplication.fermerLoader();
    if (lBrowserCookie) {
      lBrowserCookie.close();
    }
    navigator.notification.alert(GTraductions.getValeur('erreurChargementPage'), null, '');
    GApplication.log(GApplication.niveauxLog.ERROR, 'connexion chargement site : ' + JSON.stringify(event));
  });

  lBrowserCookie.addEventListener('exit', function (event) {
    if (lBrowserCookie) {
      lBrowserCookie = null;
    }
    setTimeout(_connect, 50);
  });
};

ObjetCommMessage.prototype.onLoadError = function (event) {
  GApplication.fermerLoader();
  this.browser.close();
  navigator.notification.alert(GTraductions.getValeur('erreurChargementPage'), null, '');
  GApplication.log(GApplication.niveauxLog.ERROR, 'ObjetCommMessage _connect : ' + JSON.stringify(event));
  if (this.callbackLoadError) {
    this.callbackLoadError();
  }
}

ObjetCommMessage.prototype.onLoadStop = function (event) {
  if (this) {
    if (this.etat !== this.genreEtat.FermetureDemande) {
      this.etat = this.genreEtat.Connecte;
    }
    this.browser.executeScript({
      code: 'if(!window.messageData) window.messageData = [];' +
            'window._finLoadingScriptAppliMobile = function(){' +
            '  messageData.push({action: \'load\'});' +
            '};' +
            'if(document.querySelectorAll(\'.conteneur\').length === 1){' +
            '  messageData.push({action: \'errorMsg\', msg: document.querySelectorAll(\'.conteneur\')[0].innerText});' +
            '}'+
            'var isError = document.body.textContent.match(/HTTP Error ([0-9]{3})/i);' +
            'if(isError && isError.length > 1 && parseInt(isError[1]) > 399) {' +
            '  messageData.push({action: \'errorStatus\', msg: isError[1]});' +
            '}'
    },
      this.waitMessageData.bind(this)
    );
  }
}

ObjetCommMessage.prototype.onExit = function () {
  if (this) {
    this.etat = this.genreEtat.EnFermeture;
    this.onExitBrowser();
  }
  this.browser = null;
  GApplication.fermerLoader();
}

ObjetCommMessage.prototype.onMessage = function (event) {
  this.onMessageData([JSON.stringify([event.data])]);
}

ObjetCommMessage.prototype.waitMessageData = function () {
  this.timeoutReturn = setTimeout((function () {
    try {
      if (this.browser && this.etat !== this.genreEtat.FermetureDemande) {
        this.browser.executeScript(
          {
            code: '(function(){var lMessData = window.messageData && window.messageData.length ? window.messageData.splice(0, window.messageData.length) : \'\';return lMessData ? JSON.stringify(lMessData) : \'\';})();'
          },
          this.onMessageData.bind(this)
        );
      } else {
        this.etat = this.genreEtat.EnFermeture;
        this.onExitBrowser();
      }
    } catch (e) {
      GApplication.log(GApplication.niveauxLog.ERROR, 'waitMessageData : ' + e.message);
    }
  }).bind(this), 500);
};

ObjetCommMessage.prototype.onMessageData = function (aData) {
  var lThis = this;
  clearTimeout(this.timeoutReturn);
  this.timeoutReturn = null;
  this.watchdogReturn = 0;
  if (aData && aData[0] && aData[0].length) {
    aData[0] = JSON.parse(aData[0]);
  }
  if (aData && aData[0] && aData[0].length) {
    var lData = aData[0].shift();
    try { // si une action échoue il faut tout de même pouvoir relancer la boucle
      if (lData.action === 'load') {
        GApplication.log(GApplication.niveauxLog.TRACE, 'onMessageData load');
        $.ajax({
          datatype: 'text',
          mimeType: 'text/plain',
          url: 'sitejs/override.js',
          success: function (data) {
            lThis.browser.executeScript({
              code: data
            }, function () {
              // Gestion des traductions
              ['MenuProfils', 'MenuAPropos', 'vousAvezXnotif', 'ChangerProfils'].forEach(function (ele) {
                lThis.browser.executeScript({
                  code: 'GTraductions.add("' + ele + '", "' + GTraductions.getValeur(ele) + '");'
                });
              });
              lThis.browser.executeScript({
                code: 'if (IE.fModule) {' +
                      '  if (GApplication.initApp) {' +
                      '    GApplication.initApp({' +
                      '      estAppliMobile : true,' +
                      '      avecExitApp : true,' +
                      '      login : \'' + lThis.profil.login.replace("'", "\\'") + '\',' +
                      '      mdp : \'' + lThis.profil.mdp + '\',' +
                      '      uuid : \'' + device.uuid + '\',' +
                      '    })' +
                      '  }' +
                      '} else {' +
                      '  Invocateur.abonner(Invocateur.events.modificationPresenceUtilisateur, function(aPresence){' +
                      '    if (!aPresence) {' +
                      '      Invocateur.evenement (Invocateur.events.modificationPresenceUtilisateur, true);' +
                      '    }' +
                      '  }, null);' +
                      '  GApplication.estAppliMobile = true;' +
                      '  GApplication.infoAppliMobile = {' +
                      '    avecExitApp:true' +
                      '  };' +
                      '  if(GApplication.smartAppBanner) $(\'#\'+GApplication.smartAppBanner.id.escapeJQ()).remove();' +
                      '  GInterface.traiterEvenementValidation(\'' + lThis.profil.login.replace("'", "\\'") + '\', \'' + lThis.profil.mdp + '\', null, \'' + device.uuid + '\');' +
                      '}'
              });
            });
          },
          error: function (jqXHR, textStatus, errorThrown) {
            GApplication.log(GApplication.niveauxLog.ERROR, 'erreur chargement sitejs/override.js');
            if (lThis.browser) {
              lThis.browser.close();
            }
            GApplication.fermerLoader();
          }
        });
      } else if (lData.action === 'errorMsg') {
        GApplication.log(GApplication.niveauxLog.TRACE, 'onMessageData errorMsg');
        GApplication.log(GApplication.niveauxLog.DEBUG, {nom: "error_message", result: lData});
        this.etat = this.genreEtat.EnFermeture;
        this.onExitBrowser();
        GApplication.fermerLoader();
        navigator.notification.alert(lData.msg, null, '');
      } else if (lData.action === 'errorStatus') {
        GApplication.log(GApplication.niveauxLog.TRACE, 'onMessageData errorStatus');
        GApplication.log(GApplication.niveauxLog.DEBUG, {nom: "error_message", result: lData});
        this.etat = this.genreEtat.EnFermeture;
        this.browser.channels.loaderror.fire();
      } else if (lData.action === 'actionOnglet') {
        if (this.browser) {
          this.browser.executeScript({
            code: '(function(){return JSON.stringify(GEtatUtilisateur.listeOnglets.GetElementParGenre(GInterface.GenreOnglet));})()'
          }, function (aData) {
            window.FCMHMSPlugin.setScreenName(JSON.parse(aData[0]).L);
          });
        }

        // Refresh page d'accueil
        if (this.timeoutRefresh) {
          clearTimeout(this.timeoutRefresh);
        }
        this.timeoutRefresh = setTimeout(function () {
          if (lThis.browser) {
            lThis.browser.executeScript({
              code: '(function(){GInterface.rafraichirOnglet();})()'
            });
          }
        }, this.refreshRate);
      } else if (lData.action === 'exitApp') {
        GApplication.log(GApplication.niveauxLog.TRACE, 'onMessageData exitApp');
        GApplication.log(GApplication.niveauxLog.DEBUG, {nom: "logout", status: 'success'});
        this.etat = this.genreEtat.EnFermeture;
        this.onExitBrowser();
        /*if (GApplication.avecExitApp()) {
          GApplication.exitApp();
        }*/
      } else if (lData.action === 'changerProfil') {
        GApplication.log(GApplication.niveauxLog.TRACE, 'onMessageData changerProfil');
        if (this.browser) {
          this.browser.close();
        }
        GApplication.chargerInterface(GApplication.interfaces.accueil);
      } else if (lData.action === 'editerProfil') {
        GApplication.log(GApplication.niveauxLog.TRACE, 'onMessageData editerProfil');
        if (this.browser) {
          this.browser.close();
        }
        GApplication.chargerInterface(GApplication.interfaces.profils);
      } else if (lData.action === 'menuAide') {
        GApplication.log(GApplication.niveauxLog.TRACE, 'onMessageData menuAide');
        if (this.browser) {
          this.browser.close();
        }
        GApplication.chargerInterface(GApplication.interfaces.aide);
      } else if (lData.action === 'surAuth') {
        GApplication.log(GApplication.niveauxLog.TRACE, 'onMessageData surAuth');
        GApplication.fermerLoader();
        this.browser.show();
        lThis.profil.mdp = lData.data;
        GApplication.ecrireProfils();
        if ((GApplication.tokenFCM || GApplication.tokenHMS) && lThis && !lThis.callbackAuth) {
          lThis.postToken();
        }
        if (lThis.callbackAuth) {
          lThis.callbackAuth();
        }
      } else if (lData.action === 'surNonAuth') {
        GApplication.log(GApplication.niveauxLog.TRACE, 'onMessageData surNonAuth');
        this.etat = this.genreEtat.EnFermeture;
        this.onExitBrowser();
        GApplication.fermerLoader();
        lThis.profil.mdp = '';
        GApplication.ecrireProfils();
        navigator.notification.alert(GTraductions.getValeur('identificationEchouee'), null, '');
        GApplication.chargerInterface(GApplication.interfaces.profils);
      } else if (lData.action === 'finSession') {
        if (this.etat === this.genreEtat.Connecte) {
          if (lData.data.jsonErreur && (lData.data.jsonErreur.Message || lData.data.jsonErreur.Titre)) {
            navigator.notification.alert(lData.data.jsonErreur.Message, null, lData.data.jsonErreur.Titre, GTraductions.getValeur('Fermer'));
          } // sinon on ne fait rien, c'est une déconnexion normale
        }
        this.etat = this.genreEtat.EnFermeture;
        this.onExitBrowser();
        GApplication.fermerLoader();
        GApplication.chargerInterface(GApplication.interfaces.accueil);
      } else if (lData.action === 'openLink') {
        if (lData.link.indexOf('data:') === 0) {
          var lMatches = lData.link.match(/^data:ima?ge?\/(.*?);base64,(.*)$/);
          if (lMatches) {
            DocumentViewer.saveAndPreviewBase64File(
                                function () {
                                  GApplication.log(GApplication.niveauxLog.TRACE, 'visualisation fichier ok');
                                },
                                function (e) {
                                  navigator.notification.alert(GTraductions.getValeur('FichierPasOuvert'));
                                  GApplication.log(GApplication.niveauxLog.ERROR, 'erreur visualisation fichier : ' + e);
                                },
                                decodeURIComponent(lMatches[2]),
                                'image/' + lMatches[1],
                                cordova.file.cacheDirectory,
                                'pronote.' + lMatches[1]
            );
          }
        } else {
          cordova.InAppBrowser.open(lData.link, '_system', '', this.browserCallbacks);
        }
      } else if (lData.action === 'calendarEvent') {
        window.plugins.calendar.createEventInteractively(lData.event.titre, null, lData.event.note, new Date(lData.event.start), new Date(lData.event.stop));
      }
    } catch (e) {
      GApplication.log(GApplication.niveauxLog.ERROR, 'erreur execution commande');
    }
    if (aData[0].length) {
      aData[0] = JSON.stringify(aData[0]);
      this.onMessageData(aData);
    } else {
      this.waitMessageData();
    }
  } else {
    this.waitMessageData();
  }
};

ObjetCommMessage.prototype.onExitBrowser = function () {
  clearInterval(this.watchdog);
  clearTimeout(this.timeoutReturn);
  if (this.browser) {
    this.browser.close();
    this.browser = null;
  }
};

ObjetCommMessage.prototype.mettreEnAttente = function (aEtat) {
  if (this.browser) {
    if (aEtat) {
      this.browser.executeScript({
        code: 'if(!!GInterface.fenetreModalePatience.avecMessage) GInterface.fenetreModalePatience.afficher(\'' + GTraductions.getValeur('horsConnexion') + '\');'
      });
    } else {
      this.browser.executeScript({
        code: 'if(!!GInterface.fenetreModalePatience.avecMessage) GInterface.fenetreModalePatience.fermer();'
      });
    }
    this.browser.executeScript({
      code: 'GApplication.getCommunication()._attenteEncours = ' + !!aEtat + ';'
    });
  }
};

ObjetCommMessage.prototype.postToken = function (aSupp) {
  var lSupp = aSupp || false;
  if (this.browser) {
    GApplication.log(GApplication.niveauxLog.TRACE, 'postToken : '+ lSupp);
    this.browser.executeScript({
      code: '(function(){if (!!GApplication.postToken){GApplication.postToken(\'' + (GApplication.tokenFCM ? device.platform : (GApplication.tokenHMS ? device.platform + 'hms' : '')) + '\', \'' + device.uuid + '\', \'' + (GApplication.tokenFCM || GApplication.tokenHMS) + '\', ' + lSupp + ');}})()'
    });
  }
};
})();