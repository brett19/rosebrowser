// Globals
global.netLogin = null;
global.netWorld = null;
global.netGame = null;

global.MOTION_TABLE = {
  MALE_MOTION: 0, // STR
  FEMALE_MOTION: 1, // STR
  MOTION_TYPE: 2, // INT
  DESCRIPTION: 3 // STR
};
global.AVTANI = {
  STOP1: 0,
  STOP2: 1,
  WALK: 2,
  RUN: 3,
  SITTING: 4,
  SIT: 5,
  STANDUP: 6,
  STOP3: 7,
  ATTACK: 8,
  ATTACK2: 9,
  ATTACK3: 10,
  HIT: 11,
  FALL: 12,
  DIE: 13,
  RAISE: 14,
  JUMP1: 15,
  JUMP2: 16,
  PICKITEM: 17
};
global.AVTBODYPART = {
  Face: 0,
  Hair: 1,
  Cap: 2,
  Body: 3,
  Arms: 4,
  Foot: 5,
  FaceItem: 6,
  Back: 7,
  Weapon: 8,
  SubWeapon: 9,
  Max: 10
};
global.AVTRIDEPART = {
  Max: 5
};
global.AVTSHOTTYPE = {
  Max: 3
};
global.BoneIndex = {
  Pelvis: 0,
  Head: 4
};
global.DummyIndex = {
  RightHand: 0,
  LeftHand: 1,
  LeftHandShield: 2,
  Back: 3,
  Mouse: 4,
  Eyes: 5,
  Cap: 6
};

global.NETLOGINREPLY = {
  OK: 0,
  Failed: 1,
  InvalidUsername: 2,
  InvalidPassword: 3,
  AlreadyLoggedIn: 4,
  RefusedAccount: 5,
  NeedCharge: 6,
  NoRights: 7,
  Overloaded: 8,
  NoRealName: 9,
  BadVersion: 10,
  OutOfIp: 11
};
global.RESULT_CREATE_CHAR_OK = 0x00;
global.RESULT_CREATE_CHAR_FAILED = 0x01;
global.RESULT_CREATE_CHAR_DUP_NAME = 0x02;
global.RESULT_CREATE_CHAR_INVALID_NAME = 0x03;
global.RESULT_CREATE_CHAR_NO_MORE_SLOT = 0x04;
global.RESULT_CREATE_CHAR_BLOCKED = 0x05;
global.RESULT_CREATE_CHAR_NEED_PREMIUM = 0x06;
global.REPLY_GET_FIELDITEM_REPLY_OK = 0x00;
global.REPLY_GET_FIELDITEM_REPLY_NONE = 0x01;
global.REPLY_GET_FIELDITEM_REPLY_NO_RIGHT = 0x02;
global.REPLY_GET_FIELDITEM_REPLY_TOO_MANY = 0x03;
global.PARTY_RULE_EXP_PER_PLAYER = 0x001;
global.PARTY_RULE_ITEM_TO_ORDER = 0x080;
global.PARTY_MEMBER_SUB = 0xff;
global.PARTY_REPLY_NOT_FOUND = 0x00;
global.PARTY_REPLY_BUSY = 0x01;
global.PARTY_REPLY_ACCEPT_MAKE = 0x02;
global.PARTY_REPLY_ACCEPT_JOIN = 0x03;
global.PARTY_REPLY_REJECT_JOIN = 0x04;
global.PARTY_REPLY_DESTROY = 0x05;
global.PARTY_REPLY_FULL_MEMBERS = 0x06;
global.PARTY_REPLY_INVALID_LEVEL = 0x07;
global.PARTY_REPLY_CHANGE_OWNER = 0x08;
global.PARTY_REPLY_CHANGE_OWNERnDISCONN = 0x09;
global.PAATY_REPLY_NO_CHARGE_TARGET = 0x0a;
global.PARTY_REPLY_SHARE_ENABLED = 0x0b;
global.PARTY_REPLY_SHARE_DISABLED = 0x0c;
global.PARTY_REPLY_BAN = 0x80;
global.PARTY_REPLY_DISCONNECT = 0x81;
global.PARTY_REPLY_REJOIN = 0x82;
global.PARTY_REQ_MAKE = 0x00;
global.PARTY_REQ_JOIN = 0x01;
global.PARTY_REQ_LEFT = 0x02;
global.PARTY_REQ_CHANGE_OWNER = 0x03;
global.PARTY_REQ_BAN = 0x81;
global.TYPE_QUEST_REQ_ADD = 0x01;
global.TYPE_QUEST_REQ_DEL = 0x02;
global.TYPE_QUEST_REQ_DO_TRIGGER = 0x03;
global.RESULT_QUEST_REPLY_ADD_SUCCESS = 0x01;
global.RESULT_QUEST_REPLY_ADD_FAILED = 0x02;
global.RESULT_QUEST_REPLY_DEL_SUCCESS = 0x03;
global.RESULT_QUEST_REPLY_DEL_FAILED = 0x04;
global.RESULT_QUEST_REPLY_TRIGGER_SUCCESS = 0x05;
global.RESULT_QUEST_REPLY_TRIGGER_FAILED = 0x06;
global.RESULT_QUEST_REPLY_UPDATE = 0x07;
global.RESULT_QUEST_REPLY_COMPLETE = 0x08;
global.RESULT_QUEST_REPLY_RESET = 0x09;
global.RESULT_QUEST_REPLY_DAILY_RESET = 0x0a;
global.RESULT_QUEST_REWARD_ADD_ITEM = 0x01;
global.RESULT_QUEST_REWARD_REMOVE_ITEM = 0x02;
global.RESULT_QUEST_DATA_QUESTVAR = 0x00;
global.RESULT_QUEST_DATA_QUESTLOG = 0x01;


global.EPSILON = 0.0001;
global.AVT_CLICK_EVENT_RANGE = 10.00;
global.NPC_CLICK_EVENT_RANGE = 2.50;
global.ITEM_CLICK_EVENT_RANGE = 1.50;




// Types
global.Int64 = require('./types/int64');
global.Color4 = require('./types/color4');

// Logging
global.DebugLogger = require('./util/logging');
global.netConsole = new DebugLogger('net', !config.disableNetLog);
global.gomConsole = new DebugLogger('lua', !config.disableGomLog);
global.luaConsole = new DebugLogger('lua', !config.disableLuaLog);
global.qsdConsole = new DebugLogger('qsd', !config.disableQsdLog);

// Utilities
global.BinaryReader = require('./util/binaryreader');
global.EventEmitter = require('./util/eventemitter');
global.StrToHashKey = require('./util/hash.js');
global.Font = require('./util/font.js');
global.MultiWait = require('./util/multiwait');
global.normalizePath = require('./util/path').normalize;
global.slerp1d = require('./util/mathutil').slerp1d;
global.enumToName = require('./util/generic').enumToName;
global.debugValidateProps = require('./util/generic').debugValidateProps;
global.VIRTUAL_FUNC = require('./util/generic').VIRTUAL_FUNC;

// Networking
global.LoginClient = require('./net/loginclient');
global.WorldClient = require('./net/worldclient');
global.GameClient = require('./net/gameclient');

// Controls
global.InputManager = require('./controls/inputmanager.js');
require('./controls/orbit.js');
require('./controls/fly.js');
require('./controls/freefly.js');

// Helpers
global.DataManager = require('./helpers/datamanager');

// File Formats
global.ROSELoader = require('./loaders/rose');
global.CharacterList = require('./loaders/chr');
global.NpcChatData = require('./loaders/cxe');
global.DDS = require('./loaders/dds');
global.EffectData = require('./loaders/eft');
global.HeightmapData = require('./loaders/him');
global.ZoneChunkData = require('./loaders/ifo');
global.LightmapData = require('./loaders/lit');
global.ParticleSystemData = require('./loaders/ptl');
global.QuestLogicData = require('./loaders/qsd');
global.DataTable = require('./loaders/stb');
global.StringTable = require('./loaders/stl');
global.TilemapData = require('./loaders/til');
global.CameraSpec = require('./loaders/zca');
global.SkeletonData = require('./loaders/zmd');
global.AnimationData = require('./loaders/zmo');
global.Mesh = require('./loaders/zms');
global.ZoneData = require('./loaders/zon');
global.ModelList = require('./loaders/zsc');

// Animators
global.CameraAnimator = require('./animators/cameraanimator.js');
global.GeometryAnimator = require('./animators/geometryanimator.js');
global.SkeletonAnimator = require('./animators/skeletonanimator.js');
global.ObjectAnimator = require('./animators/objectanimator.js');

// Cacheing Stuff
global.IndexedCache = require('./helpers/indexedcache');
global.DataCache = require('./helpers/datacache');

// Pawns
global.ItemPawn = require('./pawns/itempawn');
global.NpcPawn = require('./pawns/npcpawn');
global.CharPawn = require('./pawns/charpawn');

// Game Data Stuff
require('./gamedata/chartypes');
global.CharStats = require('./gamedata/charstats');
global.HotIcons = require('./gamedata/hoticons');
global.IngStatus = require('./gamedata/ingstatus');
global.InventoryData = require('./gamedata/inventorydata');
global.McStats = require('./gamedata/mcstats');
global.NpcStats = require('./gamedata/npcstats');
global.PartyData = require('./gamedata/partydata');
global.QuestData = require('./gamedata/questdata');
global.SkillData = require('./gamedata/skilldata');

// Effects
global.EffectManager = require('./effects/effectmanager');

// Maps
global.MapManager = require('./maps/mapmanager');

// Game Helpers
global.OrthoSprite = require('./helpers/orthosprite');
global.LoadScreen = require('./helpers/loadscreen');
global.DebugHelper = require('./helpers/debughelper');
global.NetManager = require('./helpers/netmanager');
global.DamageRender = require('./helpers/damagerender');
global.GC = require('./helpers/gamecontrol');
global.GCM = require('./helpers/chatmanager');
global.iconManager = require('./helpers/iconmanager');
global.tooltipManager = require('./helpers/tooltipmanager');

// Data Managers
global.ShaderManager = require('./datamanagers/shadermanager');
global.TextureManager = require('./datamanagers/texturemanager');
global.ModelListManager = require('./datamanagers/modellistmanager');
global.LightmapManager = require('./datamanagers/lightmapmanager');
global.MorphAnimManager = require('./datamanagers/morphanimmanager');
global.ItemDataManager = require('./datamanagers/itemdatamanager');
global.SkillDataManager = require('./datamanagers/skilldatamanager');

// Event / Quest Related
global.luaFunctions = require('./events/luafuncs');
global.QuestScriptManager = require('./events/questscriptmanager');
global.Conversation = require('./events/conversation');

// Game Objects
global.GZM = require('./objects/zonemanager');
global.GameObject = require('./objects/gameobject');
global.ProxyObject = require('./objects/proxyobject');
global.ItemObject = require('./objects/itemobject');
global.ActorObject = require('./objects/actorobject');
global.MobObject = require('./objects/mobobject');
global.NpcObject = require('./objects/npcobject');
global.CharObject = require('./objects/charobject');
global.MyCharacter = require('./objects/mycharacter');

// State Stuff
global.StateManager = require('./states/statemanager');
require('./states/teststate');
require('./states/loginstate');
require('./states/gameteststate');
require('./states/pregamestate');
require('./states/gamestate');
require('./states/particleteststate');
require('./states/movgenstate');
require('./states/emptystate');

// GUI
// This currently just exposes it to global
require('../gui/ui');

global.GDM = new DataManager();
global.MC = null;
