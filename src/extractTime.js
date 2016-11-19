'use strict';

// Dash like characters
let enDash = '&#x2013;';
let hyphen = '-';
let emDash = '&#x2014;';

var exports = module.exports = {};

exports.convert = function(sentence) {
  if (!sentence.includes('minutes')) {
    // No parsing needed, just map to a string object
    return [
      {
        type: 'string',
        data: sentence
      }
    ];
  }
  let minOutput = [];
  sentence = normalizeDashes(sentence);
  sentence = removeExtraSpaces(sentence);
  
  let minA;
  minA = sentence.split('minutes');
  let end = minA.pop();
  minOutput = minA.reduce(timeStringObjs, []);
  if (end.length > 0) {
    minOutput.push({
      type: 'string',
      data: end
    });
  }
  return minOutput;
}

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
  } else if (isNumeric(minutes)) {
    timerObj = { exactly: minutes };
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
