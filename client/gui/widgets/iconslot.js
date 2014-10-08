ui.IconSlot = function(element) {
  ui.Widget.call(this, element);
  this._type = HOT_ICON_TYPE.EMPTY;
  this._object = null;
  this._icon = null;
  this._tooltip = null;
  this._usable = true;
  this.clear();
};

ui.IconSlot.prototype = Object.create(ui.Widget.prototype);
ui.IconSlot.MOVE_Z = 9999;

ui.IconSlot.prototype.type = function(type) {
  if (type === undefined) {
    return this._type;
  } else {
    this._type = type;
    this._update();
  }
};

ui.IconSlot.prototype.icon = function(object) {
  if (object === undefined) {
    return this._object;
  } else {
    this._object = object;
    this._update();
  }
};

ui.IconSlot.prototype.clear = function() {
  this._type = HOT_ICON_TYPE.EMPTY;
  this._object = null;
  this._update();
};

ui.IconSlot.prototype.setIcon = function(type, icon) {
  this._type = type;
  this._object = icon;
  this._update();
};

ui.IconSlot.prototype.setItem = function(item) {
  this._type = HOT_ICON_TYPE.ITEM;
  this._object = item;
  this._update();
};

ui.IconSlot.prototype.setCommand = function(command) {
  this._type = HOT_ICON_TYPE.COMMAND;
  this._object = command;
  this._update();
};

ui.IconSlot.prototype.setSkill = function(skill) {
  this._type = HOT_ICON_TYPE.SKILL;
  this._object = skill;
  this._update();
};

ui.IconSlot.prototype.setEmote = function(emote) {
  this._type = HOT_ICON_TYPE.EMOTE;
  this._object = emote;
  this._update();
};

ui.IconSlot.prototype.setDialog = function(dialog) {
  this._type = HOT_ICON_TYPE.DIALOG;
  this._object = dialog;
  this._update();
};

ui.IconSlot.prototype.setClanSkill = function(skill) {
  this._type = HOT_ICON_TYPE.CLAN_SKILL;
  this._object = skill;
  this._update();
};

ui.IconSlot.prototype.dragEnabled = function(drag) {
  if (drag === undefined) {
    return !this._element.hasClass('nodrag');
  } else if (drag !== this.dragEnabled){
    this._element.toggleClass('nodrag');
  }
};

ui.IconSlot.prototype.acceptsAll = function(accept) {
  if (accept === undefined) {
    return this._element.hasClass('accepts-all');
  } else if (accept !== this.acceptsAll()){
    this._element.toggleClass('accepts-all');
  }
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

ui.IconSlot.prototype.use = function() {
  switch (this._type) {
  case HOT_ICON_TYPE.ITEM:
    MC.inventory.useItem(this._object);
    break;
  case HOT_ICON_TYPE.SKILL:
    MC.skills.useSkill(this._object);
    break;
  case HOT_ICON_TYPE.COMMAND:
  case HOT_ICON_TYPE.EMOTE:
  case HOT_ICON_TYPE.DIALOG:
  case HOT_ICON_TYPE.CLAN_SKILL:
  default:
    console.warn('Unimplemented hot icon type in IconSlot.use', this._type);
  };
}

ui.IconSlot.prototype._onSwap = function(other) {
  this.emit('swap', other);
};

ui.IconSlot.prototype._onDoubleClick = function() {
  if (this._usable) {
    this.use();
  }
};

ui.IconSlot.prototype._onMouseMove = function(moveEvent) {
  tooltipManager.showTooltip(this._tooltip, moveEvent.clientX, moveEvent.clientY);
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
  var offset = self._icon.offset();
  var dragStarted = false;

  function mouseMove(moveEvent) {
    if (!dragStarted) {
      dragStarted = true;

      self._icon.css('position', 'absolute');
      self._icon.css('z-index', ui.IconSlot.MOVE_Z);
      self._icon.detach();
      $('.ui').append(self._icon);
      self._icon.offset({
        left: offset.left,
        top: offset.top
      });
    }

    self._icon.offset({
      left: moveEvent.pageX - downEvent.pageX + offset.left,
      top: moveEvent.pageY - downEvent.pageY + offset.top
    });
  };

  function mouseUp(upEvent) {
    $(document).off('mousemove', mouseMove);
    $(document).off('mouseup', mouseUp);

    if (!dragStarted) {
      return;
    }

    self._icon.hide();
    var target = $(document.elementFromPoint(upEvent.clientX, upEvent.clientY));
    self._icon.css('z-index', '');
    self._icon.css('position', 'relative');
    self._icon.show();
    self._icon.detach();
    self._element.append(self._icon);
    self._icon.offset(offset);

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
  };

  $(document).on('mousemove', mouseMove);
  $(document).on('mouseup', mouseUp);
};

ui.IconSlot.prototype._update = function() {
  if (this._icon) {
    this._icon.remove();
  }

  this._icon = null;
  this._tooltip = null;

  switch (this._type) {
  case HOT_ICON_TYPE.ITEM:
    this._icon = iconManager.getItemIcon(this._object);
    this._tooltip = tooltipManager.getItemTooltip(this._object);
    break;
  case HOT_ICON_TYPE.COMMAND:
    this._icon = iconManager.getCommandIcon(this._object);
    this._tooltip = tooltipManager.getCommandTooltip(this._object);
    break;
  case HOT_ICON_TYPE.SKILL:
    this._icon = iconManager.getSkillIcon(this._object);
    this._tooltip = tooltipManager.getSkillTooltip(this._object);
    break;
  case HOT_ICON_TYPE.EMOTE:
    this._icon = iconManager.getEmoteIcon(this._object);
    this._tooltip = tooltipManager.getEmoteTooltip(this._object);
    break;
  case HOT_ICON_TYPE.DIALOG:
    this._icon = iconManager.getDialogIcon(this._object);
    this._tooltip = tooltipManager.getDialogTooltip(this._object);
    break;
  case HOT_ICON_TYPE.CLAN_SKILL:
    this._icon = iconManager.getClanSkillIcon(this._object);
    this._tooltip = tooltipManager.getClanSkillTooltip(this._object);
    break;
  }

  if (this._icon) {
    this._icon.mousemove(this._onMouseMove.bind(this));
    this._icon.mouseout(this._onMouseOut.bind(this));
    this._icon.mousedown(this._onMouseDown.bind(this));
    this._icon.dblclick(this._onDoubleClick.bind(this));
    this._element.append(this._icon);
  }
};

// Constructors
ui.IconSlot.Create = function() {
  return $('<div class="slot" />');
};

ui.iconslot = ui.widgetConstructor('slot', ui.IconSlot);
