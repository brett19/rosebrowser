'use strict';

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
