'use strict';

ui.CharacterSelectDialog = function(template, characters) {
  ui.Dialog.call(this, template);

  this._characterList = ui.list(this, '.list.characters');
  this._characterList.on('itemclicked', this._changeCharacter.bind(this));
  this._characterList.on('itemdoubleclicked', this._selectCharacter.bind(this));
  this._characters = characters;
  this._update();
};

ui.CharacterSelectDialog.prototype = Object.create(ui.Dialog.prototype);

ui.CharacterSelectDialog.prototype._update = function() {
  for (var i = 0; i < this._characters.length; ++i) {
    var character = this._characters[i];
    var item = $('<div />');
    var html = '';
    html += '<b>' + character.name + '</b><br />';
    html += 'Level: ' + character.level + '<br />';
    html += 'Location: ' + character.zoneName;
    item.html(html);
    this._characterList.append(item);
  }

  this._characterList.index(0);
};

ui.CharacterSelectDialog.prototype._changeCharacter = function(index) {
  index = index || this._characterList.index();
  this.emit('selectionChanged', index);
};

ui.CharacterSelectDialog.prototype._selectCharacter = function(index) {
  index = index || this._characterList.index();
  this.emit('done', this._characters[index].name);
  this.close();
};

ui.characterSelectDialog = function(characters) {
  return new ui.CharacterSelectDialog('#dlgCharacterSelect', characters);
};
