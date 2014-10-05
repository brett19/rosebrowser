ui.IconSlot = function(element) {
  ui.Widget.call(this, element);
  this.clear();
};

ui.IconSlot.MOVE_Z = 9999;

ui.IconSlot.prototype = Object.create(ui.Widget.prototype);

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

ui.IconSlot.prototype._onMouseMove = function(moveEvent) {
  tooltipManager.showTooltip(this._iconTooltip, moveEvent.clientX, moveEvent.clientY);
};

ui.IconSlot.prototype._onMouseOut = function(outEvent) {
  tooltipManager.hideTooltip();
};

ui.IconSlot.prototype._onMouseDown = function(downEvent) {
  if (downEvent.which !== 1) {
    return;
  }

  if (!this.dragEnabled()) {
    return;
  }

  var self = this;
  var icon = this._iconElement;
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
  if (this._iconElement) {
    this._iconElement.remove();
  }

  this._iconElement = null;
  this._tooltip = null;

  if (this._item) {
    this._iconElement = iconManager.getItemIcon(this._item);
    this._iconTooltip = tooltipManager.getItemTooltip(this._item);
  }

  if (this._iconElement) {
    this._iconElement.mousemove(this._onMouseMove.bind(this));
    this._iconElement.mouseout(this._onMouseOut.bind(this));
    this._iconElement.mousedown(this._onMouseDown.bind(this));
    this._iconElement.dblclick(this._onUse.bind(this));
    this._element.append(this._iconElement);
  }
};

ui.iconslot = ui.widgetConstructor('slot', ui.IconSlot);
