'use strict';

/**
 * @constructor
 * @param {String[]}                  skeletons
 * @param {String[]}                  animations
 * @param {String[]}                  effects
 * @param {CharacterList.Character[]} characters
 */
var CharacterList = function() {
  this.skeletons  = [];
  this.animations = [];
  this.effects    = [];
  this.characters = [];
};

/**
 * @constructor
 * @property {Number[]}                         models
 * @property {Object}                           animations
 * @property {CharacterList.Character.Effect[]} effects
 */
CharacterList.Character = function() {
  this.models     = [];
  this.animations = {};
  this.effects    = [];
};

/**
 * @constructor
 * @property {Number} boneIdx
 * @property {Number} effectIdx
 */
CharacterList.Character.Effect = function() {
};

/**
 * @callback CharacterList~onLoad
 * @param {CharacterList} characterList
 */

/**
 * @param {String} path
 * @param {CharacterList~onLoad} callback
 */
CharacterList.load = function(path, callback) {
  ROSELoader.load(path, function (/** BinaryReader */rh) {
    var i, j, models;
    var data = new CharacterList();

    var skeletons = rh.readUint16();
    for (i = 0; i < skeletons; ++i) {
      data.skeletons.push(rh.readStr());
    }

    var animations = rh.readUint16();
    for (i = 0; i < animations; ++i) {
      data.animations.push(rh.readStr());
    }

    var effects = rh.readUint16();
    for (i = 0; i < effects; ++i) {
      data.effects.push(rh.readStr());
    }

    var characters = rh.readUint16();
    for (i = 0; i < characters; ++i) {
      var character = null;

      if (!!rh.readUint8()) {
        character = new CharacterList.Character();
        character.skeletonIdx = rh.readUint16();
        character.name = rh.readStr();

        models = rh.readUint16();
        for (j = 0; j < models; ++j) {
          character.models.push(rh.readUint16());
        }

        animations = rh.readUint16();
        for (j = 0; j < animations; ++j) {
          var type = rh.readUint16();
          character.animations[type] = rh.readUint16();
        }

        effects = rh.readUint16();
        for (j = 0; j < effects; ++j) {
          var effect = new CharacterList.Character.Effect();
          effect.boneIdx = rh.readUint16();
          effect.effectIdx = rh.readUint16();
          character.effects.push(effect);
        }
      }

      data.characters.push(character);
    }

    callback(data);
  });
};
