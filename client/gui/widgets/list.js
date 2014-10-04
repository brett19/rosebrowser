'use strict';

ui.List = function(parent, element) {
  ui.Widget.call(this, parent, element);
};

ui.List.prototype = Object.create(ui.Widget.prototype);

ui.List.prototype._items = [];
ui.List.prototype._index = 0;

ui.List.prototype.append = function(item) {
  if (!(item instanceof ui.ListItem)) {
    item = ui.listitem(this, item);
  }

  var index = this._items.length;
  this._items.push(item);
  this._element.append(item._element);
  item.on('clicked', this._onItemClicked.bind(this, index));
  item.on('doubleclicked', this._onItemDoubleClicked.bind(this, index));
  return item;
};

ui.List.prototype.index = function(index, noClick) {
  if (index === undefined) {
    return this._index;
  } else {
    this._index = index;
    this._element.children('.selected').removeClass('selected');

    if (this._items.length > 0) {
      this._items[index]._element.addClass('selected');
    } else {
      index = -1;
    }

    if (!noClick) {
      if (index === -1) {
        this.emit('itemclicked', index);
      } else {
        this._items[index].click();
      }
    }
  }
};

ui.List.prototype.clear = function() {
  this._items = [];
  this._index = -1;
  this._element.html('');
};

ui.List.prototype._onItemClicked = function(index) {
  this.index(index, true);
  this.emit('itemclicked', index);
};

ui.List.prototype._onItemDoubleClicked = function(index) {
  this.index(index, true);
  this.emit('itemdoubleclicked', index);
};

ui.list = function(parent, element) {
  if (typeof(element) === 'string') {
    element = parent._element.find(element);
  }

  return new ui.List(parent, element);
};

ui.ListItem = function(parent, element) {
  ui.Widget.call(this, parent, element);
  this._element.click(this._onClicked.bind(this));
  this._element.dblclick(this._onDoubleClicked.bind(this));
};

ui.ListItem.prototype = Object.create(ui.Widget.prototype);

ui.ListItem.prototype.click = function() {
  this._onClicked();
};

ui.ListItem.prototype._onClicked = function() {
  this.emit('clicked');
};

ui.ListItem.prototype._onDoubleClicked = function() {
  this.emit('doubleclicked');
};

ui.listitem = function(parent, element) {
  if (typeof(element) === 'string') {
    element = parent._element.find(element);
  }

  return new ui.ListItem(parent, element);
};
