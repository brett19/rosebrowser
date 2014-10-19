var _TooltipManager = function() {
  this.itemData = null;
  this.skillData = null;
  this._tooltipElement = null;
  this._disableTooltips = false;
  this._expandTooltips = false;

  $(document).on('mousedown', this._onGlobalMouseDown.bind(this));
  $(document).on('mouseup', this._onGlobalMouseUp.bind(this));
};

_TooltipManager.prototype._onGlobalMouseDown = function(downEvent) {
  if (downEvent.which === 1) {
    this._disableTooltips = true;

    if (this._tooltipElement) {
      this._tooltipElement.css('opacity', '0');
    }
  } else if (downEvent.which === 3) {
    this._expandTooltips = true;
  }
};

_TooltipManager.prototype._onGlobalMouseUp = function(upEvent) {
  if (upEvent.which === 1) {
    this._disableTooltips = false;

    if (this._tooltipElement) {
      this._tooltipElement.css('opacity', '1');
    }
  }else if (upEvent.which === 3) {
    this._expandTooltips = false;
  }
};

_TooltipManager.prototype.showTooltip = function(tooltip, x, y) {
  if (!this._tooltipElement) {
    this._tooltipElement = $('<div class="tooltip" />');
    $('.ui').append(this._tooltipElement);
  }

  if (!this._disableTooltips) {
    this._tooltipElement.html(tooltip);
    this._tooltipElement.show();
    this.moveTooltip(x, y);
  }
};

_TooltipManager.prototype.moveTooltip = function(x, y) {
  var width = this._tooltipElement.outerWidth();
  var height = this._tooltipElement.outerHeight();
  x = Math.max(0, Math.min(x, window.innerWidth - width));
  y = Math.max(0, Math.min(y, window.innerHeight - height));
  this._tooltipElement.offset({ left: x + 1, top: y + 1 });
};

_TooltipManager.prototype.hideTooltip = function() {
  this._tooltipElement.hide();
};

_TooltipManager.prototype.addItemName = function(item, html) {
  var name = this.itemData.getName(item.itemType, item.itemNo);
  html += '<div class="item name">'
  html += name;
  html += '</div>';
  return html;
};

_TooltipManager.prototype.addItemDescription = function(item, html) {
  var desc = this.itemData.getDescription(item.itemType, item.itemNo);
  html += '<div class="item description">'
  html += desc;
  html += '</div>';
  return html;
};

_TooltipManager.prototype.getItemTooltip = function(item) {
  if (!this.itemData) {
    this.itemData = GDM.getNow('item_data');
  }

  var html = '<div>';
  html = this.addItemName(item, html);
  html = this.addItemDescription(item, html);
  html += '</div>';
  return $(html);
};

_TooltipManager.prototype.getCommandTooltip = function(command) {
};

_TooltipManager.prototype.addSkillName = function(skill, html) {
  var name = this.skillData.getName(skill.skillIdx);
  html += '<div class="skill name">'
  html += name;
  html += '</div>';
  return html;
};

_TooltipManager.prototype.addSkillDescription = function(skill, html) {
  var desc = this.skillData.getDescription(skill.skillIdx);
  html += '<div class="skill description">'
  html += desc;
  html += '</div>';
  return html;
};

_TooltipManager.prototype.getSkillTooltip = function(skill) {
  if (!this.skillData) {
    this.skillData = GDM.getNow('skill_data');
  }

  var html = '<div>';
  html = this.addSkillName(skill, html);
  html = this.addSkillDescription(skill, html);
  html += '</div>';
  return $(html);
};

_TooltipManager.prototype.getEmoteTooltip = function(emote) {
};

_TooltipManager.prototype.getDialogTooltip = function(dialog) {
};

_TooltipManager.prototype.getClanSkillTooltip = function(skill) {
};

var TooltipManager = new _TooltipManager();
module.exports = TooltipManager;
