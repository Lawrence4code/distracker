import firebase from 'firebase/app';
require('firebase/firestore');

import firebaseConfig from './config';

const settings = { timestampsInSnapshots: true };

// Initialize Firebase
var config = {
  apiKey: firebaseConfig.apiKey,
  authDomain: firebaseConfig.authDomain,
  databaseURL: firebaseConfig.databaseURL,
  projectId: firebaseConfig.projectId,
  storageBucket: firebaseConfig.storageBucket,
  messagingSenderId: firebaseConfig.messagingSenderId
};

firebase.initializeApp(config);

const database = firebase.firestore();

database.settings(settings);

export default database;
