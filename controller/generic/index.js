// var knex = require('knex')({
// 	client: 'pg',
// 	connection: {
// 	    host     : 'ec2-54-163-224-108.compute-1.amazonaws.com',
// 			port: 5432,
//         user     : 'klgevxyemxznyx',
//         password : '934d15e1669c7413669ae386f7f0517972eadb40995a6dff358922291246793b',
//         database : 'de8rgh8tv2v743',
// 				ssl : true
// 	}
// });
//Using postgress as mysql instance is down!!!
var twitter = require('twitter');
var config = require('../../config');
var twit = new twitter(config.twitter);
var async = require('async');
var _ = require('underscore');
var sockets = require('../../socketEvents');
var io;
console.log(sockets);
console.log('DB Connection Established');

var knex = require('knex')({
	client: 'mysql',
	connection: {
	    host     : 'localhost',
        user     : 'root',
        password : 'root',
        database : 'deltax_task2'
	}
});

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

			knex.select('hashtag').from('NewTable').orderBy('id','desc')
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
		knex.insert(contanier).into('NewTable')
		.then(function(result){
			self.restartStream('change_hash')
		})

	},

	listMovie : function(req, callback) {
		console.log("here");
		var main_json = []
		var movie_container = {}
		var actor_container;

		async.waterfall([
			function(callback){
				knex.select([
					'm.name as movie_name',
					'm.*',
					'p.name as producer_name',
					'p.*',
					'pm.movie_id'
				]).from('movie as m')
				.innerJoin('producer_movie as pm','pm.movie_id','m.id')
				.innerJoin('producer as p','pm.producer_id','p.id')
				.then(function(result){
					if(result && result.length > 0) {
						//console.log(result);
						callback(null, result)
					} else {
						callback('no_movie',null)
					}
				})
			},
			function(m_data, callback){
				var movie_ids = _.pluck(m_data,'movie_id')
				console.log(movie_ids);
				knex.select('*').from('actor as a')
				.innerJoin('actor_movie as am','am.actor_id','a.id')
				.whereIn('am.movie_id',movie_ids)
				.then(function(actor_list){

					_.each(m_data,function(movie){
						actor_container = []
						movie.actors = _.where(actor_list,{movie_id : movie.movie_id})
						//console.log(movie);
						main_json.push(movie)
					})
					//console.log(main_json);

					callback(null,main_json)
				})
			}
		],function(err, data){
			if(err){
				callback(err,null)
			} else {
				callback(null,main_json)
			}
		})
	},

	fetchActors : function(req, callback){

		knex.select('*').from('actor')
		.then(function(result){
			if(result && result.length > 0) {
				callback(null, result)
			} else {
				callback('no_actors', null)
			}
		})
	},

	fetchProducers : function(req, callback){

		knex.select('*').from('producer')
		.then(function(result){
			if(result && result.length > 0) {
				callback(null, result)
			} else {
				callback('no_producers', null)
			}
		})
	},

	createActor : function(req, callback){
		console.log(req.body);
		var request_data = req.body

			knex.insert(request_data).into('actor')
			.then(function(res){
				callback(null,res)
			})
	},

	createProducer : function(req, callback){
		console.log(req.body);
		var request_data = req.body

			knex.insert(request_data).into('producer')
			.then(function(res){
				callback(null,res)
			})
	},

	createMovie : function(req, callback) {
		var request_data = req.body
		var actor_ids = request_data.actor_ids
		var producer_id = request_data.producer_id

		delete request_data.actor_ids
		delete request_data.producer_id

		var movie_meta = request_data

		async.waterfall([
			function(callback) {
				knex.insert(request_data).into('movie')
				.returning('id')
				.then(function(res) {
					if(res && res.length > 0) {
						console.log(res)
						callback(null, res[0])
					} else {
						callback('error',null)
					}
				})
			},

			function(id, callback){
				var actor_set = []
				var producer_set = {}

				_.each(actor_ids, function(act_id){
					actor_set.push({actor_id : act_id, movie_id : id})
				})

				producer_set.producer_id = producer_id
				producer_set.movie_id = id

				knex.transaction(function(trx) {
				  return trx.insert(actor_set)
					.into('actor_movie')
				    .then(function(resp) {
				      var id = resp[0];
							return trx.insert(producer_set)
							.into('producer_movie');
				    });
				})
				.then(function(resp) {
				  console.log('Transaction complete.');
					callback(null,'success')
				})
				.catch(function(err) {
				  console.error(err);
					callback(err,null)
				});
			}
		],function(err, result){
			if(err) {
				callback(err, null)
			} else {
				callback(null, result)
			}
		})
	}

}
