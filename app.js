var React = require('react');
var TweetsApp = require('./components/tweet-app-main.react');

var startState = JSON.parse(document.getElementById('start_state').innerHTML)

React.render(
  <TweetsApp tweets={startState}/>,
  document.getElementById('my_app')
);
