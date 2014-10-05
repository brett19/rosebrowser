'use strict';

ui.IconSlot = function(element) {
  ui.Widget.call(this, element);
  this.clear();
};

ui.IconSlot.MOVE_Z = 9999;

ui.IconSlot.prototype = Object.create(ui.Widget.prototype);

ui.IconSlot.prototype.icon = function(icon) {
  if (icon === undefined) {
    return this._icon;
  } else {
    this._icon = icon;
    this._update();
  }
};

ui.IconSlot.prototype.item = function(item) {
  if (item === undefined) {
    return this._item;
  } else {
    this._item = item;
    this._update();
  }
};

ui.IconSlot.prototype.dragEnabled = function(drag) {
  if (drag === undefined) {
    return !this._element.hasClass('nodrag');
  } else if (drag !== this.dragEnabled){
    this._element.toggleClass('nodrag');
  }
};

ui.IconSlot.prototype.clear = function() {
  this._icon = null;
  this._tooltip = null;
  this._item = null;
  this._skill = null;
  this._update();
};

ui.IconSlot.prototype.acceptsSkill = function(accept) {
  if (accept === undefined) {
    return this._element.hasClass('accepts-skill');
  } else if (accept !== this.acceptsSkill()){
    this._element.toggleClass('accepts-skill');
  }
};

ui.IconSlot.prototype.acceptsItem = function(accept) {
  if (accept === undefined) {
    return this._element.hasClass('accepts-item');
  } else if (accept !== this.acceptsItem()){
    this._element.toggleClass('accepts-item');
  }
};

ui.IconSlot.prototype._onSwap = function(other) {
  this.emit('swap', other);
};

ui.IconSlot.prototype._onUse = function(downEvent) {
  this.emit('use');
};

ui.IconSlot.prototype._onMouseDown = function(downEvent) {
  if (!this.dragEnabled()) {
    return;
  }

  var self = this;
  var icon = this._icon._element;
  var offset = icon.offset();
  icon.css('z-index', ui.IconSlot.MOVE_Z);

  function mouseMove(moveEvent) {
    icon.offset({
      left: moveEvent.pageX - downEvent.pageX + offset.left,
      top: moveEvent.pageY - downEvent.pageY + offset.top
    });
  };

  function mouseUp(upEvent) {
    icon.hide();
    var target = $(document.elementFromPoint(upEvent.clientX, upEvent.clientY));
    icon.css('z-index', '');
    icon.show();
    icon.offset(offset);

    if (!target.hasClass('slot')) {
      var parent = target.parent();

      if (parent.hasClass('slot')) {
        target = parent;
      }
    }

    if (target.is('canvas')) {
      self._onSwap('drop');
    } else if (target.hasClass('slot') && !target.is(self._element)) {
      var otherClass = target.attr('class');
      var match = otherClass.match(/[a-z\-]*-slot-[0-9]*/);

      if (match) {
        self._onSwap(match[0]);
      }
    }

    $(document).off('mousemove', mouseMove);
    $(document).off('mouseup', mouseUp);
  };

  $(document).on('mousemove', mouseMove);
  $(document).on('mouseup', mouseUp);
};

ui.IconSlot.prototype._update = function() {
  var icon = null;
  this._element.html('');

  if (this._item) {
    // Generate icon
    var itemData = GDM.getNow('item_data');
    var data = itemData.getData(this._item.itemType, this._item.itemNo);
    var name = itemData.getName(this._item.itemType, this._item.itemNo);
    var desc = itemData.getDescription(this._item.itemType, this._item.itemNo);

    // Generate icon
    var icon = iconManager.getItemIcon(data[9]);

    // TODO: Tooltip generation
    // TODO: Sockets & gem
    if (this._item.itemType === ITEMTYPE.USE ||
        this._item.itemType === ITEMTYPE.ETC ||
        this._item.itemType === ITEMTYPE.NATURAL ||
        this._item.itemType === ITEMTYPE.QUEST) {
      icon.quantity = this._item.quantity;
    }

    // Generate tooltip
    this._tooltip = '';
    this._tooltip += '<div class="item name">' + name + '</div>';
    this._tooltip += '<div class="item name">' + desc + '</div>';
  }

  this._icon = icon;

  if (icon) {
    var html = '<div class="icon" style="';
    html += 'background: url(' + icon.url + '); ';
    html += 'background-position: ' + icon.x + 'px ' + icon.y + 'px; ';
    html += '">';

    if (icon.quantity) {
      html += '<div class="quantity">' + icon.quantity + '</div>';
    }

    html += '</div>';

    icon._element = $(html);
    icon._element.mousedown(this._onMouseDown.bind(this));
    icon._element.dblclick(this._onUse.bind(this));
    this._element.append(icon._element);
  }
};

ui.iconslot = ui.widgetConstructor('slot', ui.IconSlot);
