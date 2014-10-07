'use strict';
ui.loadTemplateFile('questlist.html');

ui.QuestListDialog = function(questData) {
  ui.Dialog.call(this, 'questlist.html');

  this._questList = ui.list(this, '.list.quests');
  this._description = ui.label(this, '.label.description');

  this._items = [];
  for (var i = 1; i <= 6; ++i) {
    this._items.push(ui.iconslot(this, '.quest-slot-' + i));
  }

  ui.button(this, '.button.abandon').on('clicked', this._abandonQuest.bind(this));

  this._data = questData;
  this._data.on('changed', this._update.bind(this));
  this._update();
}

ui.QuestListDialog.prototype = Object.create(ui.Dialog.prototype);

ui.QuestListDialog.prototype._selectQuest = function(index) {
  var self = this;
  var quest = this._data.quests[index];

  this._description.clear();

  for (var i = 0; i < this._items.length; ++i) {
    this._items[i].clear();
  }

  if (!quest) {
    return;
  }

  GDM.get('list_quest', 'quest_names', 'item_data', function (questData, questString, itemData) {
    var row = questData.row(quest.id);
    var str = questString.getByKey(row[6]);
    var html = '<b>' + str.text + '</b>';
    html += '<p>' + str.comment + '</p>';
    html += '<p>' + str.quest1 + '</p>';
    html += '<p>' + str.quest2 + '</p>';
    self._description.html(html);

    for (var i = 0, j = 0; i < self._data.items.length; ++i) {
      var questItem = self._data.items[i];

      if (questItem.quest === quest.id) {
        var slot = self._items[j++];
        slot.setItem(questItem.item);
      }
    }

    // TODO: Update quest timer
  });
};

ui.QuestListDialog.prototype._abandonQuest = function() {
  // TODO: Abandon quest!
};

ui.QuestListDialog.prototype._update = function() {
  var self = this;

  GDM.get('list_quest', 'quest_names', function (questData, questString) {
    self._questList.clear();

    for (var i = 0; i < self._data.quests.length; ++i) {
      var quest = self._data.quests[i];

      if (quest.id > 0) {
        var row = questData.row(quest.id);
        var str = questString.getByKey(row[6]);
        var item = ui.listitem();
        item.text(str.text);
        self._questList.append(item).on('clicked', self._selectQuest.bind(self, i));
      }
    }

    self._questList.index(0);
  });
};

ui.questListDialog = function(questData) {
  return new ui.QuestListDialog(questData);
};
