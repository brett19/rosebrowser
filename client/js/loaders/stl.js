var ROSELoader = require('./rose');

/**
 * @constructor
 */
var StringTable = function(rh) {
  this.rh = rh;
  this.format = 0;
  this.keys = [];
  this.offsets = [];
  this.useLanguage = StringTable.LANGUAGE.ENGLISH;
};


/**
 * @enum {Number}
 * @readonly
 */
StringTable.LANGUAGE = {
  KOREAN:              0,
  ENGLISH:             1,
  JAPANESE:            2,
  CHINESE_TRADITIONAL: 3,
  CHINESE_SIMPLIFIED:  4
};


/**
 * @enum {Number}
 * @readonly
 */
StringTable.FORMAT = {
  STL_TEXT:    1 << 0,
  STL_COMMENT: 1 << 1,
  STL_QUEST:   1 << 2
};


/**
 * @constructor
 * @property {String} name
 * @property {Number} id
 */
StringTable.Key = function(name, id) {
  this.name = name;
  this.id = id;
};


/**
 * @constructor
 * @property {String} text
 * @property {String?} comment
 * @property {String?} quest1
 * @property {String?} quest2
 */
StringTable.Entry = function() {
};


/**
 * @param {String} key
 * @returns {StringTable.Entry}
 */
StringTable.prototype.getByKey = function(key)
{
  return this.getById(this.keys[key]);
};


/**
 * @param {Number} id
 * @returns {StringTable.Entry}
 */
StringTable.prototype.getById = function(id)
{
  var entry = new StringTable.Entry();
  this.rh.seek(this.offsets[this.useLanguage][id]);

  if (this.format & StringTable.FORMAT.STL_TEXT) {
    entry.text = this.rh.readVarLengthStr();
  }

  if (this.format & StringTable.FORMAT.STL_COMMENT) {
    entry.comment = this.rh.readVarLengthStr();
  }

  if (this.format & StringTable.FORMAT.STL_QUEST) {
    entry.quest1 = this.rh.readVarLengthStr();
    entry.quest2 = this.rh.readVarLengthStr();
  }

  return entry;
};


/**
 * @callback StringTable~onLoad
 * @param {StringTable} stringTable
 */

/**
 * @param {String} path
 * @param {StringTable~onLoad} callback
 */
StringTable.load = function(path, callback) {
  ROSELoader.load(path, function(/** BinaryReader */rh) {
    var entries, i, languages, magic;
    var data = new StringTable(rh);

    magic = rh.readVarLengthStr();

    if (magic === 'NRST01') {
      data.format = StringTable.FORMAT.STL_TEXT;
    } else if (magic === 'ITST01') {
      data.format = StringTable.FORMAT.STL_TEXT
                  | StringTable.FORMAT.STL_COMMENT;
    } else if (magic === 'QEST01') {
      data.format = StringTable.FORMAT.STL_TEXT
                  | StringTable.FORMAT.STL_COMMENT
                  | StringTable.FORMAT.STL_QUEST;
    } else {
      throw 'Unsupported STL magic header ' + magic;
    }

    entries = rh.readUint32();
    for (i = 0; i < entries; ++i) {
      var name = rh.readVarLengthStr();
      rh.skip(4);
      data.keys[name] = i;
    }

    languages = rh.readUint32();
    for (i = 0; i < languages; ++i) {
      var offset = rh.readUint32();
      var pos    = rh.tell();
      rh.seek(offset);
      data.offsets[i] = rh.readUint32Array(entries);
      rh.seek(pos);
    }

    callback(data);
  });
};

module.exports = StringTable;
