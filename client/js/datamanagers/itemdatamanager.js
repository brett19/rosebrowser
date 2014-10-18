var IDM_STBS = {};
IDM_STBS[ITEMTYPE.FACE_ITEM] = '3DDATA/STB/LIST_FACEITEM.STB';
IDM_STBS[ITEMTYPE.HELMET] = '3DDATA/STB/LIST_CAP.STB';
IDM_STBS[ITEMTYPE.ARMOR] = '3DDATA/STB/LIST_BODY.STB';
IDM_STBS[ITEMTYPE.ARMS] = '3DDATA/STB/LIST_ARMS.STB';
IDM_STBS[ITEMTYPE.BOOTS] = '3DDATA/STB/LIST_FOOT.STB';
IDM_STBS[ITEMTYPE.BACK] = '3DDATA/STB/LIST_BACK.STB';
IDM_STBS[ITEMTYPE.JEWEL] = '3DDATA/STB/LIST_JEWEL.STB';
IDM_STBS[ITEMTYPE.WEAPON] = '3DDATA/STB/LIST_WEAPON.STB';
IDM_STBS[ITEMTYPE.SHIELD] = '3DDATA/STB/LIST_SUBWPN.STB';
IDM_STBS[ITEMTYPE.USE] = '3DDATA/STB/LIST_USEITEM.STB';
IDM_STBS[ITEMTYPE.GEM] = '3DDATA/STB/LIST_JEMITEM.STB';
IDM_STBS[ITEMTYPE.NATURAL] = '3DDATA/STB/LIST_NATURAL.STB';
IDM_STBS[ITEMTYPE.QUEST] = '3DDATA/STB/LIST_QUESTITEM.STB';
IDM_STBS[ITEMTYPE.RIDE_PART] = '3DDATA/STB/LIST_PAT.STB';
IDM_STBS[ITEMTYPE.MOUNT] = '3DDATA/STB/LIST_MOUNT.STB';
var IDM_STLS = {};
IDM_STLS[ITEMTYPE.FACE_ITEM] = '3DDATA/STB/LIST_FACEITEM_S.STL';
IDM_STLS[ITEMTYPE.HELMET] = '3DDATA/STB/LIST_CAP_S.STL';
IDM_STLS[ITEMTYPE.ARMOR] = '3DDATA/STB/LIST_BODY_S.STL';
IDM_STLS[ITEMTYPE.ARMS] = '3DDATA/STB/LIST_ARMS_S.STL';
IDM_STLS[ITEMTYPE.BOOTS] = '3DDATA/STB/LIST_FOOT_S.STL';
IDM_STLS[ITEMTYPE.BACK] = '3DDATA/STB/LIST_BACK_S.STL';
IDM_STLS[ITEMTYPE.JEWEL] = '3DDATA/STB/LIST_JEWEL_S.STL';
IDM_STLS[ITEMTYPE.WEAPON] = '3DDATA/STB/LIST_WEAPON_S.STL';
IDM_STLS[ITEMTYPE.SHIELD] = '3DDATA/STB/LIST_SUBWPN_S.STL';
IDM_STLS[ITEMTYPE.USE] = '3DDATA/STB/LIST_USEITEM_S.STL';
IDM_STLS[ITEMTYPE.GEM] = '3DDATA/STB/LIST_JEMITEM_S.STL';
IDM_STLS[ITEMTYPE.NATURAL] = '3DDATA/STB/LIST_NATURAL_S.STL';
IDM_STLS[ITEMTYPE.QUEST] = '3DDATA/STB/LIST_QUESTITEM_S.STL';
IDM_STLS[ITEMTYPE.RIDE_PART] = '3DDATA/STB/LIST_PAT_S.STL';
IDM_STLS[ITEMTYPE.MOUNT] = '3DDATA/STB/LIST_MOUNT_S.STL';

/**
 * @constructor
 */
function ItemDataManager() {
  this.data = {};
  this.strings = {};
}

ItemDataManager.prototype.getData = function(itemType, itemNo) {
  return this.data[itemType].row(itemNo);
};

ItemDataManager.prototype.getName = function(itemType, itemNo) {
  var typeData = this.data[itemType];
  var itemKey = typeData.item(itemNo, typeData.columnCount - 1);
  return this.strings[itemType].getByKey(itemKey).text;
};

ItemDataManager.prototype.getDescription = function(itemType, itemNo) {
  var typeData = this.data[itemType];
  var itemKey = typeData.item(itemNo, typeData.columnCount - 1);
  return this.strings[itemType].getByKey(itemKey).comment;
};

/**
 * Load helper so the ItemDataManager can be controlled by the GDM.
 *
 * @param path Ignores
 * @param callback
 */
ItemDataManager.load = function(path, callback) {
  var waitAll = new MultiWait();
  var mgr = new ItemDataManager();
  for (var i in IDM_STBS) {
    if (IDM_STBS.hasOwnProperty(i)) {
      DataTable.load(IDM_STBS[i], function(stbIdx, waitCb, stbData) {
        mgr.data[stbIdx] = stbData;
        waitCb();
      }.bind(this, i, waitAll.one()));
    }
  }
  for (var i in IDM_STLS) {
    if (IDM_STLS.hasOwnProperty(i)) {
      StringTable.load(IDM_STLS[i], function(stlIdx, waitCb, stlData) {
        mgr.strings[stlIdx] = stlData;
        waitCb();
      }.bind(this, i, waitAll.one()));
    }
  }
  waitAll.wait(function() {
    callback(mgr);
  });
};

module.exports = ItemDataManager;
