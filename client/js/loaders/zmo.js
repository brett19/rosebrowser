var ROSELoader = require('./rose');

/**
 * @constructor
 * @property {Number} fps
 * @property {Number} frameCount
 * @property {AnimationData.Channel[]} channels
 */
var AnimationData = function() {
  this.fps = 0;
  this.frameCount = 0;
  this.channels = [];
  this.eventFrames = [];
  this.interpInterval = 500;
}


/**
 * @constructor
 * @param {Number} type
 * @param {Number} index
 * @property {Number} type
 * @property {Number} index
 * @property {Object[]} frames
 */
AnimationData.Channel = function(type, index) {
  this.type = type;
  this.index = index;
  this.frames = [];
};


/**
 * @enum {Number}
 * @readonly
 */
AnimationData.CHANNEL_TYPE = {
  None: 1 << 0, // 1
  Position: 1 << 1, // 2
  Rotation: 1 << 2, // 4
  Normal: 1 << 3, // 8
  Alpha: 1 << 4, // 16
  Uv1: 1 << 5, // 32
  Uv2: 1 << 6, // 64
  Uv3: 1 << 7, // 128
  Uv4: 1 << 8, // 256
  TexAnim: 1 << 9, // 512
  Scale: 1 << 10 // 1024
};

/**
 * @callback Animation~onLoad
 * @param {AnimationData} animation
 */

/**
 * @param {String} path
 * @param {Animation~onLoad} callback
 */
AnimationData.load = function(path, callback) {
  ROSELoader.load(path, function(/** BinaryReader */rh) {
    var channels, i, j, magic;
    var data = new AnimationData();

    magic = rh.readStrLen(7);
    rh.skip(1);

    if (magic !== 'ZMO0002') {
      throw 'Unexpected ZMO magic header ' + magic + ' in ' + path;
    }

    data.fps = rh.readUint32();
    data.frameCount = rh.readUint32();

    channels = rh.readUint32();
    for (i = 0; i < channels; ++i) {
      var type  = rh.readUint32();
      var index = rh.readUint32();
      data.channels.push(new AnimationData.Channel(type, index));
    }

    data.frameEvents = [];
    for (i = 0; i < data.frameCount; ++i) {
      data.frameEvents.push(0);

      for (j = 0; j < channels; ++j) {
        var frame;

        switch (data.channels[j].type) {
        case AnimationData.CHANNEL_TYPE.Position:
          frame = rh.readVector3().multiplyScalar(ZZ_SCALE_IN);
          break;
        case AnimationData.CHANNEL_TYPE.Rotation:
          frame = rh.readQuatwxyz();
          break;
        case AnimationData.CHANNEL_TYPE.Scale:
          frame = rh.readVector3();
          break;
        case AnimationData.CHANNEL_TYPE.Normal:
          frame = rh.readVector3();
          break;
        case AnimationData.CHANNEL_TYPE.Alpha:
          frame = rh.readFloat();
          break;
        case AnimationData.CHANNEL_TYPE.Uv1:
          frame = rh.readVector2();
          break;
        case AnimationData.CHANNEL_TYPE.Uv2:
          frame = rh.readVector2();
          break;
        case AnimationData.CHANNEL_TYPE.Uv3:
          frame = rh.readVector2();
          break;
        case AnimationData.CHANNEL_TYPE.Uv4:
          frame = rh.readVector2();
          break;
        case AnimationData.CHANNEL_TYPE.TexAnim:
          frame = rh.readFloat();
          break;
        default:
          throw 'Unexpected ZMO channel type ' + data.channels[j].type + ' in ' + path;
        }

        data.channels[j].frames.push(frame);
      }
    }

    var fileVersion = 1;

    // Look for extended ZMO data
    rh.seek(-4);
    var extTag = rh.readStrLen(4);
    if (extTag === 'EZMO') {
      fileVersion = 2;
    } else if (extTag === '3ZMO') {
      fileVersion = 3;
    }

    if (fileVersion > 1) {
      // Seek to the beginning of the extended data
      rh.seek(-8);
      var extDataStart = rh.readUint32();
      rh.seek(extDataStart);

      if (fileVersion >= 2) {
        var eventFrameCount = rh.readUint16();
        if (eventFrameCount !== data.frameCount) {
          console.warn('Encountered extended ZMO with an inconsistent frame count.');
        }

        for (var i = 0; i < eventFrameCount; ++i) {
          data.eventFrames[i] = rh.readInt16();
        }
      }

      if (fileVersion >= 3) {
        data.interpInterval = rh.readInt32();
      }
    }

    callback(data);
  });
};

module.exports = AnimationData;
