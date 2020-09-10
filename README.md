## Live chat app using `Node.js` and `Socket.io`

`server (emit)` -> client (receive) - `countUpdated` event
`client (emit)` -> server (receive) - `increment` event

`socket` is an object that contains information about the connection

`socket.emit()` will send a message to current connection
`socket.broadcast.emit()` will send a message to all connections except current one
`io.emit()` will send a message to all connections
