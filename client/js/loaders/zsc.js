/**
 * @constructor
 * @property {String[]} meshes
 * @property {ModelList.Material[]} materials
 * @property {String[]} effects
 * @property {ModelList.Model[]} models
 */
var ModelList = function() {
  this.meshes = [];
  this.materials = [];
  this.effects = [];
  this.models = [];
};


/**
 * @constructor
 * @property {String} texturePath
 * @property {Boolean} forSkinning
 * @property {Boolean} alphaEnabled
 * @property {Boolean} twoSided
 * @property {Boolean} alphaTestEnabled
 * @property {Number} alphaRef
 * @property {Boolean} depthTestEnabled
 * @property {Boolean} depthWriteEnabled
 * @property {Number} blendType
 * @property {Boolean} useSpecular
 * @property {Number} alpha
 * @property {Number} glowType
 * @property {THREE.Colour} glowColour
 */
ModelList.Material = function() {
};


/**
 * @constructor
 * @property {ModelList.Model.Part[]} parts
 * @property {ModelList.Model.Effect[]} effects
 */
ModelList.Model = function() {
  this.parts = [];
  this.effects = [];
};


/**
 * @constructor
 * @property {Number} type
 * @property {Number} meshIdx
 * @property {Number} materialIdx
 * @property {THREE.Vector3} position
 * @property {THREE.Quaternion} rotation
 * @property {THREE.Vector3} scale
 * @property {Number} parent
 * @property {THREE.Quaternion} axisRotation
 * @property {Number} collisionMode
 * @property {String} animPath
 * @property {Number} visibleRangeSet
 * @property {Boolean} useLightmap
 * @property {Number} boneIndex
 * @property {Number} dummyIndex
 */
ModelList.Model.Part = function() {
};


/**
 * @constructor
 * @property {Number} type
 * @property {Number} effectIdx
 * @property {THREE.Vector3} position
 * @property {THREE.Quaternion} rotation
 * @property {THREE.Vector3} scale
 * @property {Number} parent
 */
ModelList.Model.Effect = function() {
};


/**
 * @enum {Number}
 * @readonly
 */
ModelList.PROPERTY_TYPE = {
  POSITION:           1,
  ROTATION:           2,
  SCALE:              3,
  AXIS_ROTATION:      4,
  BONE_INDEX:         5,
  DUMMY_INDEX:        6,
  PARENT:             7,
  ANIMATION:          8,
  COLLISION:          29,
  CONSTANT_ANIMATION: 30,
  VISIBLE_RANGE_SET:  31,
  USE_LIGHTMAP:       32
};


/**
 * @callback ModelList~onLoad
 * @param {ModelList} modelList
 */

/**
 * @param {String} path
 * @param {ModelList~onLoad} callback
 */
ModelList.load = function(path, callback) {
  ROSELoader.load(path, function(/** BinaryReader */rh) {
    var i, j, meshes, materials, effects, models;
    var data = new ModelList();

    meshes = rh.readUint16();
    for (i = 0; i < meshes; ++i) {
      data.meshes.push(rh.readStr());
    }

    materials = rh.readUint16();
    for (i = 0; i < materials; ++i) {
      var material = new ModelList.Material();
      material.texturePath       = rh.readStr();
      material.forSkinning       = rh.readUint16() !== 0;
      material.alphaEnabled      = rh.readUint16() !== 0;
      material.twoSided          = rh.readUint16() !== 0;
      material.alphaTestEnabled  = rh.readUint16() !== 0;
      material.alphaRef          = rh.readUint16();
      material.depthTestEnabled  = rh.readUint16() !== 0;
      material.depthWriteEnabled = rh.readUint16() !== 0;
      material.blendType         = rh.readUint16();
      material.useSpecular       = rh.readUint16() !== 0;
      material.alpha             = rh.readFloat();
      material.glowType          = rh.readUint16();
      material.glowColour        = rh.readColour();
      data.materials.push(material);
    }

    effects = rh.readUint16();
    for (i = 0; i < effects; ++i) {
      data.effects.push(rh.readStr());
    }

    models = rh.readUint16();
    for (i = 0; i < models; ++i) {
      var model, parts, effects, type, size;

      rh.skip(3*4); // Bounding cylinder
      parts = rh.readUint16();

      if (parts > 0) {
        model = new ModelList.Model();

        for (j = 0; j < parts; ++j) {
          var part = new ModelList.Model.Part();
          part.meshIdx = rh.readUint16();
          part.materialIdx = rh.readUint16();

          while ((type = rh.readUint8()) != 0) {
            size = rh.readUint8();

            switch (type) {
            case ModelList.PROPERTY_TYPE.POSITION:
              part.position = rh.readVector3().multiplyScalar(ZZ_SCALE_IN);
              break;
            case ModelList.PROPERTY_TYPE.ROTATION:
              part.rotation = rh.readBadQuat();
              break;
            case ModelList.PROPERTY_TYPE.SCALE:
              part.scale = rh.readVector3();
              break;
            case ModelList.PROPERTY_TYPE.PARENT:
              part.parent = rh.readUint16();
              break;
            case ModelList.PROPERTY_TYPE.AXIS_ROTATION:
              part.axisRotation = rh.readBadQuat();
              break;
            case ModelList.PROPERTY_TYPE.COLLISION:
              part.collisionMode = rh.readUint16();
              break;
            case ModelList.PROPERTY_TYPE.CONSTANT_ANIMATION:
              part.animPath = rh.readStrLen(size);
              break;
            case ModelList.PROPERTY_TYPE.VISIBLE_RANGE_SET:
              part.visibleRangeSet = rh.readUint16();
              break;
            case ModelList.PROPERTY_TYPE.USE_LIGHTMAP:
              part.useLightmap = !!rh.readUint16();
              break;
            case ModelList.PROPERTY_TYPE.BONE_INDEX:
              part.boneIndex = rh.readUint16();
              break;
            case ModelList.PROPERTY_TYPE.DUMMY_INDEX:
              part.dummyIndex = rh.readUint16();
              break;
            default:
              console.log('Skipping unknown ZSC model part property type ' + type);
              rh.skip(size);
            }
          }

          model.parts.push(part);
        }

        effects = rh.readUint16();
        for (j = 0; j < effects; ++j) {
          var effect = new ModelList.Model.Effect();
          effect.type = rh.readUint16();
          effect.effectIdx = rh.readUint16();

          while ((type = rh.readUint8()) != 0) {
            size = rh.readUint8();

            switch (type) {
            case ModelList.PROPERTY_TYPE.POSITION:
              effect.position = rh.readVector3().multiplyScalar(ZZ_SCALE_IN);
              break;
            case ModelList.PROPERTY_TYPE.ROTATION:
              effect.rotation = rh.readBadQuat();
              break;
            case ModelList.PROPERTY_TYPE.SCALE:
              effect.scale = rh.readVector3();
              break;
            case ModelList.PROPERTY_TYPE.PARENT:
              effect.parent = rh.readUint16();
              break;
            default:
              console.log('Skipping unknown ZSC model effect property type ' + type);
              rh.skip(size);
            }
          }

          model.effects.push(effect);
        }

        // Confirmed to be laughably invalid.
        rh.skip(2 * 3 * 4); // Bounding box
      } else {
        model = null;
      }

      data.models.push(model);
    }

    callback(data);
  });
};
