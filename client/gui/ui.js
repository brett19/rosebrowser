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

ui._getWidgetElement = function(type, widget, arg1, arg2) {
  var element = null;

  if (arg1 instanceof ui.Widget && typeof(arg2) === 'string') {
    element = arg1._element.find(arg2);
  } else if (arg1 instanceof jQuery) {
    element = arg1;
  } else if (typeof(arg1) === 'string') {
    var classes = arg1.split('.');
    element = widget.Create();
    for (var i = 0; i < classes.length; ++i) {
      if (classes[i].length) {
        element.addClass(classes[i]);
      }
    }
  } else if (arg1 === undefined && arg2 === undefined) {
    element = widget.Create();
  }

  if (element instanceof jQuery && element.length === 0) {
    element = null;
  }

  if (element) {
    if (element.length > 1) {
      throw new Error('Tried to create a new ' + type + ' on a jQuery object with multiple elements');
    }

    if (!element.hasClass(type)) {
      throw new Error('Tried to create a new ' + type + ' widget on an element without the class');
    }
  }

  return element;
};

ui.widgetConstructor = function(name, widget) {
  return function(arg1, arg2) {
    var element = ui._getWidgetElement(name, widget, arg1, arg2);

    if (element) {
      return new widget(element);
    } else {
      return null;
    }
  };
}

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
