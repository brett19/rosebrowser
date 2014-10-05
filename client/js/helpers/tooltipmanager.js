'use strict';

var TooltipManager = function() {
  this.itemData = null;
  this._tooltipElement = null;
  this._disableTooltips = false;
  this._expandTooltips = false;

  $(document).on('mousedown', this._onGlobalMouseDown.bind(this));
  $(document).on('mouseup', this._onGlobalMouseUp.bind(this));
};

TooltipManager.prototype._onGlobalMouseDown = function(downEvent) {
  if (downEvent.which === 1) {
    this._disableTooltips = true;

    if (this._tooltipElement) {
      this._tooltipElement.css('opacity', '0');
    }
  } else if (downEvent.which === 3) {
    this._expandTooltips = true;
  }
};

TooltipManager.prototype._onGlobalMouseUp = function(upEvent) {
  if (upEvent.which === 1) {
    this._disableTooltips = false;

    if (this._tooltipElement) {
      this._tooltipElement.css('opacity', '1');
    }
  }else if (upEvent.which === 3) {
    this._expandTooltips = false;
  }
};

TooltipManager.prototype.showTooltip = function(tooltip, x, y) {
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

TooltipManager.prototype.moveTooltip = function(x, y) {
  this._tooltipElement.offset({ left: x, top: y });
};

TooltipManager.prototype.hideTooltip = function() {
  this._tooltipElement.hide();
};

TooltipManager.prototype.addItemName = function(item, html) {
  var name = this.itemData.getName(item.itemType, item.itemNo);
  html += '<div class="item name">'
  html += name;
  html += '</div>';
  return html;
};

TooltipManager.prototype.addItemDescription = function(item, html) {
  var desc = this.itemData.getDescription(item.itemType, item.itemNo);
  html += '<div class="item description">'
  html += desc;
  html += '</div>';
  return html;
};

TooltipManager.prototype.getItemTooltip = function(item) {
  if (!this.itemData) {
    this.itemData = GDM.getNow('item_data');
  }

  var html = '<div>';
  html = this.addItemName(item, html);
  html = this.addItemDescription(item, html);
  html += '</div>';
  return $(html);
};

var tooltipManager = new TooltipManager();
