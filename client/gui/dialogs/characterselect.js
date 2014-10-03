'use strict';

ui.CharacterSelectDialog = function(template, characters) {
  ui.Dialog.call(this, template);

  this.characterList = ui.list(this, '.list.characters');
  this.characterList.on('itemclicked', this._changeCharacter.bind(this));
  this.characterList.on('itemdoubleclicked', this._selectCharacter.bind(this));

  if (characters) {
    this.setCharacters(characters);
  }
};

ui.CharacterSelectDialog.prototype = Object.create(ui.Dialog.prototype);

ui.CharacterSelectDialog.prototype.setCharacters = function(characters) {
  this.characters = characters;

  for (var i = 0; i < characters.length; ++i) {
    var character = characters[i];
    var item = $('<div />');
    var html = '';
    html += '<b>' + character.name + '</b><br />';
    html += 'Level: ' + character.level + '<br />';
    html += 'Location: ' + character.zoneName;
    item.html(html);
    this.characterList.append(item);
  }

  this.characterList.index(0);
};

ui.CharacterSelectDialog.prototype._changeCharacter = function(index) {
  index = index || this.characterList.index();
  this.emit('selectionChanged', index);
};

ui.CharacterSelectDialog.prototype._selectCharacter = function(index) {
  index = index || this.characterList.index();
  this.emit('done', this.characters[index].name);
  this.close();
};

ui.characterSelectDialog = function(characters) {
  return new ui.CharacterSelectDialog('#dlgCharacterSelect', characters);
};
