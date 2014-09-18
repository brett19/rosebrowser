'use strict';

function ModelListManager(data) {
  this.data = data;
  this.meshes = {};
  this.materials = {};
}

/**
 * This is a helper to allow a ModelListManager to be used by the DataManager.
 * @param path
 * @param callback
 */
ModelListManager.load = function(path, callback) {
  ModelList.load(path, function(data) {
    callback(new ModelListManager(data));
  });
};

ModelListManager.prototype._createMesh = function(meshIdx, callback) {
  var existingMesh = this.meshes[meshIdx];
  if (existingMesh) {
    if (existingMesh.mesh) {
      callback(existingMesh.mesh);
    } else {
      existingMesh.waiters.push(callback);
    }
    return;
  }

  var newMesh = {
    mesh: null,
    waiters: [callback]
  };
  this.meshes[meshIdx] = newMesh;

  var meshPath = this.data.meshes[meshIdx];
  Mesh.load(meshPath, function (geometry) {
    newMesh.mesh = geometry;
    for (var i = 0; i < newMesh.waiters.length; ++i) {
      newMesh.waiters[i](geometry);
    }
    newMesh.waiters = [];
  });
};

ModelListManager.prototype._createMaterial = function(materialIdx) {
  var foundMaterial = this.materials[materialIdx];
  if (foundMaterial) {
    return foundMaterial;
  }

  var zscMat = this.data.materials[materialIdx];

  var texture = RoseTextureManager.load(zscMat.texturePath);

  var newMaterial = new THREE.MeshLambertMaterial({color: 0xffffff, map: texture});
  newMaterial.skinning = zscMat.forSkinning;
  if (zscMat.twoSided) {
    newMaterial.side = THREE.DoubleSide;
  }
  if (zscMat.alphaEnabled) {
    newMaterial.transparent = true;
  }

  // TODO: temporary hack!
  if (!zscMat.forSkinning) {
    if (zscMat.alphaTestEnabled) {
      newMaterial.alphaTest = zscMat.alphaRef / 255;
    } else {
      newMaterial.alphaTest = 0;
    }
  }
  newMaterial.opacity = zscMat.alpha;
  newMaterial.depthTest = zscMat.depthTestEnabled;
  newMaterial.depthWrite = zscMat.depthWriteEnabled;

  this.materials[materialIdx] = newMaterial;
  return newMaterial;
};

ModelListManager.prototype.createForStatic = function(modelIdx, callback) {
  var model = this.data.models[modelIdx];

  var modelObj = new THREE.Object3D();
  modelObj.visible = false;

  var partMeshs = [];
  var waitAll = new MultiWait();

  var self = this;
  for (var i = 0; i < model.parts.length; ++i) {
    (function(partIdx, part, partCallback) {
      var material = self._createMaterial(part.materialIdx);
      self._createMesh(part.meshIdx, function(geometry) {
        var partMesh = new THREE.Mesh(geometry, material);
        partMesh.position.copy(part.position);
        partMesh.quaternion.copy(part.rotation);
        partMesh.scale.copy(part.scale);
        partMeshs[partIdx] = partMesh;

        if (part.animPath) {
          Animation.load(part.animPath, function(zmoData) {
            var anim = zmoData.createForStatic(part.animPath, partMeshs[partIdx]);
            anim.play();
          });
        }

        partCallback();
      });
    })(i, model.parts[i], waitAll.one());
  }

  waitAll.wait(function() {
    for (var i = 0; i < partMeshs.length; ++i) {
      var part = model.parts[i];

      if (i === 0) {
        modelObj.add(partMeshs[i]);
      } else {
        partMeshs[part.parent-1].add(partMeshs[i]);
      }

    }
    modelObj.visible = true;
    if (callback) {
      callback();
    }
  });

  return modelObj;
};
