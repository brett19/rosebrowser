'use strict';

ui.CharacterCreateDialog = function(template) {
  ui.Dialog.call(this, template);

  this._gender = ui.label(this, '.label.gender');
  this._face = ui.label(this, '.label.face');
  this._hairStyle = ui.label(this, '.label.hair-style');
  this._hairColor = ui.label(this, '.label.hair-color');

  ui.button(this, '.button.prev.gender').on('clicked', this._onPrevGender.bind(this));
  ui.button(this, '.button.next.gender').on('clicked', this._onNextGender.bind(this));

  ui.button(this, '.button.prev.face').on('clicked', this._onPrevFace.bind(this));
  ui.button(this, '.button.next.face').on('clicked', this._onNextFace.bind(this));

  ui.button(this, '.button.prev.hair-style').on('clicked', this._onPrevHairStyle.bind(this));
  ui.button(this, '.button.next.hair-style').on('clicked', this._onNextHairStyle.bind(this));

  ui.button(this, '.button.prev.hair-color').on('clicked', this._onPrevHairColor.bind(this));
  ui.button(this, '.button.next.hair-color').on('clicked', this._onNextHairColor.bind(this));

  ui.button(this, '.button.create').on('clicked', this._onCreate.bind(this));
  ui.button(this, '.button.cancel').on('clicked', this._onCancel.bind(this));
};

ui.CharacterCreateDialog.Genders = [
  'Male',
  'Female'
];

ui.CharacterCreateDialog.HairColors = [
  'Dirty Blonde',
  'Blonde',
  'Pink'
];

ui.CharacterCreateDialog.FaceCount = 29;
ui.CharacterCreateDialog.HairStyleCount = 21;

ui.CharacterCreateDialog.prototype = Object.create(ui.Dialog.prototype);

ui.CharacterCreateDialog.prototype._onCreate = function() {
  this.emit('create');
};

ui.CharacterCreateDialog.prototype._onCancel = function() {
  this.emit('cancel');
  this.close();
};

ui.CharacterCreateDialog.prototype._onPrevGender = function() {
  var genders = ui.CharacterCreateDialog.Genders;
  var gender = genders.indexOf(this._gender.text());

  gender--;
  if (gender < 0) {
    gender = genders.length - 1;
  }

  this._gender.text(genders[gender]);
  this.emit('change_gender', gender);
};

ui.CharacterCreateDialog.prototype._onNextGender = function() {
  var genders = ui.CharacterCreateDialog.Genders;
  var gender = genders.indexOf(this._gender.text());

  gender++;
  if (gender >= genders.length) {
    gender = 0;
  }

  this._gender.text(genders[gender]);
  this.emit('change_gender', gender);
};

ui.CharacterCreateDialog.prototype._onPrevFace = function() {
  var face = parseInt(this._face.text());

  face--;
  if (face < 0) {
    face = ui.CharacterCreateDialog.FaceCount - 1;
  }

  this._face.text(face);
  this.emit('change_face', face);
};

ui.CharacterCreateDialog.prototype._onNextFace = function() {
  var face = parseInt(this._face.text());

  face++;
  if (face >= ui.CharacterCreateDialog.FaceCount) {
    face = 0;
  }

  this._face.text(face);
  this.emit('change_face', face);
};

ui.CharacterCreateDialog.prototype._onPrevHairStyle = function() {
  var hairStyle = parseInt(this._hairStyle.text());

  hairStyle--;
  if (hairStyle < 0) {
    hairStyle = ui.CharacterCreateDialog.HairStyleCount - 1;
  }

  this._hairStyle.text(hairStyle);
  this.emit('change_hair_style', hairStyle);
};

ui.CharacterCreateDialog.prototype._onNextHairStyle = function() {
  var hairStyle = parseInt(this._hairStyle.text());

  hairStyle++;
  if (hairStyle >= ui.CharacterCreateDialog.HairStyleCount) {
    hairStyle = 0;
  }

  this._hairStyle.text(hairStyle);
  this.emit('change_hair_style', hairStyle);
};

ui.CharacterCreateDialog.prototype._onPrevHairColor = function() {
  var colors = ui.CharacterCreateDialog.HairColors;
  var color = colors.indexOf(this._hairColor.text());

  color--;
  if (color < 0) {
    color = colors.length - 1;
  }

  this._hairColor.text(colors[color]);
  this.emit('change_hair_color', color);
};

ui.CharacterCreateDialog.prototype._onNextHairColor = function() {
  var colors = ui.CharacterCreateDialog.HairColors;
  var color = colors.indexOf(this._hairColor.text());

  color++;
  if (color >= colors.length) {
    color = 0;
  }

  this._hairColor.text(colors[color]);
  this.emit('change_hair_color', color);
};

ui.characterCreateDialog = function() {
  return new ui.CharacterCreateDialog('#dlgCharacterCreate');
};
