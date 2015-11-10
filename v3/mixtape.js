var mixtape = mixtape || {};


mixtape.Song = Backbone.Model.extend({
  defaults: {
    search: ""
  }
});


mixtape.SongList = Backbone.Collection.extend({
  model: mixtape.Song,
});


mixtape.SongView = Backbone.View.extend({
  className: "song",

  template: _.template($("#song-template").html()),

  events: {
    "click .edit-song": "_onEdit",
    "click .save-song": "_onSave",
    "click .cancel-edit": "_onCancel",
    "keypress .search-input": "_onKeyPressInSearch",
    "click .remove-song": "_onRemove",
    "click .search": "_onView",
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

      if (this.model.get('search').length === 0) {
        this.model.destroy();
      }
    }
  },

  _onView: function() {
    mixtape.router.navigate('/songs/' + this.model.cid, true);
  },

  _onEdit: function() {
    this.setEditMode(true);
  },

  _onSave: function() {
    var val = this.$el.find(".search-input").val();
    this.model.set({search: val});
    this.setEditMode(false);
  },

  _onCancel: function() {
    this.setEditMode(false);
  },

  _onRemove: function() {
    this.model.destroy();
  },

  _onKeyPressInSearch: function(e) {
    if (e.which === 13) {
      e.preventDefault();
      this._onSave();
    }
  },

  _onKeyPress: function(e) {
    console.log('hi');
  },
});


mixtape.SongDetailView = Backbone.View.extend({
  template: _.template($("#song-detail-template").html()),

  el: $(".song-detail"),

  render: function() {
    this.$el.html(this.template(this.model.attributes));
  },
});


mixtape.AppView = Backbone.View.extend({
  el: $(".mixtape"),

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
    var view = new mixtape.SongView({model: song});
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


mixtape.Router = Backbone.Router.extend({
  routes: {
    "help": "help",
    "songs/:id": "songShow",
    "*other": "mixtape",
  },

  songShow: function(id) {
    var song = mixtape.songList.get(id);
    console.log('songShow');
    var view = new mixtape.SongDetailView({model: song});
    view.render();
    this.showPage('detail');
  },

  help: function() {
    console.log('help');
    this.showPage('help');
  },

  mixtape: function() {
    console.log('mixtape');
    this.showPage('list');
  },

  showPage: function(pageClass) {
    $('.page:not(.' + pageClass+ ')').hide();
    $('.page.' + pageClass).show();
  }

});


$(document).ready(function(){
  mixtape.router = new mixtape.Router();
  mixtape.songList = new mixtape.SongList([{search: "BMO Remix"}, {search: "Jay Z On To The Next One"}]);
  mixtape.appView = new mixtape.AppView(mixtape.songList);

  $('body').on("keypress", function(e){
    console.log(e.which);
    if (e.which === 63) { // ?
      mixtape.router.navigate('help', true);
    } else if (e.which === 43) { // +
      mixtape.songList.unshift({ unsaved: true });
    }
  });

  Backbone.history.start();
});
