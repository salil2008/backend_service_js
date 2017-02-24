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
  },

  newHash : function(req, res) {
    console.log("Inside Service");
    controller.generic.setHash(req.params.hashtag, function(status) {
      console.log("Hash Changed")
    });
  },

  list : function(req, res){
    console.log("Inside list movie");
    controller.generic.listMovie(req, function(err, result){
      if(err) {
        res.send({
          'statusCode' : 401,
          'statusMessage' : "Couldn't Fetch!"
        })
      } else if(result){
        res.send({
          'statusCode' : 200,
          'statusMessage' : "Successfully Fetched!",
          'meta' : result
        })
      }
    })
  },

  fetchActors : function(req, res){
    console.log("Inside list movie");
    controller.generic.fetchActors(req, function(err, result){
      if(err) {
        res.send({
          'statusCode' : 401,
          'statusMessage' : "Couldn't Fetch!"
        })
      } else if(result){
        res.send({
          'statusCode' : 200,
          'statusMessage' : "Successfully Fetched!",
          'meta' : result
        })
      }
    })
  },

  fetchProducers : function(req, res){
    console.log("Inside list movie");
    controller.generic.fetchProducers(req, function(err, result){
      if(err) {
        res.send({
          'statusCode' : 401,
          'statusMessage' : "Couldn't Fetch!"
        })
      } else if(result){
        res.send({
          'statusCode' : 200,
          'statusMessage' : "Successfully Fetched!",
          'meta' : result
        })
      }
    })
  },

  createActor : function(req, res){
    console.log("Inside list movie");
    controller.generic.createActor(req, function(err, result){
      if(err) {

        if(err == 'already_present') {
          res.send({
            'statusCode' : 401,
            'statusMessage' : "Actor already present"
          })
        } else {
          res.send({
            'statusCode' : 401,
            'statusMessage' : "Couldn't create!"
          })
        }

      } else if(result){
        res.send({
          'statusCode' : 200,
          'statusMessage' : "Successfully Created!"
        })
      }
    })
  },

  createProducer : function(req, res){
    console.log("Inside list movie");
    controller.generic.createProducer(req, function(err, result){
      if(err) {

        if(err == 'already_present') {
          res.send({
            'statusCode' : 401,
            'statusMessage' : "Producer already present"
          })
        } else {
          res.send({
            'statusCode' : 401,
            'statusMessage' : "Couldn't create!"
          })
        }

      } else if(result){
        res.send({
          'statusCode' : 200,
          'statusMessage' : "Successfully Created!"
        })
      }
    })
  },

  createMovie : function(req, res){
    console.log("Inside list movie");
    controller.generic.createMovie(req, function(err, result){
      if(err) {

        if(err == 'already_present') {
          res.send({
            'statusCode' : 401,
            'statusMessage' : "Producer already present"
          })
        } else {
          res.send({
            'statusCode' : 401,
            'statusMessage' : "Couldn't create!"
          })
        }

      } else if(result){
        res.send({
          'statusCode' : 200,
          'statusMessage' : "Successfully Created!"
        })
      }
    })
  }

}
