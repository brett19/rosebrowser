'use strict';
ui.loadTemplateFile('charactercreate.html');

ui.CharacterCreateDialog = function() {
  ui.Dialog.call(this, 'charactercreate.html');

  this._name = ui.textbox(this, '.textbox.name');
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

  this._genderIndex = 0;
  this._faceIndex = 0;
  this._hairStyleIndex = 0;
  this._hairColorIndex = 0;
  this._update();
};

ui.CharacterCreateDialog.prototype = Object.create(ui.Dialog.prototype);

ui.CharacterCreateDialog.prototype._onCreate = function() {
  var name = this._name.text();

  if (name.length < 4 || name.length > 20) {
    ui.messageBox('Character name must be between 4 and 20 characters long.');
    return;
  }

  if (!name.match(/^[A-Za-z0-9]*$/)) {
    ui.messageBox('Character name must only contain the characters [A-Z], [a-z], [0-9].');
    return;
  }

  this.emit('create',
            name,
            ui.CharacterCreateDialog.Genders[this._genderIndex][0],
            ui.CharacterCreateDialog.Faces[this._faceIndex][0],
            ui.CharacterCreateDialog.HairStyles[this._hairStyleIndex][0],
            ui.CharacterCreateDialog.HairColors[this._hairColorIndex][0]);
};

ui.CharacterCreateDialog.prototype._onCancel = function() {
  this.emit('cancel');
  this.close();
};

ui.CharacterCreateDialog.prototype._update = function() {
  this._gender.text(ui.CharacterCreateDialog.Genders[this._genderIndex][1]);
  this._face.text(ui.CharacterCreateDialog.Faces[this._faceIndex][1]);
  this._hairStyle.text(ui.CharacterCreateDialog.HairStyles[this._hairStyleIndex][1]);
  this._hairColor.text(ui.CharacterCreateDialog.HairColors[this._hairColorIndex][1]);
};

ui.CharacterCreateDialog.Genders = [
  [0, 'Male'],
  [1, 'Female']
];

ui.CharacterCreateDialog.Faces = [
  [1, '1'],
  [8, '2'],
  [15, '3'],
  [22, '4'],
  [29, '5'],
  [36, '6'],
  [43, '7'],
  [50, '8'],
  [57, '9'],
  [64, '10'],
  [71, '11'],
  [78, '12'],
  [85, '13'],
  [92, '14'],
  [99, '15'],
  [106, '16'],
  [113, '17'],
  [120, '18'],
  [127, '19'],
  [134, '20'],
  [162, '21'],
  [169, '22'],
  [176, '23'],
  [183, '24'],
  [190, '25'],
  [197, '26'],
  [204, '27'],
  [211, '28'],
  [218, '29']
];

ui.CharacterCreateDialog.HairStyles = [
  [0, '1'],
  [5, '2'],
  [10, '3'],
  [15, '4'],
  [20, '5'],
  [25, '6'],
  [30, '7'],
  [35, '8'],
  [40, '9'],
  [45, '10'],
  [50, '11'],
  [55, '12'],
  [60, '13'],
  [65, '14'],
  [70, '15'],
  [75, '16'],
  [80, '17'],
  [85, '18'],
  [90, '19'],
  [95, '20'],
  [100, '21']
];

ui.CharacterCreateDialog.HairColors = [
  [1, 'White'],
  [2, 'Grey'],
  [3, 'Black'],
  [4, 'Brown'],
  [5, 'Red'],
  [6, 'Orange'],
  [7, 'Amber'],
  [8, 'Dirty Blonde'],
  [9, 'Blonde'],
  [10, 'Pink'],
  [11, 'Hot Pink'],
  [12, 'Pink'],
  [13, 'Orchid'],
  [14, 'Lavender'],
  [15, 'Purple'],
  [16, 'Steel Blue'],
  [17, 'Cobalt'],
  [18, 'Blue'],
  [19, 'Aqua'],
  [20, 'Emerald'],
  [21, 'Green']
];

ui.CharacterCreateDialog.prototype._onPrevGender = function() {
  this._genderIndex--;

  if (this._genderIndex < 0) {
    this._genderIndex = ui.CharacterCreateDialog.Genders.length - 1;
  }

  this._update();
  this.emit('change_gender', ui.CharacterCreateDialog.Genders[this._genderIndex][0]);
};

ui.CharacterCreateDialog.prototype._onNextGender = function() {
  this._genderIndex++;

  if (this._genderIndex >= ui.CharacterCreateDialog.Genders.length) {
    this._genderIndex = 0;
  }

  this._update();
  this.emit('change_gender', ui.CharacterCreateDialog.Genders[this._genderIndex][0]);
};

ui.CharacterCreateDialog.prototype._onPrevFace = function() {
  this._faceIndex--;

  if (this._faceIndex < 0) {
    this._faceIndex = ui.CharacterCreateDialog.Faces.length - 1;
  }

  this._update();
  this.emit('change_face', ui.CharacterCreateDialog.Faces[this._faceIndex][0]);
};

ui.CharacterCreateDialog.prototype._onNextFace = function() {
  this._faceIndex++;

  if (this._faceIndex >= ui.CharacterCreateDialog.Faces.length) {
    this._faceIndex = 0;
  }

  this._update();
  this.emit('change_face', ui.CharacterCreateDialog.Faces[this._faceIndex][0]);
};

ui.CharacterCreateDialog.prototype._onPrevHairStyle = function() {
  this._hairStyleIndex--;

  if (this._hairStyleIndex < 0) {
    this._hairStyleIndex = ui.CharacterCreateDialog.HairStyles.length - 1;
  }

  this._update();
  this.emit('change_hair_style', ui.CharacterCreateDialog.HairStyles[this._hairStyleIndex][0]);
};

ui.CharacterCreateDialog.prototype._onNextHairStyle = function() {
  this._hairStyleIndex++;

  if (this._hairStyleIndex >= ui.CharacterCreateDialog.HairStyles.length) {
    this._hairStyleIndex = 0;
  }

  this._update();
  this.emit('change_hair_style', ui.CharacterCreateDialog.HairStyles[this._hairStyleIndex][0]);
};

ui.CharacterCreateDialog.prototype._onPrevHairColor = function() {
  this._hairColorIndex--;

  if (this._hairColorIndex < 0) {
    this._hairColorIndex = ui.CharacterCreateDialog.HairColors.length - 1;
  }

  this._update();
  this.emit('change_hair_color', ui.CharacterCreateDialog.HairColors[this._hairColorIndex][0]);
};

ui.CharacterCreateDialog.prototype._onNextHairColor = function() {
  this._hairColorIndex++;

  if (this._hairColorIndex >= ui.CharacterCreateDialog.HairColors.length) {
    this._hairColorIndex = 0;
  }

  this._update();
  this.emit('change_hair_color', ui.CharacterCreateDialog.HairColors[this._hairColorIndex][0]);
};

ui.characterCreateDialog = function() {
  return new ui.CharacterCreateDialog();
};
