function GORef(obj) {
  this._object = obj;
}

GORef.prototype = {
  get object() {
    if (this._object instanceof ProxyObject) {
      return null;
    }
    return this._object;
  },
  get position() {
    return this._object.position;
  },
  get serverObjectIdx() {
    return this._object.serverObjectIdx;
  }
};

module.exports = GORef;
