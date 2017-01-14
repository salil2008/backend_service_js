
var React = require('react');
var Tweet = require('./tweet-container.react.js');

module.exports = Tweets = React.createClass({

  render: function(){

    var content = this.props.tweets.map(function(tweet){
      return (
        <Tweet key={tweet._id} tweet={tweet} />
      )
    });

    return (
      <ul className="tweets">{content}</ul>
    )

  }

});
