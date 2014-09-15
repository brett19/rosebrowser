'use strict';

function makeZscMaterial(zscMat) {
  var texture = ROSETexLoader.load(zscMat.texturePath);
  //texture.anisotropy = 4;
  var material = new THREE.MeshLambertMaterial({color: 0xffffff, map: texture});
  material.skinning = zscMat.forSkinning;
  if (zscMat.twoSided) {
    material.side = THREE.DoubleSide;
  }
  if (zscMat.alphaEnabled) {
    material.transparent = true;
  }

  // TODO: temporary hack!
  if (!zscMat.forSkinning) {
    if (zscMat.alphaTestEnabled) {
      material.alphaTest = zscMat.alphaRef / 255;
    } else {
      material.alphaTest = 0;
    }
  }
  material.opacity = zscMat.alpha;
  material.depthTest = zscMat.depthTestEnabled;
  material.depthWrite = zscMat.depthWriteEnabled;
  return material;
}

function createZscObject(zscData, modelIdx) {
  var model = zscData.models[modelIdx];

  var modelObj = new THREE.Object3D();
  modelObj.visible = false;

  var loadWarn = setTimeout(function() {
    console.log('Model took a long time to load...');
  }, 5000);

  var partMeshs = [];
  function completeLoad() {
    clearTimeout(loadWarn);
    for (var i = 0; i < partMeshs.length; ++i) {
      var part = model.parts[i];

      if (i === 0) {
        modelObj.add(partMeshs[i]);
      } else {
        partMeshs[part.parent-1].add(partMeshs[i]);
      }

    }
    modelObj.visible = true;
  }
  var loadedCount = 0;

  for (var i = 0; i < model.parts.length; ++i) {
    (function(partIdx, part) {
      var meshPath = zscData.meshes[part.meshIdx];

      var material = makeZscMaterial(zscData.materials[part.materialIdx]);

      Mesh.load(meshPath, function (geometry) {
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

        loadedCount++;
        if (loadedCount === model.parts.length) {
          completeLoad();
        }
      });
    })(i, model.parts[i]);
  }

  return modelObj;
}
