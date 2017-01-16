var knex = require('knex')({
	client: 'pg',
	connection: {
	    host     : 'ec2-54-163-224-108.compute-1.amazonaws.com',
			port: 5432,
        user     : 'klgevxyemxznyx',
        password : '934d15e1669c7413669ae386f7f0517972eadb40995a6dff358922291246793b',
        database : 'de8rgh8tv2v743',
				ssl : true
	}
});
//Using postgress as mysql instance is down!!!
var twitter = require('twitter');
var config = require('../../config');
var twit = new twitter(config.twitter);
var sockets = require('../../socketEvents');
var io;
console.log(sockets);
console.log('DB Connection Established');

// var knex = require('knex')({
// 	client: 'mysql',
// 	connection: {
// 	    host     : 'localhost',
//         user     : 'root',
//         password : 'root',
//         database : 'tweetapp'
// 	}
// });

var self = module.exports = {
  //Methods Here
	sockets : function(server){
		io = require('socket.io').listen(server);
	},

  getPosts : function(page, skip, callback) {
    console.log("Inside Main Method");

		var tweets = []

      start = (page * 10) + (skip * 1)

      knex.select('*').from('tweets').limit(10).offset(start)
      .then(function(result){
        if(result && result.length > 0) {
          tweets = result
          tweets.forEach(function(tweet){
                  tweet.active = true;
                });

          callback(tweets);
        } else {
          callback('no_tweets', null)
        }
      })
  },

	saveStream : function(stream, io){

		//console.log(io);
		stream.on('data', function(data) {

	    if (data['user'] !== undefined) {


	      var tweet = {
	        twid: data['id_str'],
	        active: false,
	        author: data['user']['name'],
	        avatar: data['user']['profile_image_url'],
	        body: data['text'],
	        date: data['created_at'],
	        screenname: data['user']['screen_name']
	      };

	      var query = knex.insert(tweet).into('tweets')

	      query.asCallback(function(err,result){
	        if(err){
	          console.log(err);
	        } else if(result){
	          console.log("Inserted");
	          io.emit('tweet',tweet)
	        }
	      })

	    }

	  });

	},

	restartStream : function(route) {
		console.log("restarting stream");
		if(route = 'change_hash') {

			knex.select('hashtag').from('newtable').orderBy('id','desc')
			.limit(1)
			.then(function(data){
				console.log(data)
				twit.stream('statuses/filter',{ track: data[0].hashtag}, function(stream){
				  self.saveStream(stream,io);
				});
			})

		}
	},

	setHash : function(hash, callback) {
		console.log("setting hash");
		console.log(hash);
		var contanier = {
			hashtag : hash
		}
		knex.insert(contanier).into('newtable')
		.then(function(result){
			self.restartStream('change_hash')
		})

	}

}
