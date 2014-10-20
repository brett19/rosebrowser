function Pawn() {
  this.rootObj = new THREE.Object3D();
  this.rootObj.userData.owner = this;
  this.direction = 0;
  this.boundingBox = new THREE.Box3();
  this.boundingOffset = new THREE.Vector3();
  this.boundingBoxObj = new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1), new THREE.MeshBasicMaterial( { color: 0x00ff00, wireframe: true } ));
  this.boundingBoxObj.visible = debugBoundingBoxes;
  this.rootObj.add(this.boundingBoxObj);
}

Pawn.prototype._addBoundsGeometry = function(skinnedMesh) {
  var v1 = new THREE.Vector3();

  var geometry = skinnedMesh.geometry;
	var positions = geometry.attributes['position'].array;

	for (var i = 0, il = positions.length; i < il; i += 3) {
		v1.set(positions[i], positions[i + 1], positions[i + 2]);
		this.boundingBox.expandByPoint(v1);
	}

  this.boundingBoxObj.scale.copy(this.boundingBox.size());
  this.boundingOffset.copy(this.boundingBox.center());
};

Pawn.prototype.setPosition = function(pos) {
  this.rootObj.position.copy(pos);
};

Pawn.prototype.setDirection = function(radians) {
  this.direction = radians;
};

Pawn.prototype.update = function(delta) {
  var dirStep = (Math.PI * 3) * delta;
  var deltaDir = slerp1d(this.direction, this.rootObj.rotation.z);

  if (deltaDir > dirStep || deltaDir < -dirStep) {
    if (deltaDir < 0) {
      this.rootObj.rotation.z -= dirStep;
    } else {
      this.rootObj.rotation.z += dirStep;
    }
  } else {
    this.rootObj.rotation.z = this.direction;
  }

  if (this.skel && this.skel.bones.length > 0) {
    this.boundingBoxObj.position.set(this.skel.boneMatrices[12], this.skel.boneMatrices[13], this.skel.boneMatrices[14]);
    this.rootObj.worldToLocal(this.boundingBoxObj.position);
    this.boundingBoxObj.position.add(this.boundingOffset);
  }
};

module.exports = Pawn;
