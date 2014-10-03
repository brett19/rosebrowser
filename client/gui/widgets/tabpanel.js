'use strict';

ui.TabPanel = function(parent, element) {
  ui.Widget.call(this, parent, element);
  this._update();
};

ui.TabPanel.prototype = Object.create(ui.Widget.prototype);
ui.TabPanel.prototype._tabs = [];
ui.TabPanel.prototype._index = 0;

ui.Tab = function(parent, element) {
  ui.Widget.call(this, parent, element);
};

ui.Tab.prototype = Object.create(ui.Widget.prototype);

ui.TabPanel.prototype._update = function() {
  var buttons = this._element.children('.header').children('.button');
  var tabs = this._element.children('.tab');

  if (buttons.length !== tabs.length) {
    console.log('Tab panel with different amount of buttons and contents');
  }

  this._tabs = [];

  for (var i = 0; i < buttons.length && i < tabs.length; ++i) {
    var button = ui.button(this, $(buttons[i]));
    var tab = ui.tab(this, $(tabs[i]));

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
      this._tabs[i].button._element.removeClass('active');
      this._tabs[i].tab.hide();
    }

    this._index = index;
    this._tabs[index].button._element.addClass('active');
    this._tabs[index].tab.show();
  }
};

ui.tabpanel = function(parent, element) {
  if (typeof(element) === 'string') {
    element = parent._element.find(element);
  }

  return new ui.TabPanel(parent, element);
};

ui.tab = function(parent, element) {
  if (typeof(element) === 'string') {
    element = parent._element.find(element);
  }

  return new ui.Tab(parent, element);
};
