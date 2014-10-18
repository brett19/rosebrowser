var OrthoSprite = function (material, offset) {

  THREE.Object3D.call( this );

  this.type = 'OrthoSprite';

  this.offset = ( offset !== undefined ) ? offset : new THREE.Vector2(0, 0);

  if (material === undefined) material = new THREE.SpriteMaterial();
  this.renderSprite = new THREE.Sprite( material );

};

OrthoSprite.prototype = Object.create( THREE.Object3D.prototype );

OrthoSprite.prototype.clone = function ( object ) {

  if ( object === undefined ) {
    object = new OrthoSprite( this.renderSprite.material, this.offset );
  }

  THREE.Object3D.prototype.clone.call( this, object );

  return object;

};

module.exports = OrthoSprite;
