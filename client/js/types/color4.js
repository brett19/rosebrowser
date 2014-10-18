'use strict';

/**
 * Because THREE.Color is RGB only.
 *
 * @constructor
 * @param {Number} [r]
 * @param {Number} [g]
 * @param {Number} [b]
 * @param {Number} [a]
 * @property {Number} r
 * @property {Number} g
 * @property {Number} b
 * @property {Number} a
 */
var Color4 = function(r, g, b, a) {
  this.r = r || 0;
  this.g = g || 0;
  this.b = b || 0;
  this.a = a || 0;
};

Color4.prototype.clone = function() {
  return new Color4(this.r, this.g, this.b, this.a);
};

Color4.prototype.add = function(color) {
  this.r += color.r;
  this.g += color.g;
  this.b += color.b;
  this.a += color.a;
  return this;
};

Color4.prototype.multiplyScalar = function(scalar) {
  this.r *= scalar;
  this.g *= scalar;
  this.b *= scalar;
  this.a *= scalar;
  return this;
};

module.exports = Color4;
