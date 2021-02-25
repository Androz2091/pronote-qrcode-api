# Pronote QR Code API

## Objectif

L'idéal serait de pouvoir faire quelque chose comme ça :

```js
const pronote = require('pronote-api');
const qrcode = require('pronote-qrcode-api');

qrcode.login(buffer, code).then((data) => { // buffer est l'image du qrcode, code est le JETON_4_CHIFFRE

  // data contient le sessionID, etc. les paramètres listés ici : https://github.com/Litarvan/pronote-api/blob/master/src/session.js#L28

  const session = new pronote.Session(data); 

  session.homeworks(); // par exemple

})
```

mais en réalité ça ne sera pas extactement comme ça (le login renverra un login et un mdp avec lesquels on se connectera)

## Lancement

Lancer le script qui extrait quelques infos

```js
node index.js --input qrcode.png --code 1111
```

## Fonctionnement

### Contenu du QR Code

* QRCode scanné. Ce QRCode renvoie un JSON contenant plusieurs informations:
```js
{
  jeton: 'JETON_SUPER_LONG',
  login: 'JETON_MOYEN_LONG',
  url: 'https://0310047h.index-education.net/pronote/mobile.eleve.html'
}
```

### Décoder le contenu du QR Code

* Pronote demande le code d'accès à 4 chiffres rentré précédemment par l'utilisateur (qu'on appelera `JETON_4_CHIFFRE`).

Le login est toujours la même chaine de caractères pour un même compte, encodée avec le `JETON_4_CHIFFRE` passé lors de la création du QRCode. Le jeton est aussi encodé avec le `JETON_4_CHIFFRE`, mais il est différent pour chaque QRCode.

### URL Mobile App Info

* A partir de l'URL Pronote (obtenue depuis le QR Code) on peut effectuer un appel vers cette URL:
```js
// https://0310047h.index-education.net/pronote/infoMobileApp.json?id=0D264427-EEFC-4810-A9E9-346942A862A4

{
  modeModif: true,
  version: [ 2020, 0, 2, 5 ],
  date: '2021-01-20T11:48:47.694Z',
  CAS: {
    actif: true,
    casURL: 'https://cas.mon-ent-occitanie.fr',
    jetonCAS: 'JETON_SUPER_LONG_QUI_CHANGE_A_CHAQUE_RAFRAICHISSEMENT'
  },
  espaces: [
    { nom: 'Espace Direction', URL: 'mobile.direction.html' },
    { nom: 'Espace Professeurs', URL: 'mobile.professeur.html' },
    { nom: 'Espace Vie scolaire', URL: 'mobile.viescolaire.html' },
    { nom: 'Espace Parents', URL: 'mobile.parent.html' },
    { nom: 'Espace Accompagnants', URL: 'mobile.accompagnant.html' },
    { nom: 'Espace Élèves', URL: 'mobile.eleve.html' }
  ],
  nomEtab: 'LYCEE OZENNE'
}
```
A noter : le paramètre ID (`0D264427-EEFC-4810-A9E9-346942A862A4`) est une constante et ne varie pas d'un établissement à l'autre.

### Obtenir un MDP

Obtenir un MDP à partir d'un login, d'un jeton encodé et d'un `JETON_4_CHIFFRE`

* Se rendre sur la page `https://0840853w.index-education.net/pronote/eleve.html`
* Exécuter le code qui change la fonction `window.hookAccesDepuisAppli`
* Le contenu se trouve dans 