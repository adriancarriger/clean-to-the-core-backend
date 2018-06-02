'use strict';

let cheerio = require('cheerio');
let firebase = require('firebase');
let Promise = require('promise');
let path = require('path');
let fs = require('fs');

let config = require('./config.js').config;
let filePath = path.resolve(__dirname, '../assets/input.json');
let json = JSON.parse(fs.readFileSync(filePath, 'utf8'));
let convert = require('./extractTime').convert;

init(false);

auth()
  .then(prepareUpdates)
  .then(updateData)
  .then(process.exit);

// Prepare data for upload to Firebase
Object.keys(json.recipes).forEach(slug => {
  json.recipes[slug].items = json.recipes[slug].items.map(item => {
    // Exracts time objects from recipe steps (strings => objects)
    let steps = flatten(item.steps);
    item.stepsObj = steps.map(x => convert(x));
    item.ingredients = item.ingredients.split('http://').join('https://');
    return item;
  });
});

function flatten(steps) {
  let $ = cheerio.load(steps);
  let array = [];
  $('li').each(function (i, elem) {
    array.push($(this).html());
  });
  return array;
}

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
  return new Promise((resolve, reject) => {
    let completed = 0;
    for (let i = 0; i < updates.length; i++) {
      let ref = firebase.database().ref(updates[i].ref);
      ref.transaction(() => {
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
  return new Promise((resolve, reject) => {
    let updates = [];
    updates.push({
      ref: 'client/recipes',
      data: json.recipes
    });
    resolve(updates);
  });
}
