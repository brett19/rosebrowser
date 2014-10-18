var ROSELoader = require('./rose');

// TODO: More efficient uncompressed loading
// TODO: Test RGB, RBA, Alpha, Luminance, LuminanceAlpha
// TODO: Test Cubemap

/**
 * @constructor
 * @property {DDS.Header} header
 */
var DDS = function() {
};


/**
 * @constructor
 * @property {Number} magic
 * @property {Number} size
 * @property {Number} flags
 * @property {Number} height
 * @property {Number} width
 * @property {Number} pitch
 * @property {Number} depth
 * @property {Number} mipmaps
 * @property {DDS.Header.PixelFormat} pixelFormat
 * @property {Number} caps1
 * @property {Number} caps2
 * @property {Number} caps3
 * @property {Number} caps4
 */
DDS.Header = function() {
  this.pixelFormat = new DDS.Header.PixelFormat();
};


/**
 * @constructor
 * @property {Number} size
 * @property {Number} flags
 * @property {Number} fourCC
 * @property {Number} bitCount
 * @property {Number} maskR
 * @property {Number} maskG
 * @property {Number} maskB
 * @property {Number} maskA
 */
DDS.Header.PixelFormat = function() {
};


/**
 * @constructor
 * @param {Number} width
 * @param {Number} height
 * @property {Uint8Array} data
 * @property {Number} width
 * @property {Number} height
 */
DDS.Mipmap = function(width, height) {
  this.width  = width;
  this.height = height;
  this.data   = null;
};


/**
 * Make a Uint32 FOURCC from a String
 * @param   {String} string
 * @returns {Number} fourcc
 */
DDS.makeFourCC = function(string) {
  return string.charCodeAt(0) +
  (string.charCodeAt(1) << 8) +
  (string.charCodeAt(2) << 16) +
  (string.charCodeAt(3) << 24);
};


/**
 * @type {number}
 * @readonly
 */
DDS.MAGIC = 0x20534444;


/**
 * @enum {Number}
 * @readonly
 */
DDS.FLAGS = {
  CAPS:         0x1,
  HEIGHT:       0x2,
  WIDTH:        0x4,
  PITCH:        0x8,
  PIXEL_FORMAT: 0x1000,
  MIPMAP_COUNT: 0x20000,
  LINEAR_SIZE:  0x80000,
  DEPTH:        0x800000
};


/**
 * @enum {Number}
 * @readonly
 */
DDS.CAPS = {
  COMPLEX: 0x8,
  MIPMAP:  0x400000,
  TEXTURE: 0x1000
};


/**
 * @enum {Number}
 * @readonly
 */
DDS.CAPS2 = {
  CUBEMAP:            0x200,
  CUBEMAP_POSITIVEX:  0x400,
  CUBEMAP_NEGATIVEX:  0x800,
  CUBEMAP_POSITIVEY:  0x1000,
  CUBEMAP_NEGATIVEY:  0x2000,
  CUBEMAP_POSITIVEZ:  0x4000,
  CUBEMAP_NEGATIVEZ:  0x8000,
  VOLUME:             0x200000
};


/**
 * @enum {Number}
 * @readonly
 */
DDS.PIXEL_FORMAT_FOURCC = {
  DXT1: DDS.makeFourCC('DXT1'),
  DXT3: DDS.makeFourCC('DXT3'),
  DXT5: DDS.makeFourCC('DXT5')
};


/**
 * @enum {Number}
 * @readonly
 */
DDS.PIXEL_FORMAT_FLAGS = {
  ALPHA_PIXELS: 0x1,
  ALPHA:        0x2,
  FOURCC:       0x4,
  RGB:          0x40,
  YUV:          0x200,
  LUMINANCE:    0x20000
};

/**
 * @param {BinaryReader} rh
 * @returns {DDS.Header} header
 */
DDS.loadHeader = function(rh) {
  var header = new DDS.Header();
  header.magic  = rh.readUint32();
  header.size   = rh.readUint32();
  header.flags  = rh.readUint32();
  header.height = rh.readUint32();
  header.width  = rh.readUint32();
  header.pitch  = rh.readUint32();
  header.depth  = rh.readUint32();
  header.mipmaps = Math.max(1, rh.readUint32());

  rh.skip(4 * 11); // DWORD dwReserved1[11]

  header.pixelFormat.size     = rh.readUint32();
  header.pixelFormat.flags    = rh.readUint32();
  header.pixelFormat.fourCC   = rh.readUint32();
  header.pixelFormat.bitCount = rh.readUint32();
  header.pixelFormat.maskR    = rh.readUint32();
  header.pixelFormat.maskG    = rh.readUint32();
  header.pixelFormat.maskB    = rh.readUint32();
  header.pixelFormat.maskA    = rh.readUint32();

  header.caps1 = rh.readUint32();
  header.caps2 = rh.readUint32();
  header.caps3 = rh.readUint32();
  header.caps4 = rh.readUint32();

  rh.skip(4); // DWORD dwReserved2
  return header;
};


/**
 * @param {Number} mask
 * @returns {Number} shift
 */
DDS.getMaskShift = function(mask) {
  var str = mask.toString(2);
  return str.length - (str.lastIndexOf('1') + 1);
};


/**
 * @param {Number} mask
 * @returns {Number} scale
 */
DDS.getMaskScale = function(mask) {
  var str = mask.toString(2);
  var pos = str.lastIndexOf('1');

  if (pos === 0) {
    return 256.0;
  } else {
    return 256.0 / (1 << (pos + 1));
  }
};

/**
 * @callback DDS~onLoad
 * @param {THREE.CompressedTexture} dds
 */

/**
 * @param {String} path
 * @param {DDS~onLoad} callback
 * @return {THREE.CompressedTexture} dds
 */
DDS.load = function(path, callback) {
  var texture = new THREE.CompressedTexture();
  texture.image = [];
  texture.flipY = false;
  texture.generateMipmaps = false;
  texture.unpackAlignment = 1;
  texture.path = path;

  ROSELoader.load(path, function(/** BinaryReader */rh) {
    var maskR, maskG, maskB, maskA;
    var shiftR, shiftG, shiftB, shiftA;
    var scaleR, scaleG, scaleB, scaleA;
    var header, format, dxtBlockSize;
    var faces, cubemap, readPixelFn;
    var mipmaps = [];

    header = DDS.loadHeader(rh);

    if (header.magic !== DDS.MAGIC) {
      console.error('DDS.Loader.load: Invalid magic number in DDS header.');
      return null;
    }

    cubemap = !!(header.caps1 & DDS.CAPS2.CUBEMAP);
    faces   = cubemap ? 6 : 1;

    if (header.pixelFormat.flags & DDS.PIXEL_FORMAT_FLAGS.FOURCC) {
      switch (header.pixelFormat.fourCC) {
      case DDS.PIXEL_FORMAT_FOURCC.DXT1:
        dxtBlockSize = 8;
        format = THREE.RGB_S3TC_DXT1_Format;
        break;
      case DDS.PIXEL_FORMAT_FOURCC.DXT3:
        dxtBlockSize = 16;
        format = THREE.RGBA_S3TC_DXT3_Format;
        break;
      case DDS.PIXEL_FORMAT_FOURCC.DXT5:
        dxtBlockSize = 16;
        format = THREE.RGBA_S3TC_DXT5_Format;
        break;
      }
    } else if (header.pixelFormat.flags & DDS.PIXEL_FORMAT_FLAGS.RGB) {
      if (header.pixelFormat.flags & DDS.PIXEL_FORMAT_FLAGS.ALPHA_PIXELS) {
        format = THREE.RGBAFormat;
      } else {
        format = THREE.RGBFormat;
      }
    } else if (header.pixelFormat.flags & DDS.PIXEL_FORMAT_FLAGS.LUMINANCE) {
      if (header.pixelFormat.flags & DDS.PIXEL_FORMAT_FLAGS.ALPHA_PIXELS) {
        format = THREE.LuminanceAlphaFormat;
      } else {
        format = THREE.LuminanceFormat;
      }
    } else if (header.pixelFormat.flags & DDS.PIXEL_FORMAT_FLAGS.ALPHA) {
      format = THREE.AlphaFormat;
    }

    if (format === undefined) {
      console.warn('Unable to load DDS, unsupported pixel format.');
      console.log(path);
      callback(null);
      return;
    }

    if (!(header.flags & DDS.FLAGS.MIPMAP_COUNT)) {
      header.mipmaps = 1;
    }

    rh.seek(header.size + 4);

    // If we are not a compressed texture, we need to calculate our mask & shift
    if (!(header.pixelFormat.flags & DDS.PIXEL_FORMAT_FLAGS.FOURCC)) {
      if (header.pixelFormat.flags & DDS.PIXEL_FORMAT_FLAGS.RGB) {
        maskR = header.pixelFormat.maskR;
        maskG = header.pixelFormat.maskG;
        maskB = header.pixelFormat.maskB;
        shiftR = DDS.getMaskShift(maskR);
        shiftG = DDS.getMaskShift(maskG);
        shiftB = DDS.getMaskShift(maskB);
        scaleR = DDS.getMaskScale(maskR);
        scaleG = DDS.getMaskScale(maskG);
        scaleB = DDS.getMaskScale(maskB);
      }

      if (header.pixelFormat.flags & DDS.PIXEL_FORMAT_FLAGS.ALPHA_PIXELS) {
        maskA = header.pixelFormat.maskA;
        shiftA = DDS.getMaskShift(maskA);
        scaleA = DDS.getMaskScale(maskA);
      }

      switch (header.pixelFormat.bitCount) {
        case 8:
          readPixelFn = rh.readUint8;
          break;
        case 16:
          readPixelFn = rh.readUint16;
          break;
        case 24:
          readPixelFn = rh.readUint24;
          break;
        case 32:
          readPixelFn = rh.readUint32;
          break;
        default:
          throw 'Invalid format, header.pixelFormat.bitCount must be a multiple of 8';
      }
    }

    for (var i = 0; i < faces; ++i) {
      var width  = header.width;
      var height = header.height;

      for (var j = 0; j < header.mipmaps; ++j) {
        var mipmap = new DDS.Mipmap(width, height);
        var pixelCount = width * height;
        var byteCount = pixelCount * (header.pixelFormat.bitCount / 8);

        switch (format) {
        case THREE.RGB_S3TC_DXT1_Format:
        case THREE.RGBA_S3TC_DXT3_Format:
        case THREE.RGBA_S3TC_DXT5_Format:
          byteCount = dxtBlockSize * Math.ceil(width / 4) * Math.ceil(height / 4);
          mipmap.data   = rh.readUint8Array(byteCount);
          mipmap.width  = Math.max(4, width);
          mipmap.height = Math.max(4, height);
          break;
        case THREE.RGBAFormat:
          if (maskR === 0xff && maskG === 0xff00 && maskB === 0xff0000 && maskA === 0xff000000) {
            mipmap.data = rh.readUint8Array(byteCount);
          } else if (maskR === 0xff000000 && maskG === 0xff0000 && maskB === 0xff00 && maskA === 0xff) {
            mipmap.data = rh.readUint8Array(byteCount);

            for (var k = 0; k < byteCount; k += 4) {
              var r = mipmap.data[k];
              mipmap.data[k] = mipmap.data[k + 2];
              mipmap.data[k + 2] = r;
            }
          } else {
            mipmap.data = new Uint8Array(pixelCount * 4);

            for (var k = 0, idx = 0; k < pixelCount; ++k) {
              var pixel = readPixelFn.apply(rh);
              var r = (pixel & maskR) >> shiftR;
              var g = (pixel & maskG) >> shiftG;
              var b = (pixel & maskB) >> shiftB;
              var a = (pixel & maskA) >> shiftA;
              mipmap.data[idx++] = r * scaleR;
              mipmap.data[idx++] = g * scaleG;
              mipmap.data[idx++] = b * scaleB;
              mipmap.data[idx++] = a * scaleA;
            }
          }
          break;
        case THREE.RGBFormat:
          if (maskR === 0xff && maskG === 0xff00 && maskB === 0xff0000) {
            mipmap.data = rh.readUint8Array(byteCount);
          } else if (maskR === 0xff0000 && maskG === 0xff00 && maskB === 0xff) {
            mipmap.data = rh.readUint8Array(byteCount);

            for (var k = 0; k < byteCount; k += 3) {
              var r = mipmap.data[k];
              mipmap.data[k] = mipmap.data[k + 2];
              mipmap.data[k + 2] = r;
            }
          } else {
            mipmap.data = new Uint8Array(pixelCount * 3);

            for (var k = 0, idx = 0; k < pixelCount; k++) {
              var pixel = readPixelFn.apply(rh);
              var r = (pixel & maskR) >> shiftR;
              var g = (pixel & maskG) >> shiftG;
              var b = (pixel & maskB) >> shiftB;
              mipmap.data[idx++] = r * scaleR;
              mipmap.data[idx++] = g * scaleG;
              mipmap.data[idx++] = b * scaleB;
            }
          }

          break;
        case THREE.LuminanceAlphaFormat:
          if (maskR === 0xff && maskA === 0xff00) {
            mipmap.data = rh.readUint8Array(byteCount);
          } else if (maskR === 0xff00 && maskA === 0xff) {
            mipmap.data = rh.readUint8Array(byteCount);

            for (var k = 0; k < byteCount; k += 2) {
              var r = mipmap.data[k];
              mipmap.data[k] = mipmap.data[k + 1];
              mipmap.data[k + 1] = r;
            }
          } else {
            mipmap.data = new Uint8Array(pixelCount * 2);

            for (var k = 0, idx = 0; k < pixelCount; ++k) {
              var pixel = readPixelFn.apply(rh);
              var r = (pixel & maskR) >> shiftR;
              var a = (pixel & maskA) >> shiftA;
              mipmap.data[idx++] = r * scaleR;
              mipmap.data[idx++] = a * scaleA;
            }
          }
          break;
        case THREE.LuminanceFormat:
          if (maskR === 0xff) {
            mipmap.data = rh.readUint8Array(byteCount);
          } else {
            mipmap.data = rh.readUint8Array(pixelCount);

            for (var k = 0; k < pixelCount; ++k) {
              var pixel = readPixelFn.apply(rh);
              var r = (pixel & maskR) >> shiftR;
              mipmap.data[k] = r * scaleR;
            }
          }
          break;
        case THREE.AlphaFormat:
          if (maskA === 0xff) {
            mipmap.data = rh.readUint8Array(byteCount);
          } else {
            mipmap.data = rh.readUint8Array(pixelCount);

            for (var k = 0; k < pixelCount; ++k) {
              var pixel = readPixelFn.apply(rh);
              var a = (pixel & maskA) >> shiftA;
              mipmap.data[k] = a * scaleA;
            }
          }
          break;
        }

        mipmaps.push(mipmap);
        width  = Math.max(1, Math.floor(width / 2));
        height = Math.max(1, Math.floor(height / 2));
      }
    }

    if (cubemap) {
      var idx = 0;

      for (var i = 0; i < faces; ++i) {
        var image = { mipmaps: [] };

        for (var j = 0; j < header.mipmaps; ++j) {
          image.mipmaps.push(mipmaps[idx++]);
          image.format = texture.format;
          image.width  = texture.width;
          image.height = texture.height;
        }

        texture.images[i] = face;
      }
    } else {
      texture.image.width = header.width;
      texture.image.height = header.height;
      texture.mipmaps = mipmaps;
    }

    var isDxt = texture.format == THREE.RGB_S3TC_DXT1_Format ||
            texture.format == THREE.RGBA_S3TC_DXT3_Format ||
            texture.format == THREE.RGBA_S3TC_DXT5_Format;
    var widthIsPow2 = (header.width & (header.width - 1)) == 0;
    var heightIsPow2 = (header.height & (header.height - 1)) == 0;
    if (isDxt && widthIsPow2 && heightIsPow2) {
      texture.minFilter = THREE.LinearMipMapLinearFilter;
    }

    texture.format = format;
    texture.needsUpdate = true;

    if (callback) {
      callback(texture);
    }
  });

  return texture;
};

module.exports = DDS;
