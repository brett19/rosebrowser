'use strict';

ui.IconSlot = function(element) {
  ui.Widget.call(this, element);
  this._icon = null;
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
}

ui.IconSlot.prototype.clear = function() {
  this._icon = null;
  this._update();
};

ui.IconSlot.prototype.setItem = function(item) {
  var itemData = GDM.getNow('item_data');
  var data = itemData.getData(item.itemType, item.itemNo);
  var name = itemData.getName(item.itemType, item.itemNo);
  var desc = itemData.getDescription(item.itemType, item.itemNo);
  var icon = iconManager.getItemIcon(data[9]);

  // TODO: Tooltip generation
  // TODO: Sockets & gem
  if (item.itemType === ITEMTYPE.USE ||
      item.itemType === ITEMTYPE.ETC ||
      item.itemType === ITEMTYPE.NATURAL ||
      item.itemType === ITEMTYPE.QUEST) {
    icon.quantity = item.quantity;
  }

  this.icon(icon);
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

ui.IconSlot.prototype._onMouseDown = function(downEvent) {
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
  var icon = this._icon;
  this._element.html('');

  if (icon) {
    var html = '<div class="icon" style="';
    html += 'background: url(' + icon.url + '); ';
    html += 'background-position: ' + icon.x + 'px ' + icon.y + 'px; ';
    html += '"></div>';

    icon._element = $(html);
    icon._element.mousedown(this._onMouseDown.bind(this));
    icon._element.dblclick(this._onSwap.bind(this, 'equip'));
    this._element.append(icon._element);

    if (icon.quantity) {
      html = '<div class="quantity">' + icon.quantity + '</div>';
      this._element.append($(html));
    }
  }
};

ui.iconslot = ui.widgetConstructor('slot', ui.IconSlot);
