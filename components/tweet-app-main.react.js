
var React = require('react');
var Tweets = require('./tweet-map.react.js');
var Loader = require('./loader.react.js');
var InputBox = require('./inputbox.react.js');

module.exports = TweetsApp = React.createClass({

  addTweet: function(tweet){
    var updated = this.state.tweets;

    var count = this.state.count + 1;

    var skip = this.state.skip + 1;

    updated.unshift(tweet);

    //Setting tweets to active
    updated.forEach(function(tweet){
      tweet.active = true;
    });

    //Set application state with the latest tweets
    if(this.state.count > 5) {
      this.setState({tweets: updated, count: 0});
    }

  },

  getPage: function(page){
    var request = new XMLHttpRequest(), self = this;
    request.open('GET', 'page/' + page + "/" + this.state.skip, true);
    request.onload = function() {

      if (request.status >= 200 && request.status < 400){
        self.loadPagedTweets(JSON.parse(request.responseText));
      } else {
        self.setState({paging: false, done: true});
      }
    };
    request.send();
  },

  loadPagedTweets: function(tweets){
    console.log("loadPagedTweets");
    var self = this;

    if(tweets.length > 0) {

      var updated = this.state.tweets;


      tweets.forEach(function(tweet){
        updated.push(tweet);
      });

      setTimeout(function(){

        self.setState({tweets: updated, paging: false});

      }, 1000);

    } else {

      this.setState({done: true, paging: false});

    }
  },

  checkWindowScroll: function(){
    console.log("checkWindowScroll");
    var h = Math.max(document.documentElement.clientHeight, window.innerHeight || 0);
    var s = (document.body.scrollTop || document.documentElement.scrollTop || 0);
    var scrolled = (h + s) > document.body.offsetHeight;

    if(scrolled && !this.state.paging && !this.state.done) {

      this.setState({paging: true, page: this.state.page + 1});

      this.getPage(this.state.page);

    }
  },

  getInitialState: function(props){
    console.log("getInitialState");
    props = props || this.props;

    return {
      tweets: props.tweets,
      count: 0,
      page: 0,
      paging: false,
      skip: 0,
      done: false
    };

  },

  componentWillReceiveProps: function(newProps, oldProps){
    console.log("componentWillReceiveProps");
    this.setState(this.getInitialState(newProps));
  },

  componentDidMount: function(){
    console.log("componentDidMount");
    var self = this;

    var socket = io.connect();

    socket.on('tweet', function (data) {

        self.addTweet(data);

    });

    window.addEventListener('scroll', this.checkWindowScroll);

  },

  onHashChange : function () {
    console.log("Hitting onHashChange");
    var hashtag = document.getElementById('hash').value;

    var request = new XMLHttpRequest(), self = this;
    request.open('GET', 'newHash/' + hashtag, true);
    request.send();
  },

  render: function(){

    return (
      <div className="tweets-app">
        <InputBox onHashChange = {this.onHashChange}/>
        <Tweets tweets={this.state.tweets} />
        <Loader paging={this.state.paging}/>
      </div>
    )

  }

});
