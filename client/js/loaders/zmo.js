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
  None: 1 << 0,
  Position: 1 << 1,
  Rotation: 1 << 2,
  Normal: 1 << 3,
  Alpha: 1 << 4,
  Uv1: 1 << 5,
  Uv2: 1 << 6,
  Uv3: 1 << 7,
  Uv4: 1 << 8,
  TexAnim: 1 << 9,
  Scale: 1 << 10
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

    for (i = 0; i < data.frameCount; ++i) {
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

    callback(data);
  });
};
