mixtape = this || {};

mixtape.Song = Backbone.Model.extend({
  defaults: {
    search: ""
  }
});

mixtape.SongView = Backbone.View.extend({
  className: "song",

  template: _.template($("#song-template").html()),

  events: {
    "click .edit-song": "_onEdit",
    "click .save-song": "_onSave",
    "click .cancel-edit": "_onCancel",
    "keypress .search-input": "_onKeyPress",
  },

  initialize: function() {
    this.listenTo(this.model, "change", this.render);
  },

  render: function() {
    this.$el.html(this.template(this.model.attributes));
    return this;
  },

  _onEdit: function() {
    this.$el.find(".search-input").val(this.model.get('search'));
    this.$el.addClass("editing");
    this.$el.find(".search-input").focus();
  },

  _onSave: function() {
    this.model.set({search: this.$el.find(".search-input").val() });
    this.$el.removeClass("editing");
  },

  _onCancel: function() {
    this.$el.removeClass("editing");
  },

  _onKeyPress: function(e) {
    if (e.which === 13) {
      e.preventDefault();
      this._onSave();
    }
  },

});

$(document).ready(function() {
  var song = new mixtape.Song({search: "BMO Remix"});
  var view = new mixtape.SongView({ model: song, el: $(".song").first() });
  view.render();
});
