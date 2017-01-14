var JSX = require('node-jsx').install(),
  React = require('react'),
  TweetsApp = React.createFactory(require('./components/tweet-app-main.react')),
  controller = require('./controller');

module.exports = {

  index: function(req, res) {
    controller.generic.getPosts(0,0, function(tweets, pages) {
      var markup = React.renderToString(
        TweetsApp({
          tweets: tweets
        })
      );

      res.render('home', {
        markup: markup,
        state: JSON.stringify(tweets)
      });

    });
  },

  page: function(req, res) {
    controller.generic.getPosts(req.params.page, req.params.skip, function(tweets) {
      res.send(tweets);
    });
  }

}
