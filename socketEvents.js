function sockets(server) {
  console.log("Hello");
  var io = require('socket.io').listen(server);
  //console.log(server);
}

module.exports = sockets;
