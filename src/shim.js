(function () {
  'use strict';

  //-------------- Function bind
  if (!Function.prototype.bind) {
    Function.prototype.bind = function (oThis) {
      if (typeof this !== 'function') {
        // closest thing possible to the ECMAScript 5 internal IsCallable function
        throw new TypeError(
          'Function.prototype.bind - what is trying to be bound is not callable'
        );
      }

      var aArgs = Array.prototype.slice.call(arguments, 1),
        fToBind = this,
        fNOP = function () {},
        fBound = function () {
          return fToBind.apply(
            this instanceof fNOP && oThis ? this : oThis,
            aArgs.concat(Array.prototype.slice.call(arguments))
          );
        };

      fNOP.prototype = this.prototype;
      fBound.prototype = new fNOP();

      return fBound;
    };
  }

  //--------------- String bind
  if (!String.prototype.trim) {
    var RE = /^\s+|\s+$/g;

    String.prototype.trim = function () {
      return this.replace(RE, '');
    };
  }

  //------------- Object.keys and Object.create
  var hasOwnProperty = Object.prototype.hasOwnProperty;

  // From https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/keys
  if (!Object.keys) {
    Object.keys = (function () {
      'use strict';
      var hasDontEnumBug = !{ toString: null }.propertyIsEnumerable('toString'),
        dontEnums = [
          'toString',
          'toLocaleString',
          'valueOf',
          'hasOwnProperty',
          'isPrototypeOf',
          'propertyIsEnumerable',
          'constructor',
        ],
        dontEnumsLength = dontEnums.length;

      return function (obj) {
        if (
          typeof obj !== 'object' &&
          (typeof obj !== 'function' || obj === null)
        ) {
          throw new TypeError('Object.keys called on non-object');
        }

        var result = [],
          prop,
          i;

        for (prop in obj) {
          if (hasOwnProperty.call(obj, prop)) {
            result.push(prop);
          }
        }

        if (hasDontEnumBug) {
          for (i = 0; i < dontEnumsLength; i++) {
            if (hasOwnProperty.call(obj, dontEnums[i])) {
              result.push(dontEnums[i]);
            }
          }
        }
        return result;
      };
    })();
  }

  if (typeof Object.create != 'function') {
    Object.create = (function () {
      function Obj() {}

      return function (o, propertiesDescriptor) {
        Obj.prototype = o;
        var result = new Obj();

        if (propertiesDescriptor) {
          for (var k in propertiesDescriptor)
            if (hasOwnProperty.call(propertiesDescriptor, k)) {
              result[k] = propertiesDescriptor[k].value;
            }
        }
        return result;
      };
    })();
  }

  //------------------- Array ES5 methods
  //private
  /*
   *
   * Add support for array extras methods, all of which should be implemented in modern browsers.
   *
   * The implementation for each of these methods is taken from the Mozilla developer network JavaScript reference
   *
   * The methods are:
   * forEach
   * indexOf
   * map
   * filter
   * some
   * every
   * lastIndexOf
   * reduce
   * reduceRight
   *
   * The isArray method is also added, but on the Array object itself, not on the prototype, so this is static method
   * isArray
   */

  // for old browsers
  if (typeof Array.prototype.forEach != 'function') {
    // Production steps of ECMA-262, Edition 5, 15.4.4.18
    // Reference: http://es5.github.com/#x15.4.4.18
    Array.prototype.forEach = function (callback, thisArg) {
      var T, k;

      if (this == null) {
        throw new TypeError(' this is null or not defined');
      }

      // 1. Let O be the result of calling ToObject passing the |this| value as the argument.
      var O = Object(this);

      // 2. Let lenValue be the result of calling the Get internal method of O with the argument "length".
      // 3. Let len be ToUint32(lenValue).
      var len = O.length >>> 0;

      // 4. If IsCallable(callback) is false, throw a TypeError exception.
      // See: http://es5.github.com/#x9.11
      if ({}.toString.call(callback) != '[object Function]') {
        throw new TypeError(callback + ' is not a function');
      }

      // 5. If thisArg was supplied, let T be thisArg; else let T be undefined.
      if (thisArg) {
        T = thisArg;
      }

      // 6. Let k be 0
      k = 0;

      // 7. Repeat, while k < len
      while (k < len) {
        var kValue;

        // a. Let Pk be ToString(k).
        //   This is implicit for LHS operands of the in operator
        // b. Let kPresent be the result of calling the HasProperty internal method of O with argument Pk.
        //   This step can be combined with c
        // c. If kPresent is true, then
        if (k in O) {
          // i. Let kValue be the result of calling the Get internal method of O with argument Pk.
          kValue = O[k];

          // ii. Call the Call internal method of callback with T as the this value and
          // argument list containing kValue, k, and O.
          callback.call(T, kValue, k, O);
        }
        // d. Increase k by 1.
        k++;
      }
      // 8. return undefined
    };
  }

  /*
   * Array indexOf implementation taken from
   * https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Array/indexOf
   */
  if (!Array.prototype.indexOf) {
    Array.prototype.indexOf = function (searchElement /*, fromIndex */) {
      'use strict';
      if (this === void 0 || this === null) {
        throw new TypeError();
      }
      var t = Object(this);
      var len = t.length >>> 0;
      if (len === 0) {
        return -1;
      }
      var n = 0;
      if (arguments.length > 0) {
        n = Number(arguments[1]);
        if (n !== n) {
          // shortcut for verifying if it's NaN
          n = 0;
        } else if (n !== 0 && n !== 1 / 0 && n !== -(1 / 0)) {
          n = (n > 0 || -1) * Math.floor(Math.abs(n));
        }
      }
      if (n >= len) {
        return -1;
      }
      var k = n >= 0 ? n : Math.max(len - Math.abs(n), 0);
      for (; k < len; k++) {
        if (k in t && t[k] === searchElement) {
          return k;
        }
      }
      return -1;
    };
  }

  // Production steps of ECMA-262, Edition 5, 15.4.4.19
  // Reference: http://es5.github.com/#x15.4.4.19
  if (!Array.prototype.map) {
    Array.prototype.map = function (callback, thisArg) {
      var T, A, k;

      if (this == null) {
        throw new TypeError(' this is null or not defined');
      }

      // 1. Let O be the result of calling ToObject passing the |this| value as the argument.
      var O = Object(this);

      // 2. Let lenValue be the result of calling the Get internal method of O with the argument "length".
      // 3. Let len be ToUint32(lenValue).
      var len = O.length >>> 0;

      // 4. If IsCallable(callback) is false, throw a TypeError exception.
      // See: http://es5.github.com/#x9.11
      if ({}.toString.call(callback) != '[object Function]') {
        throw new TypeError(callback + ' is not a function');
      }

      // 5. If thisArg was supplied, let T be thisArg; else let T be undefined.
      if (thisArg) {
        T = thisArg;
      }

      // 6. Let A be a new array created as if by the expression new Array( len) where Array is
      // the standard built-in constructor with that name and len is the value of len.
      A = new Array(len);

      // 7. Let k be 0
      k = 0;

      // 8. Repeat, while k < len
      while (k < len) {
        var kValue,
          mappedValue,
          Pk = k + '';

        // a. Let Pk be ToString(k).
        //   This is implicit for LHS operands of the in operator
        // b. Let kPresent be the result of calling the HasProperty internal method of O with argument Pk.
        //   This step can be combined with c
        // c. If kPresent is true, then
        if (k in O) {
          // i. Let kValue be the result of calling the Get internal method of O with argument Pk.
          kValue = O[Pk];

          // ii. Let mappedValue be the result of calling the Call internal method of callback
          // with T as the this value and argument list containing kValue, k, and O.
          mappedValue = callback.call(T, kValue, k, O);

          // iii. Call the DefineOwnProperty internal method of A with arguments
          // Pk, Property Descriptor {Value: mappedValue, Writable: true, Enumerable: true, Configurable: true},
          // and false.
          // In browsers that support Object.defineProperty, use the following:
          // Object.defineProperty( A, Pk, { value: mappedValue, writable: true, enumerable: true, configurable: true });
          // For best browser support, use the following:
          A[Pk] = mappedValue;
        }
        // d. Increase k by 1.
        k++;
      }

      // 9. return A
      return A;
    };
  }

  if (!Array.prototype.filter) {
    Array.prototype.filter = function (fun /*, thisp */) {
      'use strict';

      if (this === void 0 || this === null) throw new TypeError();

      var t = Object(this),
        len = t.length >>> 0;

      if (typeof fun !== 'function') throw new TypeError();

      var res = [],
        thisp = arguments[1];
      for (var i = 0; i < len; i++) {
        if (i in t) {
          var val = t[i]; // in case fun mutates this
          if (fun.call(thisp, val, i, t)) res.push(val);
        }
      }

      return res;
    };
  }

  if (!Array.prototype.some) {
    Array.prototype.some = function (fun /*, thisp */) {
      'use strict';

      if (this === void 0 || this === null) throw new TypeError();

      var t = Object(this);
      var len = t.length >>> 0;
      if (typeof fun !== 'function') throw new TypeError();

      var thisp = arguments[1];
      for (var i = 0; i < len; i++) {
        if (i in t && fun.call(thisp, t[i], i, t)) return true;
      }

      return false;
    };
  }

  if (!Array.prototype.every) {
    Array.prototype.every = function (fun /*, thisp */) {
      'use strict';

      if (this === void 0 || this === null) throw new TypeError();

      var t = Object(this);
      var len = t.length >>> 0;
      if (typeof fun !== 'function') throw new TypeError();

      var thisp = arguments[1];
      for (var i = 0; i < len; i++) {
        if (i in t && !fun.call(thisp, t[i], i, t)) return false;
      }

      return true;
    };
  }

  if (!Array.prototype.lastIndexOf) {
    Array.prototype.lastIndexOf = function (searchElement /*, fromIndex*/) {
      'use strict';

      if (this === void 0 || this === null) throw new TypeError();

      var t = Object(this);
      var len = t.length >>> 0;
      if (len === 0) return -1;

      var n = len;
      if (arguments.length > 1) {
        n = Number(arguments[1]);
        if (n !== n) n = 0;
        else if (n !== 0 && n !== 1 / 0 && n !== -(1 / 0))
          n = (n > 0 || -1) * Math.floor(Math.abs(n));
      }

      var k = n >= 0 ? Math.min(n, len - 1) : len - Math.abs(n);

      for (; k >= 0; k--) {
        if (k in t && t[k] === searchElement) return k;
      }
      return -1;
    };
  }

  if (!Array.prototype.reduce) {
    Array.prototype.reduce = function reduce(accumlator) {
      var i,
        l = this.length,
        curr;

      if (typeof accumlator !== 'function')
        // ES5 : "If IsCallable(callbackfn) is false, throw a TypeError exception."
        throw new TypeError('First argument is not callable');

      if ((l == 0 || l === null) && arguments.length <= 1)
        // == on purpose to test 0 and false.
        throw new TypeError('Array length is 0 and no second argument');

      if (arguments.length <= 1) {
        curr = this[0]; // Increase i to start searching the secondly defined element in the array
        i = 1; // start accumulating at the second element
      } else {
        curr = arguments[1];
      }

      for (i = i || 0; i < l; ++i) {
        if (i in this)
          curr = accumlator.call(undefined, curr, this[i], i, this);
      }

      return curr;
    };
  }

  if (!Array.prototype.reduceRight) {
    Array.prototype.reduceRight = function (callbackfn /*, initialValue */) {
      'use strict';

      if (this === void 0 || this === null) throw new TypeError();

      var t = Object(this);
      var len = t.length >>> 0;
      if (typeof callbackfn !== 'function') throw new TypeError();

      // no value to return if no initial value, empty array
      if (len === 0 && arguments.length === 1) throw new TypeError();

      var k = len - 1;
      var accumulator;
      if (arguments.length >= 2) {
        accumulator = arguments[1];
      } else {
        do {
          if (k in this) {
            accumulator = this[k--];
            break;
          }

          // if array contains no values, no initial value to return
          if (--k < 0) throw new TypeError();
        } while (true);
      }

      while (k >= 0) {
        if (k in t)
          accumulator = callbackfn.call(undefined, accumulator, t[k], k, t);
        k--;
      }

      return accumulator;
    };
  }

  if (!Array.isArray) {
    Array.isArray = function (arg) {
      return Object.prototype.toString.call(arg) == '[object Array]';
    };
  }
})();
