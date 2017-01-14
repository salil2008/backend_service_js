var knex = require('knex')({
	client: 'mysql',
	connection: {
	    host     : '85.10.205.173',
			port: 3306,
        user     : 'salil2008',
        password : '12345678',
        database : 'tweetapp'
	}
});

// var knex = require('knex')({
// 	client: 'mysql',
// 	connection: {
// 	    host     : 'localhost',
//         user     : 'root',
//         password : 'root',
//         database : 'tweetapp'
// 	}
// });

console.log('DB Connection Established');

var self = module.exports = {
  //Methods Here

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

	}

}
