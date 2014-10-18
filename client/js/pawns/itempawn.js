var Pawn = require('./pawn');

function ItemPawn(go) {
  Pawn.call(this);

  if (go) {
    this.owner = go;
  }
}
ItemPawn.prototype = Object.create(Pawn.prototype);

ItemPawn.prototype._setModel = function(modelMgr, modelIdx) {
  var model = modelMgr.createForStatic(modelIdx);
  GDM.get('fielditem_ani', function(itemAni) {
    var ani = new ObjectAnimator(model, itemAni);
    ani.loop = false;
    ani.once('finish', function() {
      ani.stop();
    });
    ani.play();
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

module.exports = ItemPawn;
