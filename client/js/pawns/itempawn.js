'use strict';

function ItemPawn(go) {
  Pawn.call(this);

  if (go) {
    this.owner = go;
  }
}
ItemPawn.prototype = Object.create(Pawn.prototype);

ItemPawn.prototype._setModel = function(modelMgr, modelIdx) {
  var model = modelMgr.createForStatic(modelIdx, null, null, function() {
    console.log('FIELDITEM LOADED', model);
  });
  this.rootObj.add(model);
};

ItemPawn.prototype.setModel = function(modelIdx, callback) {
  var self = this;
  GDM.get('fielditem_models', function(modelList) {
    self._setModel(modelList, modelIdx);
    if (callback) {
      callback();
    }
  });
};
