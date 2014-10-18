var ROSELoader = require('./rose');

function CameraSpecs() {
}

CameraSpecs.prototype.applyToCamera = function(camera) {
  console.log(this);

  camera.up.copy(this.up);
  camera.position.copy(this.eye);
  camera.lookAt(this.center);
};

CameraSpecs.load = function(path, callback) {
  ROSELoader.load(path, function(/** BinaryReader */rh) {
    var data = new CameraSpecs();

    /*Magic*/ rh.readStrLen(7);

    data.projectionType = rh.readInt32();

    /*ModelView*/ rh.readMatrix4();
    /*Projection*/ rh.readMatrix4();

    data.fieldOfView = rh.readFloat();
    data.aspectRatio = rh.readFloat();
    data.nearPlane = rh.readFloat();
    data.farPlane = rh.readFloat();

    data.eye = rh.readVector3().multiplyScalar(ZZ_SCALE_IN);
    data.center = rh.readVector3().multiplyScalar(ZZ_SCALE_IN);
    data.up = rh.readVector3();

    callback(data);
  });
};

module.exports = CameraSpecs;
