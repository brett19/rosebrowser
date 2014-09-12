// TODO: More efficient uncompressed loading
// TODO: Test RGB, RBA, Alpha, Luminance, LuminanceAlpha
// TODO: Test Cubemap

var DDS = {};

DDS.Header = function() {
  this.pixelFormat = {};
};

DDS.makeFourCC = function(string) {
  return string.charCodeAt(0) +
        (string.charCodeAt(1) << 8) +
        (string.charCodeAt(2) << 16) +
        (string.charCodeAt(3) << 24);
};

DDS.MAGIC = 0x20534444;

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

DDS.CAPS = {
  COMPLEX: 0x8,
  MIPMAP:  0x400000,
  TEXTURE: 0x1000
};

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

DDS.PIXEL_FORMAT = {};

DDS.PIXEL_FORMAT.FOURCC = {
  DXT1: DDS.makeFourCC("DXT1"),
  DXT3: DDS.makeFourCC("DXT3"),
  DXT5: DDS.makeFourCC("DXT5")
};

DDS.PIXEL_FORMAT.FLAGS = {
  ALPHA_PIXELS: 0x1,
  ALPHA:        0x2,
  FOURCC:       0x4,
  RGB:          0x40,
  YUV:          0x200,
  LUMINANCE:    0x20000
};

DDS.Loader = {};
DDS.Loader.loadHeader = function(rh) {
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

// Patent pending method to calculate shift for colour mask
DDS.Loader.getMaskShift = function(mask) {
  if (mask & 0xff) {
    return 0;
  } else if (mask & 0xff00) {
    return 8;
  } else if (mask & 0xff0000) {
    return 16;
  } else if (mask & 0xff000000) {
    return 24;
  } else {
    console.error('DDS.Loader.getMaskShift: Invalid colour mask ' + mask);
    return 0;
  }
};

DDS.Loader.load = function(path, callback) {
  var texture = new THREE.CompressedTexture();
  texture.image = [];
  texture.flipY = false;
  texture.generateMipmaps = false;

  ROSELoader.load(path, function(rh) {
    var maskR, maskG, maskB, maskA;
    var shiftR, shiftG, shiftB, shiftA;
    var header, format, dxtBlockSize;
    var faces, cubemap;
    var mipmaps = [];

    header = DDS.Loader.loadHeader(rh);

    if (header.magic !== DDS.MAGIC) {
      console.error('DDS.Loader.load: Invalid magic number in DDS header.');
      return null;
    }

    cubemap = !!(header.caps1 & DDS.CAPS2.CUBEMAP);
    faces   = cubemap ? 6 : 1;

    if (header.pixelFormat.flags & DDS.PIXEL_FORMAT.FLAGS.FOURCC) {
      switch (header.pixelFormat.fourCC) {
      case DDS.PIXEL_FORMAT.FOURCC.DXT1:
        dxtBlockSize = 8;
        format = THREE.RGB_S3TC_DXT1_Format;
        break;
      case DDS.PIXEL_FORMAT.FOURCC.DXT3:
        dxtBlockSize = 16;
        format = THREE.RGBA_S3TC_DXT3_Format;
        break;
      case DDS.PIXEL_FORMAT.FOURCC.DXT5:
        dxtBlockSize = 16;
        format = THREE.RGBA_S3TC_DXT5_Format;
        break;
      }
    } else if (header.pixelFormat.flags & DDS.PIXEL_FORMAT.FLAGS.RGB) {
      if (header.pixelFormat.bitCount == 32) {
        if (header.pixelFormat.flags & DDS.PIXEL_FORMAT.FLAGS.ALPHA_PIXELS) {
          format = THREE.RGBAFormat;
        }
      } else if (header.pixelFormat.bitCount == 24) {
        if (!(header.pixelFormat.flags & DDS.PIXEL_FORMAT.FLAGS.ALPHA_PIXELS)) {
          format = THREE.RGBFormat;
        }
      }
    } else if (header.pixelFormat.flags & DDS.PIXEL_FORMAT.FLAGS.LUMINANCE) {
      if (header.pixelFormat.flags & DDS.PIXEL_FORMAT.FLAGS.ALPHA_PIXELS) {
        if (header.pixelFormat.bitCount == 16) {
          format = THREE.LuminanceAlphaFormat;
        }
      } else if (header.pixelFormat.bitCount == 8) {
        format = THREE.LuminanceFormat;
      }
    } else if (header.pixelFormat.flags & DDS.PIXEL_FORMAT.FLAGS.ALPHA) {
      if (header.pixelFormat.bitCount == 8) {
        format = THREE.AlphaFormat;
      }
    }

    if (format === undefined) {
      console.error('DDS.Loader.load: Unsupported pixel format');
      console.error(header);
      return null;
    }

    if (!(header.flags & DDS.FLAGS.MIPMAP_COUNT)) {
      header.mipmaps = 1;
    }

    rh.seek(header.size + 4);

    if (!(header.pixelFormat.flags & DDS.PIXEL_FORMAT.FLAGS.FOURCC)) {
      maskR = header.pixelFormat.maskR;
      maskG = header.pixelFormat.maskG;
      maskB = header.pixelFormat.maskB;
      maskA = header.pixelFormat.maskA;
      shiftR = DDS.Loader.getMaskShift(maskR);
      shiftG = DDS.Loader.getMaskShift(maskG);
      shiftB = DDS.Loader.getMaskShift(maskB);
      shiftA = DDS.Loader.getMaskShift(maskA);
    }

    for (var i = 0; i < faces; ++i) {
      var width  = header.width;
      var height = header.height;

      for (var j = 0; j < header.mipmaps; ++j) {
        var mipmap = {
          data: null,
          width: width,
          height: height
        };

        switch (format) {
        case THREE.RGB_S3TC_DXT1_Format:
        case THREE.RGBA_S3TC_DXT3_Format:
        case THREE.RGBA_S3TC_DXT5_Format:
          var length = dxtBlockSize * (Math.max(4, width) / 4) * (Math.max(4, height) / 4);
          mipmap.data   = rh.readBytes(length);
          mipmap.width  = Math.max(4, mipmap.width);
          mipmap.height = Math.max(4, mipmap.height);
          break;
        case THREE.RGBAFormat:
          var length = width * height * (header.pixelFormat.bitCount / 8);
          var idx = 0;

          mipmap.data = new Uint8Array(length);

          for (var y = 0; y < height; ++y) {
            for (var x = 0; x < width; ++x) {
              var colour = rh.readUint32();
              var r = (colour & maskR) >> shiftR;
              var g = (colour & maskG) >> shiftG;
              var b = (colour & maskB) >> shiftB;
              var a = (colour & maskA) >> shiftA;
              mipmap.data[idx++] = r;
              mipmap.data[idx++] = g;
              mipmap.data[idx++] = b;
              mipmap.data[idx++] = a;
            }
          }
          break;
        case THREE.RGBFormat:
          var length = width * height * (header.pixelFormat.bitCount / 8);
          var idx = 0;

          mipmap.data = new Uint8Array(length);

          for (var y = 0; y < height; ++y) {
            for (var x = 0; x < width; ++x) {
              var colour = rh.readUint24();
              var r = (colour & maskR) >> shiftR;
              var g = (colour & maskG) >> shiftG;
              var b = (colour & maskB) >> shiftB;
              mipmap.data[idx++] = r;
              mipmap.data[idx++] = g;
              mipmap.data[idx++] = b;
            }
          }
          break;
        case THREE.LuminanceAlphaFormat:
          var length = width * height * (header.pixelFormat.bitCount / 8);
          var idx = 0;

          mipmap.data = new Uint8Array(length);

          for (var y = 0; y < height; ++y) {
            for (var x = 0; x < width; ++x) {
              var colour = rh.readUint16();
              var r = (colour & maskR) >> shiftR;
              var a = (colour & maskA) >> shiftA;
              mipmap.data[idx++] = r;
              mipmap.data[idx++] = a;
            }
          }
          break;
        case THREE.AlphaFormat:
        case THREE.LuminanceFormat:
          var length = width * height * (header.pixelFormat.bitCount / 8);
          mipmap.data = rh.readBytes(length);
          break;
        }

        mipmaps.push(mipmap);
        width  = Math.max(width * 0.5, 1);
        height = Math.max(height * 0.5, 1);
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

    texture.format = format;
    texture.needsUpdate = true;
    callback(texture);
  });

  return texture;
};
