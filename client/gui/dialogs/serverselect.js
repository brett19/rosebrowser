'use strict';
ui.loadTemplateFile('serverselect.html');

ui.ServerSelectDialog = function(servers) {
  ui.Dialog.call(this, 'serverselect.html');

  this._serverList = ui.list(this, '.list.servers');
  this._serverList.on('itemdoubleclicked', this._selectServer.bind(this));

  this._servers = servers;
  this._update();
  this.center();
}

ui.ServerSelectDialog.prototype = Object.create(ui.Dialog.prototype);

ui.ServerSelectDialog.prototype._update = function() {
  this._serverList.clear();

  for (var i = 0; i < this._servers.length; ++i) {
    var item = ui.listitem();
    item.html(this._servers[i].name);
    this._serverList.append(item);
  }

  this._serverList.index(0);
}

ui.ServerSelectDialog.prototype._selectServer = function(index) {
  index = index || this._serverList.index();
  this.emit('done', this._servers[index].id);
  this.close();
};

ui.serverSelectDialog = function(servers) {
  return new ui.ServerSelectDialog(servers);
};
