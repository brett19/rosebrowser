/**
 * @author James Baicoianu / http://www.baicoianu.com/
 */

THREE.FreeFlyControls = function ( object, inputMgr ) {

  this.object = object;

  this.inputMgr = ( inputMgr !== undefined ) ? inputMgr : InputManager;

  // API

  this.movementSpeed = 1.0;

  // internals

  this.mouseStatus = 0;
  this.mousePos = new THREE.Vector2( 0, 0 );

  this.moveState = { up: 0, down: 0, left: 0, right: 0, forward: 0, back: 0 };
  this.moveVector = new THREE.Vector3( 0, 0, 0 );
  this.rotationEuler = new THREE.Euler( );
  this.movementSpeedMultiplier = 1;

  this.setRotationFromQuaternion = function(quat) {

    this.rotationEuler = new THREE.Euler();
    this.rotationEuler.setFromQuaternion(quat, 'ZYX');

  };
  this.setRotationFromQuaternion(this.object.quaternion);

  this.keydown = function( event ) {

    if ( event.altKey ) {

      return;

    }

    //event.preventDefault();

    switch ( event.keyCode ) {

      case 16: /* shift */ this.movementSpeedMultiplier = 5; break;
      case 81: /* Q */ this.movementSpeedMultiplier = 1/4; break;
      case 69: /* E */ this.movementSpeedMultiplier = 4; break;

      case 87: /*W*/ this.moveState.forward = 1; break;
      case 83: /*S*/ this.moveState.back = 1; break;

      case 65: /*A*/ this.moveState.left = 1; break;
      case 68: /*D*/ this.moveState.right = 1; break;

      case 82: /*R*/ this.moveState.up = 1; break;
      case 70: /*F*/ this.moveState.down = 1; break;

    }

    if (event.keyCode === 82) {
      this.setRotationFromQuaternion(this.object.quaternion);
      this.updateRotation();
    }

    this.updateMovementVector();

  };

  this.keyup = function( event ) {

    switch( event.keyCode ) {

      case 16: /* shift */ this.movementSpeedMultiplier = 1; break;
      case 81: /* Q */ this.movementSpeedMultiplier = 1; break;
      case 69: /* E */ this.movementSpeedMultiplier = 1; break;

      case 87: /*W*/ this.moveState.forward = 0; break;
      case 83: /*S*/ this.moveState.back = 0; break;

      case 65: /*A*/ this.moveState.left = 0; break;
      case 68: /*D*/ this.moveState.right = 0; break;

      case 82: /*R*/ this.moveState.up = 0; break;
      case 70: /*F*/ this.moveState.down = 0; break;

    }

    this.updateMovementVector();

  };

  this.mousedown = function( event ) {

    event.preventDefault();
    event.stopPropagation();

    this.mouseStatus ++;

    this.mousePos.x = event.pageX;
    this.mousePos.y = event.pageY;

  };

  this.mousemove = function( event ) {

    if ( this.mouseStatus > 0 ) {

      var mousePos = new THREE.Vector2(event.pageX, event.pageY);
      var mouseDelta = this.mousePos.clone().sub(mousePos);
      this.mousePos = mousePos;

      this.rotationEuler.z += mouseDelta.x / 180 * Math.PI * 0.3;
      this.rotationEuler.x += mouseDelta.y / 180 * Math.PI * 0.3;

      this.updateRotation();

    }

  };

  this.mouseup = function( event ) {

    event.preventDefault();
    event.stopPropagation();

    this.mouseStatus --;

  };

  this.update = function( delta ) {

    var moveMult = delta * this.movementSpeed * this.movementSpeedMultiplier;

    var moveVec = this.moveVector.clone();
    moveVec.y = 0;
    moveVec.applyQuaternion(this.object.quaternion);

    this.object.position.x += moveVec.x * moveMult;
    this.object.position.y += moveVec.y * moveMult;
    this.object.position.z += moveVec.z * moveMult;

    this.object.position.z += this.moveVector.y * moveMult;

  };

  this.updateRotation = function() {

    this.object.quaternion.setFromEuler(this.rotationEuler);

  };

  this.updateMovementVector = function() {

    this.moveVector.x = ( -this.moveState.left     + this.moveState.right );
    this.moveVector.y = ( -this.moveState.down    + this.moveState.up );
    this.moveVector.z = ( -this.moveState.forward + this.moveState.back );

  };

  this.getContainerDimensions = function() {

    if ( this.domElement != document ) {

      return {
        size	: [ this.domElement.offsetWidth, this.domElement.offsetHeight ],
        offset	: [ this.domElement.offsetLeft,  this.domElement.offsetTop ]
      };

    } else {

      return {
        size	: [ window.innerWidth, window.innerHeight ],
        offset	: [ 0, 0 ]
      };

    }

  };

  function bind( scope, fn ) {

    return function () {

      fn.apply( scope, arguments );

    };

  };


  this.inputMgr.addEventListener( 'mousemove', bind( this, this.mousemove ) );
  this.inputMgr.addEventListener( 'mousedown', bind( this, this.mousedown ) );
  this.inputMgr.addEventListener( 'mouseup',   bind( this, this.mouseup ) );

  this.inputMgr.addEventListener( 'keydown', bind( this, this.keydown ) );
  this.inputMgr.addEventListener( 'keyup',   bind( this, this.keyup ) );

  this.updateMovementVector();
  this.updateRotation();

};
