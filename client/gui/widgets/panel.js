'use strict';

ui.Panel = function(element) {
  ui.Widget.call(this, element);
};

ui.Panel.prototype = Object.create(ui.Widget.prototype);

// Constructors
ui.Panel.Create = function() {
  return $('<div class="panel" />');
};

ui.panel = ui.widgetConstructor('panel', ui.Panel);
