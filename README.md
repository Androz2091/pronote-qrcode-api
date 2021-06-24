# Pronote QR Code API

Cette API n'est absolument pas terminée, nous sommes deux ou trois à avancer dessus de temps en temps pour comprendre comment l'API Qrcode de pronote fonctionne pour arriver à l'utiliser dans d'autres applications non officielles. Ce repo permet de partager les résultats

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

Le **login** est toujours la même chaine de caractères pour un même compte, encodée avec le `JETON_4_CHIFFRE` passé lors de la création du QRCode. 
Le **jeton** est aussi encodé avec le `JETON_4_CHIFFRE`, mais il est différent pour chaque QRCode.

Ces deux données (login et jeton) sont - lorsqu'ils sont déchiffrés - respectivement un identifiant et un mot de passe Pronote. Vous ne pouvez cependant **pas les entrer directement (même déchiffrés) sur le site web Pronote, car un protocole particulier est utilisé**.

### URL Mobile App Info (informatif)

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

### Informations de déchiffrement
Le code utilisé par Pronote pour déchifrer le login et le MDP est le suivant :
```js
  var lLoginDecode = GCryptage.decrypter({
            genreCryptage: EGenreCryptage.AES,
            chaine: aLogin,
            cle: GCryptage.getBuffer(aCode),
            iv: GCryptage.getBuffer(""),
          });
  var lJetonDecode = GCryptage.decrypter({
            genreCryptage: EGenreCryptage.AES,
            chaine: aJeton,
            cle: GCryptage.getBuffer(aCode),
            iv: GCryptage.getBuffer(""),
          });
```
La classe GCryptage contient une fonction `decrypter` qui est  **un déchiffreur utilisant le protocole `AES-CBC` avec un padding `PKCS 7`**.

Il vous suffit donc pour déchiffrer le login et le mdp d'utiliser n'importe quel **module de déchiffrement AES supportant le padding PKCS7**, et de passer :
- Ce que vous souhaitez déchiffrer (le jeton ou le login) : attention, ces derniers sont **encodés en HEX**. 
- **l'IV à utiliser est un byte vide (0000000000000000)** 
- le mot de passe est le `JETON_4_CHIFFRE`. Vous devez utiliser celui-ci en tant que clé **hashée en MD5**.

Vous obtiendrez donc un login (déchiffrement du `JETON_MOYEN_LONG`) et un mot de passe  (déchiffrement du `JETON_SUPER_LONG`).

### Connexion par QR CODE
Voici donc les étapes à suivre pour se connecter à l'aide d'un QR Code

#### 1) **Obtenir les identifiants à partir d'un login, d'un jeton encodé et d'un `JETON_4_CHIFFRE` (PIN) :**

* Déchiffrer le login à l'aide du PIN et du `JETON_MOYEN_LONG`
* Déchiffrer le MDP à l'aide du PIN et du `JETON_SUPER_LONG`

#### 2) **Générer un UUID :**
Vous devez générer un **UUID pour votre appareil** à l'aide d'un module de génération d'UUID quelconque. Ce dernier sera utilisé par la suite dans le protocole pour **fingerprint** votre appareil. 

Pronote s'en sert visiblement pour vérifier que personne d'autre n'utilisera le jeton de connexion qui sera ensuite fourni à chaque requête de connexion.

Ca ne tient qu'à vous, mais essayez de générer un UUID au maximum sécurisé.

#### 3) **Vous devez ensuite utiliser le protocole de connexion Pronote :**

Je n'ai pas la place de résumer ce dernier ici, je vous conseille donc de lire [l'excellente documentation fournie par Bain](https://github.com/bain3/pronotepy/blob/master/PRONOTE%20protocol.md).

La différence par rapport à une connexion classique est qu'il faudra modifier le JSON envoyé lors de la phase [d'**Identification**](https://github.com/bain3/pronotepy/blob/master/PRONOTE%20protocol.md#step-1-1) :

```json
{
    "nom": "Identification",
    "session": "<session_id>", // int
    "numeroOrdre": "<numero_ordre>",
    "donneesSec": {
        "donnees": {
            "genreConnexion": "<connection_type>", // int
            "genreEspace": "<espace_id>", // int
            "identifiant": "<username>",
            "pourENT": "<using_ent>", // bool
            "enConnexionAuto": false,
            "demandeConnexionAuto": false,
            "demandeConnexionAppliMobile": true,
            "demandeConnexionAppliMobileJeton": true,
            "uuidAppliMobile": "<VOTRE_UUID>",  
            "loginTokenSAV": ""
        }
    }
}
```

`demandeConnexionAppliMobile` et `demandeConnexionAppliMobileJeton` doivent **impérativement être définis sur `true`**. Autrement vous ne parviendrez pas à vous connecter car Pronote pensera que vous vous connectez normalement (avec des identifiants normaux).

`<VOTRE_UUID>` est l'UUID généré plus tôt et `<username>` votre identifiant déchiffré plus tôt à l'aide du `JETON_MOYEN_LONG`. 


#### 4) **Récupérer le jeton à CHAQUE CONNEXION :**
Vous remarquerez que vous n'avez entré votre mot de passe nulle part. C'est parce que le jeton est un mot de passe temporaire envoyé par Pronote. Après la phase d'Identification, vous devrez procéder à la phase [d'**Authentification**](https://github.com/bain3/pronotepy/blob/master/PRONOTE%20protocol.md#step-3).

Suivez les instructions fournies par Bain mais prêtez surtout attention à la chose suivante : 
Le JSON contiendra  :

```json
{
    "nom": "Authentification",
    "session": "<session_id>",
    "numeroOrdre": "<numero_ordre>",
    "donneesSec": {
        "donnees": {
        	"jetonConnexionAppliMobile" : <JETON>,
            "libelleUtil": "<name_of_user>",
            "cle": "<long_cle_string>",
            "derniereConnexion": {
                ...
            }
        },
        "nom": "Authentification"
    }
}
```
Vous devez **sauvegarder le `jetonConnexionAppliMobile`**. Ce dernier est en fait votre **nouveau mot de passe**. Celui que vous devrez utiliser à la prochaine connexion. Et vous recevrez un nouveau jeton de connexion à **chaque connexion** et devrez remplacer le précédent. 

Vous êtes normalement connecté, et tout se passera bien si vous avez suivi scrupuleusement les indications précédentes :).

