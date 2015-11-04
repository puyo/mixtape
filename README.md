# mixtape

Practice Backbone App

Setting up:

    brew install npm
    npm install
    open v1/index.html

## Version 1

A single song, you can edit it

## Version 2

Add collection, adding/removing songs


## Version 3

Keyboard shortcuts and a reference page for them using BB router


## Version 4

Replace search phrases with soundcloud embeds

    <script src="https://connect.soundcloud.com/sdk/sdk-3.0.0.js"></script>

    // sound cloud API
    SC.initialize({
      client_id: 'YOUR_CLIENT_ID'
    });

    // find all sounds of buskers licensed under 'creative commons share alike'
    SC.get('/tracks', {
      q: 'buskers', license: 'cc-by-sa'
    }).then(function(tracks) {
      console.log(tracks);
    });

    // put an embed in, given a track url
    var track_url = 'http://soundcloud.com/forss/flickermood';
    SC.oEmbed(track_url, { auto_play: true }).then(function(oEmbed) {
      console.log('oEmbed response: ', oEmbed);
      $('.mixtape-app').html(oEmbed.html);
