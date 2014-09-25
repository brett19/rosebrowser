'use strict';

/**
 * @constructor
 */
var DataTable = function() {
  this.reader = null;
  this.rowCount = 0;
  this.columnCount = 0;
  this.offsets = null;
  this.rowCache = {};
};

DataTable.prototype.row = function(rowIdx) {
  if (this.rowCache[rowIdx]) {
    return this.rowCache[rowIdx];
  }

  var rowOffsetIdx = rowIdx * this.columnCount;
  var row = [];
  for (var i = 0; i < this.columnCount; ++i) {
    this.reader.seek(this.offsets[rowOffsetIdx+i]);
    row.push(this.reader.readUint16Str());
  }

  this.rowCache[rowIdx] = row;
  return row;
};

DataTable.prototype.item = function(rowIdx, columnIdx) {
  return this.row(rowIdx)[columnIdx];
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
    var columns, i, j, magic, offset, rows;
    var data = new DataTable();
    magic = rh.readStrLen(4);

    if (magic !== 'STB1') {
      throw 'Unsupported STB magic header ' + magic;
    }

    offset  = rh.readUint32();
    rows    = rh.readUint32();
    columns = rh.readUint32();
    data.rowHeight = rh.readUint32();

    data.reader = rh;
    data.rowCount = rows - 1;
    data.columnCount = columns - 1;

    rh.seek(offset);

    data.offsets = new Uint32Array(data.rowCount * data.columnCount);
    var offsetIdx = 0;
    for (i = 0; i < data.rowCount; ++i) {
      for (j = 0; j < data.columnCount; ++j) {
        data.offsets[offsetIdx++] = rh.tell();
        rh.skip(rh.readUint16());
      }
    }

    callback(data);
  });
};
