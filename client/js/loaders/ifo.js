
var IFOBLOCKTYPE = {
  MapInformation: 0,
  Object: 1,
  NPC: 2,
  Building: 3,
  Sound: 4,
  Effect: 5,
  Animation: 6,
  WaterPatch: 7,
  MonsterSpawn: 8,
  WaterPlane: 9,
  WarpPoint: 10,
  CollisionObject: 11,
  EventObject: 12
};
function IFOData() {
  this.buildings = [];
  this.objects = [];
}
var IFOLoader = {};
IFOLoader.load = function(path, callback) {
  ROSELoader.load(path, function(b) {
    var data = new IFOData();

    var blockCount = b.readUint32();
    function readMapObject() {
      var obj = {};
      obj.name = b.readByteStr();
      obj.warpId = b.readUint16();
      obj.eventId = b.readUint16();
      obj.objectType = b.readUint32();
      obj.objectId = b.readUint32();
      /*obj.mapPosition*/ b.skip(2*4);
      obj.rotation = b.readQuat();
      obj.position = b.readVector3().multiplyScalar(ZZ_SCALE_IN);
      obj.scale = b.readVector3();
      return obj;
    }
    function readBlock(blockType) {
      if (blockType === IFOBLOCKTYPE.Building) {
        var entryCount = b.readUint32();
        for (var i = 0; i < entryCount; ++i) {
          var obj = readMapObject();
          data.buildings.push(obj);
        }
      } else if (blockType === IFOBLOCKTYPE.Object) {
        var entryCount = b.readUint32();
        for (var i = 0; i < entryCount; ++i) {
          var obj = readMapObject();
          data.objects.push(obj);
        }
      }
    }
    for (var i = 0; i < blockCount; ++i) {
      var blockType = b.readUint32();
      var blockOffset = b.readUint32();
      var nextBlockPos = b.tell();
      b.seek(blockOffset);
      readBlock(blockType);
      b.seek(nextBlockPos);
    }

    callback(data);
  });
};
