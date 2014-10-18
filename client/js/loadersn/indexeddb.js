'use strict';

function IndexedDb(data, stringDb) {
  this.data = data;
  this.rowCount = this.data.readUint32();
  var colCount = this.data.readUint32();
  this.rowOffsets = [];
  for (var i = 0; i < this.rowCount; ++i) {
    this.rowOffsets.push(this.data.readUint32());
  }
  this.columns = [];
  for (var j = 0; j < colCount; ++j) {
    this.columns.push({
      type: this.data.readUint32(),
      name: ''
    });
  }
  for (var j = 0; j < colCount; ++j) {
    this.columns[j].name = this.data.readUint16Str();
  }

  this.stringDb = stringDb;
  this.rowCache = {};
}

IndexedDb.ColumnType = {
  Integer: 1,
  StringIdx: 2,
  ZoneFile: 15
};

IndexedDb.prototype.get = function(rowIdx) {
  if (this.rowCache[rowIdx]) {
    return this.rowCache[rowIdx];
  }

  var rowOffset = this.rowOffsets[rowIdx];
  if (rowOffset === 0xFFFFFFFF) {
    return null;
  }

  var row = {};
  this.data.seek(rowOffset);

  var colPartCount = Math.ceil(this.columns.length / 32);
  var colParts = [];
  for (var j = 0; j < colPartCount; ++j) {
    colParts.push(this.data.readUint32());
  }
  for (var i = 0; i < this.columns.length; ++i) {
    var col = this.columns[i];
    var whichBit = i % 32;
    var whichPart = Math.floor(i / 32);
    if (colParts[whichPart] & (1 << whichBit)) {
      var colType = col.type;
      var thisVal = this.data.readUint32();
      if (colType === IndexedDb.ColumnType.Integer) {
        row[col.name] = thisVal;
      } else if (colType === IndexedDb.ColumnType.StringIdx) {
        row[col.name] = this.stringDb.get(thisVal);
      } else if (colType === IndexedDb.ColumnType.ZoneFile) {
        row[col.name] = {
          zoneFileRef: 'cache/zone/' + thisVal.toString(16)
        };
      } else {
        row[col.name] = thisVal;
      }

    } else {
      row[col.name] = undefined;
    }
  }

  this.rowCache[rowIdx] = row;
  return row;
};

IndexedDb.load = function(path, stringDb, callback) {
  var loader = new THREE.XHRLoader();
  loader.setResponseType('arraybuffer');
  loader.load(ROSE_DATA_PATH + path, function (buffer) {
    var out = new IndexedDb(new RbReader(buffer), stringDb);
    callback(null, out);
  });
};
