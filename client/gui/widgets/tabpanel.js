'use strict';

ui.TabPanel = function(element) {
  ui.Widget.call(this, element);

  // Default to horizontal tab buttons
  if (!this._element.hasClass('vertical') && !this._element.hasClass('horizontal')) {
    this._element.addClass('horizontal');
  }

  this._tabs = [];
  this._index = 0;
  this._update();
};

ui.TabPanel.prototype = Object.create(ui.Widget.prototype);

ui.TabPanel.prototype._update = function() {
  var buttons = this._element.children('.header').children('.button');
  var tabs = this._element.children('.tab');

  if (buttons.length !== tabs.length) {
    console.log('Tab panel with different amount of buttons and contents');
  }

  this._tabs = [];

  for (var i = 0; i < buttons.length && i < tabs.length; ++i) {
    var button = ui.button($(buttons[i]));
    var tab = ui.tab($(tabs[i]));

    button.on('clicked', this.index.bind(this, i));

    this._tabs.push({
      button: button,
      tab: tab
    });
  }

  buttons[0].click();
};

ui.TabPanel.prototype.tab = function(index) {
  return this._tabs[index].tab;
};

ui.TabPanel.prototype.index = function(index) {
  if (index === undefined) {
    return this._index;
  } else {
    for (var i = 0; i < this._tabs.length; ++i) {
      this._tabs[i].button.active(false);
      this._tabs[i].tab.hide();
    }

    this._index = index;
    this._tabs[index].button.active(true);
    this._tabs[index].tab.show();
  }
};

ui.Tab = function(element) {
  ui.Widget.call(this, element);
};

ui.Tab.prototype = Object.create(ui.Widget.prototype);

// Constructors
ui.TabPanel.Create = function() {
  return $('<div class="tabpanel"><div class="header" /></div>');
};

ui.Tab.Create = function() {
  return $('<div class="tab" />');
};

ui.tabpanel = ui.widgetConstructor('tabpanel', ui.TabPanel);
ui.tab = ui.widgetConstructor('tab', ui.Tab);
