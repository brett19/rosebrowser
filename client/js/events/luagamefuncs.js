global.VAR_INDEX = {
  SEX: 0,
  BIRTH: 1,
  CLASS: 2,
  UNION: 3,
  RANK: 4,
  FAME: 5,
  STR: 6,
  DEX: 7,
  INT: 8,
  CON: 9,
  CHA: 10,
  SEN: 11,
  EXP: 12,
  LEVEL: 13,
  POINT: 14
};

var GF = {};

GF.getVariable = function(type) {
  var value = -1;

  switch(type) {
  case VAR_INDEX.SEX:
    value = MC.getAbilityValue(ABILTYPE.SEX);
    break;
  case VAR_INDEX.BIRTH:
    value = MC.getAbilityValue(ABILTYPE.BIRTH);
    break;
  case VAR_INDEX.CLASS:
    value = MC.getAbilityValue(ABILTYPE.CLASS);
    break;
  case VAR_INDEX.UNION:
    value = MC.getAbilityValue(ABILTYPE.UNION);
    break;
  case VAR_INDEX.RANK:
    value = MC.getAbilityValue(ABILTYPE.RANK);
    break;
  case VAR_INDEX.FAME:
    value = MC.getAbilityValue(ABILTYPE.FAME);
    break;
  case VAR_INDEX.STR:
    value = MC.getAbilityValue(ABILTYPE.STR);
    break;
  case VAR_INDEX.DEX:
    value = MC.getAbilityValue(ABILTYPE.DEX);
    break;
  case VAR_INDEX.INT:
    value = MC.getAbilityValue(ABILTYPE.INT);
    break;
  case VAR_INDEX.CON:
    value = MC.getAbilityValue(ABILTYPE.CON);
    break;
  case VAR_INDEX.CHA:
    value = MC.getAbilityValue(ABILTYPE.CHA);
    break;
  case VAR_INDEX.SEN:
    value = MC.getAbilityValue(ABILTYPE.SEN);
    break;
  case VAR_INDEX.EXP:
    value = MC.getAbilityValue(ABILTYPE.EXP);
    break;
  case VAR_INDEX.LEVEL:
    value = MC.getAbilityValue(ABILTYPE.LEVEL);
    break;
  }

  return [ value ];
};

GF.getName = function() {
  return [ MC.name ];
};

GF.getReviveZoneName = function() {
  var listZones = GDM.getNow('list_zone');
  var zoneNames = GDM.getNow('zone_names');
  var zoneStrKey = listZones.item(MC.reviveZoneNo, 26);
  var name = zoneNames.getByKey(zoneStrKey).text;
  return [ name ];
};

GF.setRevivePosition = function() {
  netGame.setRevivePosition();
  MC.reviveZoneNo = MC.zoneNo;
  return [ 0 ];
};

module.exports = GF;
