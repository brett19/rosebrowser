'use strict';

// Set some default values
THREE.XHRLoader.prototype.crossOrigin = 'anonymous';
THREE.ImageUtils.crossOrigin = 'anonymous';


// Set up the renderer
var renderer = null;
renderer = new THREE.WebGLRenderer({antialias: true});
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);
renderer.setClearColor( 0x888888, 1 );
renderer.autoClear = false;

// Load any needed extensions
var minMaxGlExt = renderer.getContext().getExtension('EXT_blend_minmax');
if (!minMaxGlExt) {
  console.warn('Could not load blend_minmax extension!');
}


// Create a global scene to work with
var scene = new THREE.Scene();
var skyScene = new THREE.Scene();
var skyObject = null;

// Set up some basic initial lighting
var diffuseLevel = new THREE.Color(1.0, 1.0, 1.0);
var ambientLevel = new THREE.Color(0.86, 0.83, 0.8);

diffuseLevel.multiplyScalar(0.6);
ambientLevel.multiplyScalar(0.6);

var directionalLight = new THREE.DirectionalLight(diffuseLevel.getHex(), 1.0);
directionalLight.position.set(.5,.5,.5);
scene.add( directionalLight );
var ambientLight = new THREE.AmbientLight( ambientLevel.getHex() );
scene.add( ambientLight );

// Set a global camera to work with
var camera = new THREE.PerspectiveCamera(45, window.innerWidth/window.innerHeight, 0.1, 1000);
camera.up.copy(new THREE.Vector3(0, 0, 1));
camera.position.copy(new THREE.Vector3(-15, 15, 15));
camera.lookAt(new THREE.Vector3(0, 0, 0));

camera.position.add(new THREE.Vector3(5200, 5200, 0));

// Auto resize canvas
window.addEventListener('resize', onWindowResize, false);

function onWindowResize() {
  var wW = window.innerWidth;
  var wH = window.innerHeight;
  camera.aspect = wW / wH;
  camera.updateProjectionMatrix();
  spriteCam.left = wW / -2;
  spriteCam.right = wW / 2;
  spriteCam.top = wH / 2;
  spriteCam.bottom = wH / -2;
  spriteCam.updateProjectionMatrix();
  renderer.setSize( wW, wH );
}

// Default material for testing with
var defaultMat = new THREE.MeshPhongMaterial({ambient: 0x030303, color: 0xdddddd, specular: 0x009900, shininess: 30, shading: THREE.FlatShading});


// Set up the debugging stuff
var debugGui = null;
var debugCamera = null;
var debugInput = new EventEmitter();
var debugControls = null;
var debugCamFrust = new THREE.CameraHelper(camera);
var debugBoundingBoxes = false;

var debugTriggerKeyCodes = [ 192, 223 ];
var inputMgrEventHandler = InputManager._handleEvent;
InputManager._handleEvent = function(name, e) {
  if (name === 'keydown' && debugTriggerKeyCodes.indexOf(e.keyCode) !== -1) {
    DebugHelper.toggleDebugCamera();
    e.preventDefault();
    return;
  }

  if (debugControls) {
    debugInput.emit(name, e);
  } else {
    // Use the default handler
    inputMgrEventHandler.call(this, name, e);
  }
};

// FPS / MS indicator
var stats = new Stats();
stats.setMode(1); // 0: FPS, 1: MS
stats.domElement.style.position = 'absolute';
stats.domElement.style.left = '0px';
stats.domElement.style.top = '0px';
document.body.appendChild( stats.domElement );

var wW = renderer.domElement.width;
var wH = renderer.domElement.height;
var spriteCam = new THREE.OrthographicCamera( wW/-2, wW/2, wH/2, wH/-2, 0, 1 );
var spriteScene = new THREE.Scene();
var spriteProj = new THREE.Projector();
function _renderSprites() {
  spriteScene.children = [];

  scene.traverseVisible(function(object) {
    if (object instanceof OrthoSprite) {
      var worldPos = object.localToWorld(new THREE.Vector3(0, 0, 0));
      spriteProj.projectVector(worldPos, camera);
      spriteProj.unprojectVector(worldPos, spriteCam);

      worldPos.x = Math.round(worldPos.x) + object.offset.x;
      worldPos.y = Math.round(worldPos.y) - object.offset.y;
      object.renderSprite.position.copy(worldPos);
      object.renderSprite.scale.copy(object.scale);

      spriteScene.add(object.renderSprite);
    }
  });

  renderer.render(spriteScene, spriteCam);
}

var clock = new THREE.Clock();
var renderFrame = function () {
  requestAnimationFrame(renderFrame, renderer.domElement);
  stats.begin();

  var delta = clock.getDelta();
  THREE.AnimationHandler.update( delta );

  StateManager.update(delta);

  var renderCamera = camera;
  if (debugCamera) {
    debugCamFrust.update(delta);
    debugControls.update(delta);
    renderCamera = debugCamera;
  }

  renderer.clear(true, true, false);
  if (skyObject) {
    camera.updateMatrixWorld();
    skyObject.position.copy(camera.localToWorld(new THREE.Vector3(0, 0, 0)));
    renderer.render(skyScene, renderCamera);
  } else {
    renderer.clear(true, true, false);
  }
  renderer.render(scene, renderCamera);

  _renderSprites();

  stats.end();
};
renderFrame();

// A client parameter prefixed with : indicates its the launch state.
for (var i in config) {
  if (i[0] === ':') {
    if (config.state) {
      console.warn('More than one launch state specified!');
    }
    config.state = i.substr(1);
    delete config[i];
  }
}

// Pick the launch state
var launchStateName = config.state ? config.state : 'login';
console.info('Launching game with state `' + launchStateName + '`');

// Default the load screen off if state was manually set
if (config.state) {
  LoadScreen.hide();
}

ShaderManager.register('skydome', 'skydome.vert', 'skydome.frag', {
  depthWrite: true,
  depthTest: false
});
ShaderManager.register('terrain', 'terrain.vert', 'terrain.frag', {
  attributes: {uv3:{}}
});
ShaderManager.register('terrain_lmonly', 'terrain.vert', 'terrain_lmonly.frag', {
  attributes: {uv3:{}}
});
ShaderManager.register('staticobj', 'staticobj.vert', 'staticobj.frag');
ShaderManager.register('staticobj_lmonly', 'staticobj.vert', 'staticobj_lmonly.frag');
ShaderManager.register('water', 'water.vert', 'water.frag', {
  depthWrite: false
});
ShaderManager.register('particle', 'particle.vert', 'particle.frag', {
  side: THREE.DoubleSide,
  depthWrite: false,
  transparent: true
});
ShaderManager.register('partmesh', 'partmesh.vert', 'partmesh.frag', {
  attributes: {alpha:{}},
  defaultAttributeValues: {'alpha': 1}
});

// Shaders before anything else
ShaderManager.init(function() {
  // Needed for game states that alter UI.
  $(function() {
    ui.loadTemplates('/gui/dialogs/templates', function() {
      // Create the debug UI
      debugGui = ui.debugDialog();
      DebugHelper.init();
      StateManager.prepareAndSwitch(launchStateName);
    });
  });
});

GDM.register('file_effect', DataTable, '3DDATA/STB/FILE_EFFECT.STB');
GDM.register('list_event', DataTable, '3DDATA/STB/LIST_EVENT.STB');
GDM.register('quest_scripts', QuestScriptManager, '3DDATA/STB/LIST_QUESTDATA.STB');
GDM.register('item_data', ItemDataManager);
GDM.register('skill_data', SkillDataManager);
GDM.register('list_class', DataTable, '3DDATA/STB/LIST_CLASS.STB');
GDM.register('list_status', DataTable, '3DDATA/STB/LIST_STATUS.STB');

GDM.register('list_zone', DataTable, '3DDATA/STB/LIST_ZONE.STB');
GDM.register('zone_names', StringTable, '3DDATA/STB/LIST_ZONE_S.STL');
GDM.register('list_sky', DataTable, '3DDATA/STB/LIST_SKY.STB');

GDM.register('list_quest', DataTable, '3DDATA/STB/LIST_QUEST.STB');
GDM.register('quest_names', StringTable, '3DDATA/STB/LIST_QUEST_S.STL');

GDM.register('morph_anims', MorphAnimManager, '3DDATA/STB/LIST_MORPH_OBJECT.STB');

GDM.register('char_motiontypes', DataTable, '3DDATA/STB/TYPE_MOTION.STB');
GDM.register('char_motions', DataTable, '3DDATA/STB/FILE_MOTION.STB');

GDM.register('npc_chars', CharacterList, '3DDATA/NPC/LIST_NPC.CHR');
GDM.register('npc_models', ModelListManager, '3DDATA/NPC/PART_NPC.ZSC');
GDM.register('list_npc', DataTable, '3DDATA/STB/LIST_NPC.STB');
GDM.register('npc_names', StringTable, '3DDATA/STB/LIST_NPC_S.STL');

GDM.register('fielditem_models', ModelListManager, '3DDATA/ITEM/LIST_FIELDITEM.ZSC');
GDM.register('fielditem_ani', AnimationData, '3DDATA/MOTION/ITEM_ANI.ZMO');

GDM.register('male_skel', SkeletonData, '3DDATA/AVATAR/MALE.ZMD');
GDM.register('female_skel', SkeletonData, '3DDATA/AVATAR/FEMALE.ZMD');

GDM.register('itm_mface', ModelListManager, '3DDATA/AVATAR/LIST_MFACE.ZSC');
GDM.register('itm_mhair', ModelListManager, '3DDATA/AVATAR/LIST_MHAIR.ZSC');
GDM.register('itm_mcap', ModelListManager, '3DDATA/AVATAR/LIST_MCAP.ZSC');
GDM.register('itm_mbody', ModelListManager, '3DDATA/AVATAR/LIST_MBODY.ZSC');
GDM.register('itm_marms', ModelListManager, '3DDATA/AVATAR/LIST_MARMS.ZSC');
GDM.register('itm_mfoot', ModelListManager, '3DDATA/AVATAR/LIST_MFOOT.ZSC');
GDM.register('itm_mfaceitem', ModelListManager, '3DDATA/AVATAR/LIST_MFACEITEM.ZSC');

GDM.register('itm_fface', ModelListManager, '3DDATA/AVATAR/LIST_WFACE.ZSC');
GDM.register('itm_fhair', ModelListManager, '3DDATA/AVATAR/LIST_WHAIR.ZSC');
GDM.register('itm_fcap', ModelListManager, '3DDATA/AVATAR/LIST_WCAP.ZSC');
GDM.register('itm_fbody', ModelListManager, '3DDATA/AVATAR/LIST_WBODY.ZSC');
GDM.register('itm_farms', ModelListManager, '3DDATA/AVATAR/LIST_WARMS.ZSC');
GDM.register('itm_ffoot', ModelListManager, '3DDATA/AVATAR/LIST_WFOOT.ZSC');
GDM.register('itm_ffaceitem', ModelListManager, '3DDATA/AVATAR/LIST_WFACEITEM.ZSC');

GDM.register('itm_back', ModelListManager, '3DDATA/AVATAR/LIST_BACK.ZSC');
GDM.register('itm_weapon', ModelListManager, '3DDATA/WEAPON/LIST_WEAPON.ZSC');
GDM.register('itm_subwpn', ModelListManager, '3DDATA/WEAPON/LIST_SUBWPN.ZSC');
