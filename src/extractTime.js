'use strict';

// Dash like characters
let enDash = '–';
let hyphen = '-';
let emDash = '—';

// let textInputs = [
//   'Bake for 8-10 minutes or until golden Let sit for 2 – 5 minutes',
//   'Let sit for 2 – 5 minutes',
//   'fork <a href="http://www.abeautifulmess.com/2016/01/southwestern-baked-macaroni-and-cheese-with-black-bean-noodles.html"> minutes here it is</a> and let sit for 10 minutes'
// ];

var exports = module.exports = {};
exports.convert =  getMinutes;


/**
 * Converts most dash-like characters to a dash
 */
function normalizeDashes(input) {
  input = input.split(enDash).join(hyphen);
  input = input.split(emDash).join(hyphen);
  return input;
}

/**
 * Removes unnecessary spaces around dashes 
 */
function removeExtraSpaces(input) {
  return input.split(` ${hyphen} `).join(hyphen);
}

/**
 * Checks if numeric
 * http://stackoverflow.com/a/9716488/5357459
 */
function isNumeric(n) {
  return !isNaN(parseFloat(n)) && isFinite(n);
}

function getMinutes(sentence) {
  let minOutput = [];
  sentence = normalizeDashes(sentence);
  sentence = removeExtraSpaces(sentence);
  let minA;
  if (sentence.includes('minutes')) {
    minA = sentence.split('minutes');
    let end = minA.pop();
    minOutput = minA.reduce(timeStringObjs, []);
    if (end.length > 0) {
      minOutput.push({
        type: 'string',
        data: end
      });
    }
  }
  return minOutput;
}

/**
 * Converts to time and string objects
 */
function timeStringObjs(output, minItem) {
  let minItemA = minItem.split(' ');
  minItemA.pop();
  let minutes = minItemA.pop();
  let minStart = minItemA.join(' ');
  let timerObj;
  if (minutes.includes(hyphen)) {
    let minuteOptions = minutes.split(hyphen);
    let short = minuteOptions[0];
    let long = minuteOptions[1];
    if (isNumeric(short) && isNumeric(long)) {
      timerObj = {
        short: short,
        long: long
      };
    }
  } else if (isNumeric(minutes[0])) {
    timerObj = { exactly: minutes[0] };
  }
  if (timerObj !== undefined) {
    output.push({
      type: 'string',
      data: minStart + ' '
    });
    output.push({
      type: 'timerObj',
      data: timerObj
    });
  } else {
    // No timerObj found
    output.push({
      type: 'string',
      data: minItem
    });
  }
  return output;
}
