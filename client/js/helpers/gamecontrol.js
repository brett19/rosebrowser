function _GameControl() {
}

_GameControl.prototype.moveTo = function(x, y, z) {
  netGame.moveTo(x, y, z);
  return MC._moveTo(x, y);
};

_GameControl.prototype.moveToObj = function(gameObject, distance) {
  if (!(gameObject instanceof GameObject)) {
    console.warn('Object passed to moveToObj was not a GameObject.');
    return;
  }

  netGame.moveTo(
      gameObject.position.x,
      gameObject.position.y,
      gameObject.position.z,
      gameObject.serverObjectIdx);
  return MC._moveToObj(gameObject.ref, distance);
};

_GameControl.prototype.attackObj = function(gameObject) {
  if (!(gameObject instanceof GameObject)) {
    console.warn('Object passed to attackObj was not a GameObject.');
    return;
  }

  netGame.attackObj(gameObject.serverObjectIdx);
  return MC._attackObj(gameObject.ref);
};

var GC = new _GameControl();
module.exports = GC;
