'use strict';

ui.IconSlot = function(parent, element, accepts) {
  ui.Widget.call(this, parent, element);
  this._icon = null;
  this.setAccepts(accepts);
};

ui.IconSlot.MOVE_Z = 9999;

ui.IconSlot.prototype = Object.create(ui.Widget.prototype);

ui.IconSlot.prototype.getIcon = function(icon) {
  return this._icon;
};

ui.IconSlot.prototype.setIcon = function(icon) {
  this._icon = icon;
  this._update();
};

ui.IconSlot.prototype.setAccepts = function(accepts) {
  var types = ['item', 'skill'];

  for (var i = 0; i < types.length; ++i) {
    this._element.removeClass(types[i]);
  }

  for (var i = 0; i < accepts.length; ++i) {
    if (types.indexOf(accepts[i]) === -1) {
      console.warn('Unknown item slot accepts type ' + accepts[i]);
    }

    this._element.addClass('accepts-' + accepts[i]);
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
    var html = '<div style="';
    html += 'background: url(' + icon.url + '); ';
    html += 'background-position: ' + icon.x + 'px ' + icon.y + 'px; ';
    html += '"></div>';

    icon._element = $(html);
    icon._element.mousedown(this._onMouseDown.bind(this));
    icon._element.dblclick(this._onSwap.bind(this, 'equip'));
    this._element.append(icon._element);
  }
};

ui.iconslot = function(parent, element, accepts) {
  accepts = accepts || [];

  if (typeof(element) === 'string') {
    var id = element;
    element = parent._element.find(id);

    if (element.length == 0) {
      element = $('<div class="' + id.substr(1) + ' slot"></div>');
      element.appendTo(parent._element);
    }

    if (id[0] === '#') {
      console.warn('Item slots must use class not id');
    }
  }

  return new ui.IconSlot(parent, element, accepts);
};
