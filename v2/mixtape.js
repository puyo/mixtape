mixtape = this || {};


mixtape.Song = Backbone.Model.extend({
  defaults: {
    search: "",
    editing: false
  }
});


mixtape.SongList = Backbone.Collection.extend({
  model: Song,
});


mixtape.SongView = Backbone.View.extend({
  className: "song",

  template: _.template($("#song-template").html()),

  events: {
    "click .edit-song": "_onEdit",
    "click .save-song": "_onSave",
    "click .cancel-edit": "_onCancel",
    "keypress .search-input": "_onKeyPress",
    "click .remove-song": "_onRemove",
  },

  initialize: function() {
    this.listenTo(this.model, "change", this.render);
    this.listenTo(this.model, 'destroy', this.remove);
    this.listenTo(this.model, 'all', function(e){ console.log('song', e); });
  },

  render: function() {
    this.$el.html(this.template(this.model.attributes));
    this.setEditMode(this.model.get('unsaved') === true);
    return this;
  },

  setEditMode: function(value) {
    if (value) {
      this.$el.find(".search-input").val(this.model.get('search'));
      this.$el.addClass("editing");
      this.$el.find(".search-input").focus();
    } else {
      this.$el.removeClass("editing");
    }
  },

  _onEdit: function() {
    this.setEditMode(true);
  },

  _onSave: function() {
    this.model.set({search: this.$el.find(".search-input").val() });
    this.setEditMode(false);
  },

  _onCancel: function() {
    this.setEditMode(false);
  },

  _onRemove: function() {
    this.model.destroy();
  },

  _onKeyPress: function(e) {
    if (e.which === 13) {
      e.preventDefault();
      this._onSave();
    }
  },

});


mixtape.AppView = Backbone.View.extend({
  el: $(".mixtape-app"),

  events: {
    "click .add-new-song": "onAddNewSong",
  },

  initialize: function(songList) {
    this.songList = songList;
    this.listenTo(songList, 'update', this.reorder);
    this.listenTo(songList, 'all', function(e){ console.log('song list', e); });
    this.addAllSongViews();
  },

  addAllSongViews: function() {
    this.songList.each(this.addSongView, this);
  },

  addSongView: function(song) {
    var view = new SongView({model: song});
    this.$(".song-list").append(view.render().el);
  },

  render: function() {
    console.log('app render');
  },

  reorder: function() {
    console.log('app reorder');
    this.$('.song-list').empty(); // empty and re-create is the easiest way
    this.addAllSongViews();
  },

  onAddNewSong: function() {
    this.songList.unshift({ unsaved: true });
  }

});


$(document).ready(function(){
  mixtape.songList = new mixtape.SongList([{search: "BMO Remix"}, {search: "Jay Z On To The Next One"}]);
  mixtape.appView = new mixtape.AppView(songList);
});

