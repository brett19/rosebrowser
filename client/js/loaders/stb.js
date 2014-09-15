/**
 * @constructor
 */
var DataTable = function() {
  this.columns = [];
  this.rows = [];
  this.rootColumn = [];
};


/**
 * @callback DataTable~onLoad
 * @param {DataTable} dataTable
 */

/**
 * @param {String} path
 * @param {DataTable~onLoad} callback
 */
DataTable.load = function(path, callback) {
  ROSELoader.load(path, function(/** BinaryReader */rh) {
    var columns, i, j, magic, offset, rows, textDecoder;
    var data = new DataTable();
    magic = rh.readStrLen(4);

    if (magic !== 'STB1') {
      throw 'Unsupported STB magic header ' + magic;
    }

    textDecoder = new TextDecoder('euc-kr');

    function readString() {
      return textDecoder.decode(rh.readBytes(rh.readUint16()));
    }

    offset  = rh.readUint32();
    rows    = rh.readUint32();
    columns = rh.readUint32();
    data.rowHeight = rh.readUint32();

    data.rootColumn.width = rh.readUint16();
    for (i = 0; i < columns; ++i) {
      data.columns[i] = { width: rh.readUint16() };
    }

    data.rootColumn.name = readString();
    for (i = 0; i < columns; ++i) {
      data.columns[i].name = readString();
    }

    for (i = 0; i < rows - 1; ++i) {
      data.rows[i] = [readString()];
    }

    rh.seek(offset);

    for (i = 0; i < rows - 1; ++i) {
      for (j = 0; j < columns - 1; ++j) {
        data.rows[i][j] = readString();
      }
    }

    callback(data);
  });
};
