'use strict';

var ui = { };

ui.uniqueID = 1;
ui._element = $('<div class="ui" />');
ui._templates = $('<div id="templates" />');
ui._zIndex  = 10;
ui._dialogs = [];

ui.loadTemplate = function(path, callback) {
  ui._templates.load(path, callback);
  $('body').append(ui._element);
};

ui.loadFromTemplate = function(id) {
  var element = ui._templates.find(id).clone();
  id = id + '-' + ui.uniqueID++;
  element.attr('id', id);
  return element;
};

ui.addDialog = function(dialog) {
  ui._element.append(dialog._element);
  ui._dialogs.push(dialog);
  ui.bringToTop(dialog);
};

ui.removeDialog = function(dialog) {
  var index = ui._dialogs.indexOf(dialog);
  if (index === -1) {
    console.warn('Attempted to remove an unregistered dialog');
    return;
  }

  dialog._element.remove();
  dialog._element = null;
  ui._dialogs.splice(index, 1);
  ui._updateDialogOrder();
};

ui.bringToTop = function(dialog) {
  // Do something with dialog
  var index = ui._dialogs.indexOf(dialog);
  if (index === -1) {
    console.warn('Attempted to bring to top an unregistered dialog');
    return;
  }

  ui._dialogs.splice(index, 1);
  ui._dialogs.push(dialog);
  ui._updateDialogOrder();
};

ui._updateDialogOrder = function() {
  for (var i = 0; i < ui._dialogs.length; ++i) {
    ui._dialogs[i]._element.css('z-index', ui._zIndex + i);
  }
};

ui.KEY_CODES = {
  BACKSPACE: 8,
  TAB: 9,
  ENTER: 13,
  SHIFT: 16,
  CTRL: 17,
  ALT: 18,
  PAUSE: 19,
  CAPS_LOCK: 20,
  ESCAPE: 27,
  SPACE: 32,
  PAGE_UP: 33,
  PAGE_DOWN: 34,
  END: 45,
  HOME: 46,
  LEFT_ARROW: 37,
  UP_ARROW: 38,
  RIGHT_ARROW: 39,
  DOWN_ARROW: 40,
  INSERT: 45,
  DELETE: 46
};
