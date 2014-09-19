'use strict';

// Set some default values
THREE.XHRLoader.prototype.crossOrigin = 'anonymous';
THREE.ImageUtils.crossOrigin = 'anonymous';


// Set up the renderer
var renderer = null;
renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);
renderer.setClearColor( 0x888888, 1 );


// Create a global scene to work with
var scene = new THREE.Scene();


// Set up some basic initial lighting
var directionalLight = new THREE.DirectionalLight( 0xffffff, 1.1 );
directionalLight.position.set( 100, 100, 100 );
scene.add( directionalLight );

var hemiLight = new THREE.HemisphereLight( 0xffffff, 0xffffff, 0.3 );
hemiLight.color.setHSL( 0.6, 1, 0.75 );
hemiLight.groundColor.setHSL( 0.1, 0.8, 0.7 );
hemiLight.position.z = 500;
scene.add( hemiLight );


// Set a global camera to work with
var camera = new THREE.PerspectiveCamera(45, window.innerWidth/window.innerHeight, 0.1, 1000);
camera.up.copy(new THREE.Vector3(0, 0, 1));
camera.position.copy(new THREE.Vector3(-15, 15, 15));
camera.lookAt(new THREE.Vector3(0, 0, 0));

camera.position.add(new THREE.Vector3(5200, 5200, 0));

// Auto resize canvas
window.addEventListener('resize', onWindowResize, false);

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize( window.innerWidth, window.innerHeight );
}

// Default material for testing with
var defaultMat = new THREE.MeshPhongMaterial({ambient: 0x030303, color: 0xdddddd, specular: 0x009900, shininess: 30, shading: THREE.FlatShading});


// Create a debug GUI manager.
var debugGui = new dat.GUI();


var activeGameState = null;

// FPS / MS indicator
var stats = new Stats();
stats.setMode(1); // 0: FPS, 1: MS
stats.domElement.style.position = 'absolute';
stats.domElement.style.left = '0px';
stats.domElement.style.top = '0px';
document.body.appendChild( stats.domElement );

var clock = new THREE.Clock();
var renderFrame = function () {
  requestAnimationFrame(renderFrame, renderer.domElement);
  stats.begin();

  var delta = clock.getDelta();
  THREE.AnimationHandler.update( delta );

  if (activeGameState) {
    activeGameState.update(delta);
  }

  renderer.render(scene, camera);
  stats.end();
};
renderFrame();

var launchStateName = clientParams.length > 0 ? clientParams[0] : 'test';
console.log('Launching game with state `' + launchStateName + '`');

var launchGameState = null;
if (launchStateName === 'test') {
  launchGameState = gsTest;
} else if (launchStateName === 'nettest') {
  launchGameState = gsNetTest;
} else if (launchStateName === 'login') {
  launchGameState = gsLogin;
} else if (launchStateName === 'gametest') {
  launchGameState = gsGameTest;
} else {
  console.log('Invalid launch state specified.');
}

if (clientParams.indexOf('lmonly') !== -1) {
  config.lmonly = true;
}


if (launchGameState) {
  // Needed for game states that alter UI.
  $(function() {
    launchGameState.prepare(function() {
      launchGameState.enter();
      activeGameState = launchGameState;
    });
  });
}

GDM.register('list_zone', DataTable, '3DDATA/STB/LIST_ZONE.STB');

GDM.register('npc_chars', CharacterList, '3DDATA/NPC/LIST_NPC.CHR');
GDM.register('npc_models', ModelListManager, '3DDATA/NPC/PART_NPC.ZSC');

GDM.register('male_skel', Skeleton, '3DDATA/AVATAR/MALE.ZMD');
GDM.register('female_skel', Skeleton, '3DDATA/AVATAR/FEMALE.ZMD');

GDM.register('itm_mface', ModelListManager, '3DDATA/AVATAR/LIST_MFACE.ZSC');
GDM.register('itm_mhair', ModelListManager, '3DDATA/AVATAR/LIST_MHAIR.ZSC');
GDM.register('itm_mcap', ModelListManager, '3DDATA/AVATAR/LIST_MCAP.ZSC');
GDM.register('itm_mbody', ModelListManager, '3DDATA/AVATAR/LIST_MBODY.ZSC');
GDM.register('itm_marms', ModelListManager, '3DDATA/AVATAR/LIST_MARMS.ZSC');
GDM.register('itm_mfoot', ModelListManager, '3DDATA/AVATAR/LIST_MFOOT.ZSC');

GDM.register('itm_fface', ModelListManager, '3DDATA/AVATAR/LIST_WFACE.ZSC');
GDM.register('itm_fhair', ModelListManager, '3DDATA/AVATAR/LIST_WHAIR.ZSC');
GDM.register('itm_fcap', ModelListManager, '3DDATA/AVATAR/LIST_WCAP.ZSC');
GDM.register('itm_fbody', ModelListManager, '3DDATA/AVATAR/LIST_WBODY.ZSC');
GDM.register('itm_farms', ModelListManager, '3DDATA/AVATAR/LIST_WARMS.ZSC');
GDM.register('itm_ffoot', ModelListManager, '3DDATA/AVATAR/LIST_WFOOT.ZSC');

if (config.isEvoData) {
  GDM.register('itm_mfaceitem', ModelListManager, '3DDATA/AVATAR/LIST_MFACEITEM.ZSC');
  GDM.register('itm_ffaceitem', ModelListManager, '3DDATA/AVATAR/LIST_WFACEITEM.ZSC');
} else {
  GDM.register('itm_mfaceitem', ModelListManager, '3DDATA/AVATAR/LIST_FACEITEM.ZSC');
  GDM.register('itm_ffaceitem', ModelListManager, '3DDATA/AVATAR/LIST_FACEITEM.ZSC');
}

GDM.register('itm_back', ModelListManager, '3DDATA/AVATAR/LIST_BACK.ZSC');
GDM.register('itm_weapon', ModelListManager, '3DDATA/WEAPON/LIST_WEAPON.ZSC');
GDM.register('itm_subwpn', ModelListManager, '3DDATA/WEAPON/LIST_SUBWPN.ZSC');
