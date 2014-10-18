function _DamageRender() {
  this.sprites = [];
  this.isPlaying = false;
}

_DamageRender.prototype.add = function(amount, pos) {
  var texture = Font.createTEXTure(Font.FONT.OUTLINE_BOLD_24, amount.toString());

  // Recreate the sprite with new texture
  var material = new THREE.SpriteMaterial({ map: texture, color: 0xffffff });
  material.depthWrite = false;
  var sprite = new OrthoSprite(material);
  sprite.position.copy(pos);
  sprite.scale.set(texture.image.width, texture.image.height, 1);
  sprite.offset.set(0, 0, 0);

  sprite.baseWidth = texture.image.width;
  sprite.baseHeight = texture.image.height;
  sprite.currentTime = 0.0;

  this.sprites.push(sprite);
  scene.add(sprite);

  if (!this.isPlaying) {
    THREE.AnimationHandler.play(this);
    this.isPlaying = true;
  }
};

_DamageRender.prototype.resetBlendWeights = function() {
};

_DamageRender.prototype.update = function(delta) {
  for (var i = 0; i < this.sprites.length; ++i) {
    var sprite = this.sprites[i];
    sprite.currentTime += delta;

    sprite.renderSprite.material.opacity = Math.min(1, 1 - (sprite.currentTime - 0.5));
    sprite.position.z += delta * 0.35;

    var scaleVal = Math.min(1, 1 - (sprite.currentTime - 0.5) * 0.7);
    sprite.scale.set(sprite.baseWidth * scaleVal, sprite.baseHeight * scaleVal, 1);

    if (sprite.currentTime > 1.5) {
      scene.remove(sprite);
      this.sprites.splice(i, 1);
      --i;
    }
  }

  if (this.sprites.length === 0) {
    THREE.AnimationHandler.stop(this);
    this.isPlaying = false;
  }
};

var DamageRender = new _DamageRender();
module.exports = DamageRender;
