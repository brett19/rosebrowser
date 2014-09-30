'use strict';

// This class must provide at least all the methods available on CharStats.

function McStats(mcObj) {
  this.object = mcObj;

  this.str = undefined;
  this.dex = undefined;
  this.int = undefined;
  this.con = undefined;
  this.cha = undefined;
  this.sen = undefined;
}

McStats.prototype.debugValidate = function() {
  debugValidateProps(this, [
    ['str', 0, 5000],
    ['dex', 0, 5000],
    ['int', 0, 5000],
    ['con', 0, 5000],
    ['cha', 0, 5000],
    ['sen', 0, 5000]
  ]);
};

McStats.prototype.getAttackSpeed = function() {

};

McStats.prototype.getAttackDistance = function() {

};
