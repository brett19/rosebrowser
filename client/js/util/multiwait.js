function MultiWait() {
  this.count = 0;
  this.callback = null;

  var self = this;
  this.waitFn = function() {
    self.count--;
    if (self.count === 0 && self.callback) {
      self.callback();
    }
  };
}
MultiWait.prototype.one = function() {
  this.count++;
  return this.waitFn;
};
MultiWait.prototype.wait = function(callback) {
  if (this.count === 0) {
    if (callback) {
      callback();
    }
  } else {
    this.callback = callback;
  }
};

module.exports = MultiWait;
