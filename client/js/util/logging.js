function DebugLogger(name, enabled) {
  this.name = name;
  this.enabled = enabled;
}

DebugLogger.prototype.enable = function() {
  this.enabled = true;
};

DebugLogger.prototype.disable = function() {
  this.enabled = false;
};

DebugLogger.prototype.group = function() {
  if (this.enabled) {
    console.group.apply(console, arguments);
  }
};

DebugLogger.prototype.groupCollapsed = function() {
  if (this.enabled) {
    console.groupCollapsed.apply(console, arguments);
  }
};

DebugLogger.prototype.groupEnd = function() {
  if (this.enabled) {
    console.groupEnd.apply(console, arguments);
  }
};

DebugLogger.prototype.debug = function() {
  if (this.enabled) {
    console.debug.apply(console, arguments);
  }
};

DebugLogger.prototype.warn = function() {
  if (this.enabled) {
    console.warn.apply(console, arguments);
  }
};

DebugLogger.prototype.error = function() {
  if (this.enabled) {
    console.error.apply(console, arguments);
  }
};

module.exports = DebugLogger;
