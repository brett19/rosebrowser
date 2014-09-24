'use strict';

function lua_SETFUNC(luaState, name, func) {
  if (!func) {
    func = function() {
      console.error('LUA called unimplemented function `' + name + '`.');
      return [];
    }
  }
  lua_tableset(luaState, name, func);
}

function GF_Init(luaState) {
  lua_SETFUNC(luaState, 'GF_ChangeState');
  lua_SETFUNC(luaState, 'GF_DeleteEffectFromObject');
  lua_SETFUNC(luaState, 'GF_EffectOnObject');
  lua_SETFUNC(luaState, 'GF_GetEffectUseFile');
  lua_SETFUNC(luaState, 'GF_GetEffectUseIndex');
  lua_SETFUNC(luaState, 'GF_GetMotionUseFile');
  lua_SETFUNC(luaState, 'GF_GetTarget');
  lua_SETFUNC(luaState, 'GF_LogString');
  lua_SETFUNC(luaState, 'GF_Random');
  lua_SETFUNC(luaState, 'GF_SetMotion');
  lua_SETFUNC(luaState, 'GF_WeatherEffectOnObject');
  lua_SETFUNC(luaState, 'GF_addUserMoney');
  lua_SETFUNC(luaState, 'GF_appraisal');
  lua_SETFUNC(luaState, 'GF_checkNumOfInvItem');
  lua_SETFUNC(luaState, 'GF_checkTownItem');
  lua_SETFUNC(luaState, 'GF_checkUserMoney');
  lua_SETFUNC(luaState, 'GF_disorganizeClan');
  lua_SETFUNC(luaState, 'GF_error');
  lua_SETFUNC(luaState, 'GF_getDate');
  lua_SETFUNC(luaState, 'GF_getGameVersion');
  lua_SETFUNC(luaState, 'GF_getIDXOfInvItem');
  lua_SETFUNC(luaState, 'GF_getItemRate');
  lua_SETFUNC(luaState, 'GF_getName');
  lua_SETFUNC(luaState, 'GF_getReviveZoneName');
  lua_SETFUNC(luaState, 'GF_getTownRate');
  lua_SETFUNC(luaState, 'GF_getTownVar');
  lua_SETFUNC(luaState, 'GF_getVariable');
  lua_SETFUNC(luaState, 'GF_getWorldRate');
  lua_SETFUNC(luaState, 'GF_getZone');
  lua_SETFUNC(luaState, 'GF_giveEquipItemIntoInv');
  lua_SETFUNC(luaState, 'GF_giveUsableItemIntoInv');
  lua_SETFUNC(luaState, 'GF_log');
  lua_SETFUNC(luaState, 'GF_movableXY');
  lua_SETFUNC(luaState, 'GF_moveEvent');
  lua_SETFUNC(luaState, 'GF_moveXY');
  lua_SETFUNC(luaState, 'GF_openBank');
  lua_SETFUNC(luaState, 'GF_openDeliveryStore');
  lua_SETFUNC(luaState, 'GF_openSeparate');
  lua_SETFUNC(luaState, 'GF_openStore');
  lua_SETFUNC(luaState, 'GF_openUpgrade');
  lua_SETFUNC(luaState, 'GF_organizeClan');
  lua_SETFUNC(luaState, 'GF_playEffect');
  lua_SETFUNC(luaState, 'GF_playSound');
  lua_SETFUNC(luaState, 'GF_putoffItem');
  lua_SETFUNC(luaState, 'GF_putonItem');
  lua_SETFUNC(luaState, 'GF_repair');
  lua_SETFUNC(luaState, 'GF_rotateCamera');
  lua_SETFUNC(luaState, 'GF_setEquipedItem');
  lua_SETFUNC(luaState, 'GF_setRevivePosition');
  lua_SETFUNC(luaState, 'GF_setTownRate');
  lua_SETFUNC(luaState, 'GF_setVariable');
  lua_SETFUNC(luaState, 'GF_setWorldRate');
  lua_SETFUNC(luaState, 'GF_spawnMonAtEvent');
  lua_SETFUNC(luaState, 'GF_spawnMonXY');
  lua_SETFUNC(luaState, 'GF_takeItemFromInv');
  lua_SETFUNC(luaState, 'GF_takeUserMoney');
  lua_SETFUNC(luaState, 'GF_warp');
  lua_SETFUNC(luaState, 'GF_zoomCamera');
}

function QF_Init(luaState) {
  GF_Init(luaState);

  lua_SETFUNC(luaState, 'QF_CameraworkingNpc');
  lua_SETFUNC(luaState, 'QF_CameraworkingPoint');
  lua_SETFUNC(luaState, 'QF_CameraworkingSelf');
  lua_SETFUNC(luaState, 'QF_ChangetalkImage');
  lua_SETFUNC(luaState, 'QF_ChangetalkName');
  lua_SETFUNC(luaState, 'QF_EffectCallNpc');
  lua_SETFUNC(luaState, 'QF_EffectCallSelf');
  lua_SETFUNC(luaState, 'QF_MotionCallNpc');
  lua_SETFUNC(luaState, 'QF_MotionCallSelf');
  lua_SETFUNC(luaState, 'QF_NpcHide');
  lua_SETFUNC(luaState, 'QF_NpcTalkinterfaceHide');
  lua_SETFUNC(luaState, 'QF_NpcTalkinterfaceView');
  lua_SETFUNC(luaState, 'QF_NpcView');
  lua_SETFUNC(luaState, 'QF_appendQuest');
  lua_SETFUNC(luaState, 'QF_beginCon');
  lua_SETFUNC(luaState, 'QF_checkQuestCondition', function(triggerName) {
    var questScripts = GDM.getNow('quest_scripts');
    luaConsole.debug('QF_checkQuestCondition(', triggerName, ')');
    var res = questScripts.checkOnly(triggerName);
    luaConsole.debug('QF_checkQuestCondition Result:', res);
    return [ res ? 1 : 0 ];
  });
  lua_SETFUNC(luaState, 'QF_closeCon');
  lua_SETFUNC(luaState, 'QF_deleteQuest');
  lua_SETFUNC(luaState, 'QF_doQuestTrigger');
  lua_SETFUNC(luaState, 'QF_findQuest');
  lua_SETFUNC(luaState, 'QF_getClanVAR');
  lua_SETFUNC(luaState, 'QF_getEpisodeVAR');
  lua_SETFUNC(luaState, 'QF_getEventOwner');
  lua_SETFUNC(luaState, 'QF_getJobVAR');
  lua_SETFUNC(luaState, 'QF_getNpcQuestZeroVal');
  lua_SETFUNC(luaState, 'QF_getQuestCount');
  lua_SETFUNC(luaState, 'QF_getQuestID');
  lua_SETFUNC(luaState, 'QF_getQuestItemQuantity');
  lua_SETFUNC(luaState, 'QF_getQuestSwitch');
  lua_SETFUNC(luaState, 'QF_getQuestVar');
  lua_SETFUNC(luaState, 'QF_getSkillLevel');
  lua_SETFUNC(luaState, 'QF_getUnionVAR');
  lua_SETFUNC(luaState, 'QF_getUserSwitch');
  lua_SETFUNC(luaState, 'QF_givePoint');
  lua_SETFUNC(luaState, 'QF_gotoCon');
}
