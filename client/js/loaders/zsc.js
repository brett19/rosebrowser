
var ZSCPROPTYPE = {
  Position: 1,
  Rotation: 2,
  Scale: 3,
  AxisRotation: 4,
  BoneIndex: 5,
  DummyIndex: 6,
  Parent: 7,
  Animation: 8,
  Collision: 29,
  ConstantAnimation: 30,
  VisibleRangeSet: 31,
  UseLightmap: 32
};
var ZSCLoader = {};
ZSCLoader.load = function(path, callback) {
  ROSELoader.load(path, function(b) {
    var data = {};

    data.meshes = [];
    var meshCount = b.readUint16();
    for (var i = 0; i < meshCount; ++i) {
      data.meshes.push(b.readStr());
    }

    data.materials = [];
    var materialCount = b.readUint16();
    for (var i = 0; i < materialCount; ++i) {
      var material = {};
      material.texturePath = b.readStr();
      material.forSkinning = b.readUint16() != 0;
      material.alphaEnabled = b.readUint16() != 0;
      material.twoSided = b.readUint16() != 0;
      material.alphaTestEnabled = b.readUint16() != 0;
      material.alphaRef = b.readUint16();
      material.depthTestEnabled = b.readUint16() != 0;
      material.depthWriteEnabled = b.readUint16() != 0;
      material.blendType = b.readUint16();
      material.useSpecular = b.readUint16() != 0;
      material.alpha = b.readFloat();
      material.glowType = b.readUint16();
      material.glowColour = [b.readFloat(), b.readFloat(), b.readFloat()];
      data.materials.push(material);
    }

    data.effects = [];
    var effectCount = b.readUint16();
    for (var i = 0; i < effectCount; ++i) {
      data.effects.push(b.readStr());
    }

    data.objects = [];
    var objectCount = b.readUint16();
    for (var i = 0; i < objectCount; ++i) {
      var obj = {};

      /*bounding cylinder*/ b.skip(3*4);

      obj.parts = [];
      obj.effects = [];
      var partCount = b.readUint16();
      if (partCount > 0) {
        for (var j = 0; j < partCount; ++j) {
          var part = {};

          part.meshIdx = b.readUint16();
          part.materialIdx = b.readUint16();

          var propertyType = 0;
          while ((propertyType = b.readUint8()) != 0) {
            var propertySize = b.readUint8();

            if (propertyType == ZSCPROPTYPE.Position) {
              part.position = b.readVector3().multiplyScalar(ZZ_SCALE_IN).toArray();
            } else if (propertyType == ZSCPROPTYPE.Rotation) {
              part.rotation = b.readBadQuat().toArray();
            } else if (propertyType == ZSCPROPTYPE.Scale) {
              part.scale = b.readVector3().toArray();
            } else if (propertyType == ZSCPROPTYPE.AxisRotation) {
              /*part.axisRotation =*/ b.readBadQuat();
            } else if (propertyType == ZSCPROPTYPE.Parent) {
              part.parent = b.readUint16();
            } else if (propertyType == ZSCPROPTYPE.Collision) {
              part.collisionMode = b.readUint16();
            } else if (propertyType == ZSCPROPTYPE.ConstantAnimation) {
              part.animPath = b.readStrLen(propertySize);
            } else if (propertyType == ZSCPROPTYPE.VisibleRangeSet) {
              /*part.visibleRangeSet =*/ b.readUint16();
            } else if (propertyType == ZSCPROPTYPE.UseLightmap) {
              part.useLightmap = b.readUint16() != 0;
            } else if (propertyType == ZSCPROPTYPE.BoneIndex) {
              part.boneIndex = b.readUint16();
            } else if (propertyType == ZSCPROPTYPE.DummyIndex) {
              part.dummyIndex = b.readUint16();
            } else {
              b.skip(propertySize);
            }
          }

          obj.parts.push(part);
        }

        var effectCount = b.readUint16();
        for (var j = 0; j < effectCount; ++j) {
          var effect = {};

          effect.type = b.readUint16();
          effect.effectIdx = b.readUint16();

          var propertyType = 0;
          while ((propertyType = b.readUint8()) != 0) {
            var propertySize = b.readUint8();

            if (propertyType == ZSCPROPTYPE.Position) {
              effect.position = [b.readFloat(), b.readFloat(), b.readFloat()];
            } else if (propertyType == ZSCPROPTYPE.Rotation) {
              effect.rotation = [b.readFloat(), b.readFloat(), b.readFloat(), b.readFloat()];
            } else if (propertyType == ZSCPROPTYPE.Scale) {
              effect.scale = [b.readFloat(), b.readFloat(), b.readFloat()];
            } else if (propertyType == ZSCPROPTYPE.Parent) {
              effect.parent = b.readUint16();
            } else {
              b.skip(propertySize);
            }
          }

          obj.effects.push(effect);
        }

        /*bounding box*/ b.skip(2*3*4);
      } else {
        obj = null;
      }

      data.objects.push(obj);
    }

    callback(data);
  });
};
