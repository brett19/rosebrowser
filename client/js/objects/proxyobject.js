var GameObject = require('./gameobject');

/**
 * A class used as a placeholder for objects which are not actually visible
 * locally.  This allows us to share various tracking details between objects
 * which are tracking the same out-of-sight character.
 *
 * @constructor
 */
function ProxyObject(world) {
  // Proxy objects shouldn't need a world reference.
  GameObject.call(this, 'proxy', null);
}
ProxyObject.prototype = new GameObject();

module.exports = ProxyObject;
