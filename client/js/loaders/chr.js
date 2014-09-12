
var CHRLoader = {};
CHRLoader.load = function(path, callback) {
  ROSELoader.load(path, function (b) {
    var data = {};

    data.skeletons = [];
    var skeletonCount = b.readUint16();
    for (var i = 0; i < skeletonCount; ++i) {
      data.skeletons.push(b.readStr());
    }

    data.animations = [];
    var animationCount = b.readUint16();
    for (var i = 0; i < animationCount; ++i) {
      data.animations.push(b.readStr());
    }

    data.effects = [];
    var effectCount = b.readUint16();
    for (var i = 0; i < effectCount; ++i) {
      data.effects.push(b.readStr());
    }

    data.characters = [];
    var characterCount = b.readUint16();
    for (var i = 0; i < characterCount; ++i) {
      var char = {};

      var charEnabled = b.readUint8() != 0;
      if (charEnabled) {
        char.skeletonIdx = b.readUint16();
        char.name = b.readStr();

        char.models = [];
        var modelCount = b.readUint16();
        for (var j = 0; j < modelCount; ++j) {
          char.models.push(b.readUint16());
        }

        char.animations = {};
        var animationCount = b.readUint16();
        for (var j = 0; j < animationCount; ++j) {
          var animType = b.readUint16();
          char.animations[animType] = b.readUint16();
        }

        char.effects = [];
        var effectCount = b.readUint16();
        for (var j = 0; j < effectCount; ++j) {
          var effect = {};
          effect.boneIdx = b.readUint16();
          effect.effectIdx = b.readUint16();
          char.effects.push(effect);
        }

      } else {
        char = null;
      }

      data.characters.push(char);
    }

    callback(data);
  });
};
