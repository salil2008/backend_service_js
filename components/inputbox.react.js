

var React = require('react');

module.exports = InputBox = React.createClass({
  render: function(){
    return (
      <div className = 'change_hash'>
        <input type = 'text' id = 'hash'/>
        <button type="button" onClick={this.props.onHashChange}>Fire!</button>
      </div>
    )
  }
});
