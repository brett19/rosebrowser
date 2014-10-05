'use strict';

ui.List = function(element) {
  ui.Widget.call(this, element);
};

ui.List.prototype = Object.create(ui.Widget.prototype);

ui.List.prototype._items = [];
ui.List.prototype._index = 0;

ui.List.prototype.append = function(item) {
  if (!(item instanceof ui.ListItem)) {
    item = ui.listitem(item);
  }

  var index = this._items.length;
  item.on('clicked', this._onItemClicked.bind(this, index));
  item.on('doubleclicked', this._onItemDoubleClicked.bind(this, index));

  this._items.push(item);
  this._element.append(item._element);
  return item;
};

ui.List.prototype.index = function(index, noClick) {
  if (index === undefined) {
    return this._index;
  } else {
    this._index = index;

    for (var i = 0; i < this._items.length; ++i) {
      this._items[i].selected(i === index);
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

ui.ListItem = function(parent, element) {
  ui.Widget.call(this, parent, element);
  this._element.click(this._onClicked.bind(this));
  this._element.dblclick(this._onDoubleClicked.bind(this));
};

ui.ListItem.prototype = Object.create(ui.Widget.prototype);

ui.ListItem.prototype.click = function() {
  this._onClicked();
};

ui.ListItem.prototype.text = function(text) {
  this._element.text(text);
};

ui.ListItem.prototype.html = function(html) {
  this._element.html(html);
};

ui.ListItem.prototype.selected = function(selected) {
  if (selected === undefined) {
    return this._element.hasClass('selected');
  } else if (selected !== this.selected()){
    this._element.toggleClass('selected');
  }
};

ui.ListItem.prototype._onClicked = function() {
  this.emit('clicked');
};

ui.ListItem.prototype._onDoubleClicked = function() {
  this.emit('doubleclicked');
};

ui.list = ui.widgetConstructor('list', ui.List);
ui.listitem = ui.widgetConstructor('listitem', ui.ListItem);
