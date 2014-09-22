'use strict';

function _CharSelDialog() {
  EventEmitter.call(this);

  var self = this;
  $(function() {
    self.me = $('#dlgCharSel');
    self.charList = self.me.find('.panel-body');
  });

  this.charBoxes = null;
}
_CharSelDialog.prototype = new EventEmitter();

_CharSelDialog.prototype.show = function() {
  this.me.show();
};
_CharSelDialog.prototype.hide = function() {
  this.me.hide();
};

_CharSelDialog.prototype.selectCharacter = function(charIdx) {
  console.log('select character', charIdx);
  for (var i = 0; i < this.charBoxes.length; ++i) {
    if (i === charIdx) {
      this.charBoxes[i].addClass('selected');
    } else {
      this.charBoxes[i].removeClass('selected');
    }
  }
  this.emit('select_char', charIdx);
};

_CharSelDialog.prototype.confirmSelection = function() {
  console.log('confirm selection');
  this.emit('confirm_char');
};

_CharSelDialog.prototype.setCharacters = function(characters) {
  this.charList.empty();
  this.charBoxes = [];
  for (var i = 0; i < characters.length; ++i) {
    var character = characters[i];

    var charBox = $('<div class="character"><b class="name"></b><br />Level: <span class="level"></span><br />Location: <span class="loc"></span></div>');
    charBox.find('.name').text(character.name);
    charBox.find('.level').text(character.level);
    charBox.find('.loc').text(character.zoneName);

    charBox.on('click', function(charIdx) {
      this.selectCharacter(charIdx);
    }.bind(this, i));
    charBox.on('dblclick', function() {
      this.confirmSelection();
    }.bind(this));

    this.charList.append(charBox);
    this.charBoxes.push(charBox);
  }
};


var CharSelDialog = new _CharSelDialog();
