ui.QuestListDialog = function(template, questData) {
  ui.Dialog.call(this, template);

  this.questList = ui.list(this, '.list.quests');
  this.description = ui.label(this, '.label.description');

  this.items = [];
  for (var i = 1; i <= 6; ++i) {
    this.items.push(ui.iconslot(this, '.quest-slot-' + i));
  }

  ui.button(this, '.button.abandon').on('clicked', this._abandonQuest.bind(this));

  this.data = questData;
  this._update();
}

ui.QuestListDialog.prototype = Object.create(ui.Dialog.prototype);

ui.QuestListDialog.prototype._selectQuest = function(index) {
  var quest = this.data.quests[index];
  var self = this;

  GDM.get('list_quest', 'quest_names', function (questData, questString) {
    var row = questData.row(quest.id);
    var str = questString.getByKey(row[6]);
    var html = '<b>' + str.text + '</b>';
    html += '<p>' + str.comment + '</p>';
    html += '<p>' + str.quest1 + '</p>';
    html += '<p>' + str.quest2 + '</p>';
    self.description.html(html);
    // TODO: Update quest timer and items!
  });
};

ui.QuestListDialog.prototype._abandonQuest = function() {
  // TODO: Abandon quest!
};

ui.QuestListDialog.prototype._update = function() {
  var self = this;

  GDM.get('list_quest', 'quest_names', function (questData, questString) {
    self.questList.clear();

    for (var i = 0; i < self.data.quests.length; ++i) {
      var quest = self.data.quests[i];

      if (quest.id > 0) {
        var row = questData.row(quest.id);
        var str = questString.getByKey(row[6]);
        var item = $('<div>' + str.text + '</div>');
        self.questList.append(item).on('clicked', self._selectQuest.bind(self, i));
      }
    }

    self.questList.index(0);
  });
};

ui.questListDialog = function(questData) {
  return new ui.QuestListDialog('#dlgQuestList', questData);
};
