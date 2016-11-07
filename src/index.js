'use strict';

let firebase = require("firebase");
let Promise = require("promise");
let path = require('path');

let config = require("./config.js").config;

init(false);

auth()
  .then(prepareUpdates)
  .then(updateData)
  .then(process.exit);


function init(logging) {
  // Initialize Firebase
  firebase.initializeApp(config.firebase.config);
  // Optional Firebase logging
  if (logging === true) {
    firebase.database.enableLogging(true);
  }
}

function auth() {
  return firebase.auth().signInWithEmailAndPassword(
    config.firebase.credentials.email,
    config.firebase.credentials.password);
}

function updateData(updates) {
  return new Promise( (resolve, reject) => {
    let completed = 0;
    for (let i = 0; i < updates.length; i++) {
      let ref = firebase.database().ref( updates[i].ref );
      ref.transaction( () => {
        return updates[i].data;
      }, () => {
        completed++;
        if (completed === updates.length) {
          resolve();
        }
      });
    }
  });
}

function prepareUpdates() {
  return new Promise( (resolve, reject) => {
    var updates = [];
    updates.push({
      ref: 'test/path',
      data: 'test data'
    });
    resolve(updates);
  });
}
