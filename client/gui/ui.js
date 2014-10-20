var ui = { };

ui.uniqueID = 1;
ui._element = $('<div class="ui" />');
ui._zIndex  = 10;
ui._dialogs = [];
ui._templates = {};
ui._templateFiles = [];

ui.loadTemplateFile = function(name) {
  ui._templateFiles.push(name);
};

ui.loadTemplates = function(basePath, callback) {
  var waitAll = new MultiWait();

  for (var i = 0; i < ui._templateFiles.length; ++i) {
    var name = ui._templateFiles[i];
    var template = $('<div />');
    template.load(basePath + '/' + name, waitAll.one());
    ui._templates[name] = template;
  }

  $('body').append(ui._element);
  waitAll.wait(callback);
};

ui.loadFromTemplate = function(name) {
  return ui._templates[name].children('.dialog').clone();
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

global.ui = ui;

// Stuff...  Everything extends `ui`.
require('./gameui.js');
require('./nameplate.js');

// Widgets
require('./widgets/widget.js');
require('./widgets/dialog.js');
require('./widgets/button.js');
require('./widgets/checkbox.js');
require('./widgets/iconslot.js');
require('./widgets/label.js');
require('./widgets/list.js');
require('./widgets/panel.js');
require('./widgets/progressbar.js');
require('./widgets/radiogroup.js');
require('./widgets/tabpanel.js');
require('./widgets/textbox.js');
require('./widgets/titlebar.js');

// Dialogs
require('./dialogs/charactercreate.js');
require('./dialogs/characterselect.js');
require('./dialogs/characterstatus.js');
require('./dialogs/chatbox.js');
require('./dialogs/character.js');
require('./dialogs/debug.js');
require('./dialogs/inventory.js');
require('./dialogs/login.js');
require('./dialogs/menu.js');
require('./dialogs/messagebox.js');
require('./dialogs/npcchat.js');
require('./dialogs/party.js');
require('./dialogs/questlist.js');
require('./dialogs/serverselect.js');
require('./dialogs/skills.js');
require('./dialogs/status.js');
require('./dialogs/quickbar.js');
