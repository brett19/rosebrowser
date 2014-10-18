'use strict';

// TODO: Make everything handle signed int64 properly...

/**
 * A class for wrapping a 64-bit integer in Javascript to avoid loss
 * of precision issues at high values.
 *
 * @constructor
 * @param {number} [lo]
 * @param {number} [hi]
 */
function Int64(lo, hi) {
  if (lo === undefined && hi === undefined) {
    lo = 0;
    hi = 0;
  }
  this.lo = lo;
  this.hi = hi;
}

Int64.prototype.isBitSet = function(bit) {
  if (bit < 32) {
    return this.lo & (1 << bit);
  } else {
    return this.hi & (1 << (bit - 32));
  }
};

Int64.prototype.hasBits = function(other) {
  return (this.hi & other.hi) | (this.lo & other.lo);
};

Int64.prototype.toString = function(radix) {
  var str = this.lo.toString(16);

  while (str.length < 8) {
    str = '0' + str;
  }

  return this.hi.toString(16) + str;
};

Int64.prototype.toNumber = function() {
  return this.hi << 32 | this.lo;
};

Int64.fromBit = function(bit) {
  if (bit <= 31) {
    return new Int64(1 << bit, 0);
  } else {
    return new Int64(0, 1 << (bit - 31));
  }
};

module.exports = Int64;
