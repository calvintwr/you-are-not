(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.Not = f()}})(function(){var define,module,exports;return (function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
/*!
 * You-Are-Not v0.4.0
 * (c) 2020 Calvin Tan
 * Released under the MIT License.
 */
'use strict';

function _typeof(obj) { "@babel/helpers - typeof"; if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

var You = {
  opinionatedOnNaN: true,
  opinionatedOnArray: true,
  opinionatedOnNull: true,
  opinionatedOnString: true,
  _isOpinionated: true,
  willThrowError: true
};
Object.defineProperty(You, 'isOpinionated', {
  get: function get() {
    return this._isOpinionated;
  },
  set: function set(value) {
    this._isOpinionated = value;
    this.opinionatedOnNaN = value;
    this.opinionatedOnArray = value;
    this.opinionatedOnNull = value;
    this.opinionatedOnString = value;
  }
});

You.areNot = function (expect, got, name, note) {
  expect = this.prepareExpect(expect);
  got = this.type(got);
  if (this.found(expect, got)) return false;
  var msg = this.msg(expect, got, name, note);
  if (this.willThrowError) throw TypeError(msg);
  return msg;
};

You.isNot = function (expect, got, name, note) {
  return this.areNot(expect, got, name, note);
};

You.not = function (expect, got, name, note) {
  return this.areNot(expect, got, name, note);
};

You.are = function (expect, got) {
  try {
    var chk = this.areNot(expect, got);
    if (typeof chk === 'string') return false;
    return true;
  } catch (error) {
    return false;
  }
};

You.is = function (expect, got) {
  return this.are(expect, got);
};

You.found = function (expect, got) {
  var _this = this;

  if (typeof got == 'string') got = [got];
  var found = expect.find(function (el) {
    return got.indexOf(_this.vet(el)) !== -1;
  });
  return typeof found !== 'undefined';
};

You.prepareExpect = function (expect) {
  var _this2 = this;

  if (typeof expect === 'string') {
    expect = [expect];
  } else if (!Array.isArray(expect)) {
    throw TypeError("Internal error: Say what you expect to check as a string or array of strings. Found ".concat(this.list(this.type(expect), 'as'), "."));
  }

  return expect.reduce(function (r, expect) {
    if (typeof expect !== 'string') throw TypeError("Internal error: Say what you expect to check as a string. Found ".concat(_this2.list(_this2.type(expect), 'as'), "."));
    expect = expect.toLowerCase();
    return _this2.mapOptional(r, expect);
  }, []);
};

You.mapOptional = function (r, expect) {
  if (expect !== 'optional') {
    r.push(expect);
  } else {
    r.push('null', 'undefined');
  }

  return r;
};

You.msg = function (expect, got, name, note) {
  var msg = 'Wrong Type'; // type error, invalid argument, validation error... have been considered. 'Wrong Type' sounds most simple.

  msg += name ? " (".concat(name, ")") : '';
  msg += ": Expecting type ".concat(this.list(expect), " but got ").concat(this.list(got), ".");
  msg += note ? " Note: ".concat(note, ".") : '';
  return msg;
};

You.vet = function (expect) {
  var valid = ['string', 'number', 'nan', // this is an opinion. NaN should not be of type number in the literal sense.
  'array', 'object', 'function', 'boolean', 'null', 'undefined' // no support for symbol. should we care?
  ];
  if (valid.indexOf(expect.toLowerCase()) === -1) throw Error("Internal error: `".concat(expect, "` is not a valid type to check for. Please use only ").concat(this.list(valid), "."));
  return expect;
};

You.list = function (array, conjunction) {
  if (!conjunction) conjunction = 'or';
  if (typeof array === 'string') array = [array];
  array = array.map(function (el) {
    return "`".concat(el.toLowerCase(), "`");
  });
  if (array.length === 1) return array[0];
  if (array.length === 2) return array.join(" ".concat(conjunction, " "));
  return "".concat(array.slice(0, -1).join(', '), " ").concat(conjunction, " ").concat(array.slice(-1));
};

You.type = function (got) {
  // sort out the NaN problem.
  if (_typeof(got) !== 'object') {
    if (typeof got === 'number' && isNaN(got)) {
      if (this.opinionatedOnNaN) {
        return 'nan';
      } else {
        return ['nan', 'number'];
      }
    } // everything else is in the clear


    return _typeof(got);
  } // objects... get rid of all the problems typeof [] or null is `object`.


  if (Array.isArray(got)) {
    if (this.opinionatedOnArray) {
      return 'array';
    } else {
      return ['array', 'object'];
    }
  }

  if (got === null) {
    if (this.opinionatedOnNull) {
      return 'null';
    } else {
      return ['null', 'object'];
    }
  }

  if (got instanceof String) {
    if (this.opinionatedOnString) {
      return 'string';
    } else {
      return ['string', 'object'];
    }
  }

  return 'object';
};

You.lodge = function (expect, got, name, note) {
  // when using ingest you want to mute throwing errors.
  this._oldValue_willThrowError = this.willThrowError;
  this.willThrowError = false;
  if (!this._lodged) this._lodged = [];
  var ingestation = this.areNot(expect, got, name, note);
  if (ingestation) this._lodged.push(ingestation); // revert

  this.willThrowError = this._oldValue_willThrowError;
  this._oldValue_willThrowError = null;
};

You.resolve = function (callback) {
  if (this._lodged === undefined || this._lodged.length === 0) return false;
  var errors = TypeError('Wrong types provided. See `trace`.');
  errors.trace = this._lodged;
  if (typeof callback === 'function') return callback(errors);
  if (this.willThrowError) throw errors;
  return errors.trace;
};

You.checkObject = function (name, expectObject, gotObject, callback) {
  var not = Object.create(this);
  not.walkObject(name, expectObject, gotObject);
  return not.resolve(callback);
};

You.walkObject = function (name, expectObject, gotObject) {
  for (var i = 0, keys = Object.keys(expectObject); i < keys.length; i++) {
    var key = keys[i];
    var expect = expectObject[key];
    var optional = key.indexOf('__optional') > -1 ? true : false;
    var keyCopy = optional ? key.replace('__optional', '') : key;
    var got = gotObject[keyCopy]; //var name = `${name}.${keys[i]}`

    if (_typeof(expect) === 'object' && expect !== null) {
      if (_typeof(got) === 'object' && got !== null) {
        this.walkObject("".concat(name, ".").concat(keyCopy), expect, got);
        continue;
      } else {
        if (optional) continue;
      }

      this.lodge('object', got, "".concat(name, ".").concat(keyCopy));
      continue;
    }

    this.lodge(expect, got, "".concat(name, ".").concat(keyCopy));
  }
};

You.create = function (options) {
  var you = Object.create(this);

  this._applyOptions(you, options);

  return you.areNot.bind(you);
};

You.createNot = function (options) {
  return this.create(options);
};

You.createIs = function (options) {
  var you = Object.create(this);

  this._applyOptions(you, options);

  return you.are.bind(you);
};

You._applyOptions = function (instance, options) {
  if (this.__proto__.is === undefined) throw Error('You are directly using the prototype which is not allowed. Please use #Object.create() to extend this prototype.');

  if (this.__proto__.is('object', options)) {
    if (this.__proto__.is('boolean', options.opinionatedOnNaN)) instance.opinionatedOnNaN = options.opinionatedOnNaN;
    if (this.__proto__.is('boolean', options.opinionatedOnArray)) instance.opinionatedOnArray = options.opinionatedOnArray;
    if (this.__proto__.is('boolean', options.opinionatedOnNull)) instance.opinionatedOnNull = options.opinionatedOnNull;
    if (this.__proto__.is('boolean', options.opinionatedOnString)) instance.opinionatedOnString = options.opinionatedOnString;
    if (this.__proto__.is('boolean', options.isOpinionated)) instance.isOpinionated = options.isOpinionated;
    if (this.__proto__.is('boolean', options.willThrowError)) instance.willThrowError = options.willThrowError;
  }
};

module.exports = Object.create(You);
exports = module.exports;

},{}]},{},[1])(1)
});