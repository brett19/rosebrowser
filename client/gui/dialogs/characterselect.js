'use strict';

ui.CharacterSelectDialog = function(template, characters) {
  ui.Dialog.call(this, template);

  this._characterList = ui.list(this, '.list.characters');
  this._characterList.on('itemclicked', this._changeCharacter.bind(this));
  this._characterList.on('itemdoubleclicked', this._selectCharacter.bind(this));

  ui.button(this, '.button.create').on('clicked', this._onCreateClicked.bind(this));
  ui.button(this, '.button.delete').on('clicked', this._onDeleteClicked.bind(this));
  ui.button(this, '.button.back').on('clicked', this._onBackClicked.bind(this));

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

ui.CharacterSelectDialog.prototype._onCreateClicked = function() {
  this.emit('create');
};

ui.CharacterSelectDialog.prototype._onDeleteClicked = function() {
  this.emit('delete');
};

ui.CharacterSelectDialog.prototype._onBackClicked = function() {
  this.emit('cancel');
};

ui.characterSelectDialog = function(characters) {
  return new ui.CharacterSelectDialog('#dlgCharacterSelect', characters);
};
