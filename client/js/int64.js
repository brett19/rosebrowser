'use strict';

// TODO: Make everything handle signed int64 properly...

function Int64(lo, hi) {
  this.lo = lo;
  this.hi = hi;
}

Int64.prototype.isBitSet = function(bit) {
  if (bit < 32) {
    return this.lo & (1 << bit);
  } else {
    return this.hi & (1 << (bit-32));
  }
};

Int64.prototype.toString = function(radix) {
  if (radix === 10 || radix === undefined) {
    return '?int64_tostring_badradix?';
  } else if (radix === 16) {
    var str = this.lo.toString(16);
    while (str.length < 8) {
      str = '0' + str;
    }
    return this.hi.toString(16) + str;
  } else {
    return '?int64_tostring_badradix?';
  }
};

Int64.prototype.toNumber = function() {
  return this.hi << 32 | this.lo;
};
