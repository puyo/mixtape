mixtape = this || {};


mixtape.Song = Backbone.Model.extend({
  defaults: {
    search: "",
    embed: ""
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
    this.listenTo(this.model, "change:search", this.lookupEmbed);
    this.listenTo(this.model, 'destroy', this.remove);
    this.listenTo(this.model, 'all', function(e){ console.log('song', e); });
  },

  render: function() {
    console.log('render', this.model.cid);
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

  lookupEmbed: function() {
    var self = this;
    // find all sounds of buskers licensed under 'creative commons share alike'
    SC.get('/tracks', {
      q: this.model.get('search'), license: 'cc-by-sa'
    }).then(function(tracks) {
      if (tracks.length === 0) {
        this.model.set({'embed': "No song found"});
      } else {
        // put an embed in, given a track url
        var trackUrl = tracks[0].permalink_url;
        SC.oEmbed(trackUrl, { auto_play: false, maxheight: 166 }).then(function(oEmbed) {
          console.log("setting embed:", trackUrl);
          self.model.set({'embed': oEmbed.html});
        });
      }
    });
  },

  _onEdit: function() {
    this.setEditMode(true);
  },

  _onSave: function() {
    var val = this.$el.find(".search-input").val();
    this.model.set({search: val, embed: ""});
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
  // sound cloud API
  SC.initialize({
    client_id: 'YOUR_CLIENT_ID'
  });
  mixtape.songList = new mixtape.SongList([{search: "BMO Remix"}, {search: "Jay Z On To The Next One"}]);
  mixtape.appView = new mixtape.AppView(songList);
});

