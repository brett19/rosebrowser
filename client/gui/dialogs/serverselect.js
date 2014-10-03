ui.ServerSelectDialog = function(template, servers) {
  ui.Dialog.call(this, template);

  this.serverList = ui.list(this, '.list.servers');
  this.serverList.on('itemdoubleclicked', this._selectServer.bind(this));

  if (servers) {
    this.setServers(servers);
  }
}

ui.ServerSelectDialog.prototype = Object.create(ui.Dialog.prototype);

ui.ServerSelectDialog.prototype.setServers = function(servers) {
  this.servers = servers;
  this.serverList.clear();

  for (var i = 0; i < this.servers.length; ++i) {
    var item = $('<div />');
    item.html(servers[i].name);
    this.serverList.append(item);
  }

  this.serverList.index(0);
}

ui.ServerSelectDialog.prototype._selectServer = function(index) {
  index = index || this.serverList.index();
  this.emit('done', this.servers[index].id);
  this.close();
};

ui.serverSelectDialog = function(servers) {
  return new ui.ServerSelectDialog('#dlgServerSelect', servers);
};
