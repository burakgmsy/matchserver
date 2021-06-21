var app = require('express')();
var server = require('http').Server(app);
var io = require('socket.io')(server);
const { v4: uuidv4 } = require('uuid');


app.get('/', (req, res) => {
    res.send("Node Server is running. Yayyy!!")
});
const matchQueue = [];

console.log("Match Queue Length: ", matchQueue.length.toString(), '\n');
io.of("matchmaking").on('connection', socket => {

    socket.on('test', function (msg) {
        console.log(msg);
    });
    socket.emit('test', "serverdan as");

    socket.on('findMatch', data => {

        //socket.emit('test', "test server msg");
        if (matchQueue.length === 0) {

            //data from client
            socket.uid = data.uid
            socket.name = data.name
            socket.image = data.image
            socket.exp = data.exp

            console.log(data);
            matchQueue.push(socket);

            console.log(socket.name, " added to matchQueue");

        } else {
            const player1 = matchQueue.shift();
            const matchID = uuidv4()
            console.log(matchID);

            const match = {
                matchID: matchID,

                player1: {
                    name: player1.name,
                    uid: player1.uid,
                    image: player1.image,
                    exp: player1.exp,
                },
                player2: {
                    name: data.name,
                    uid: data.uid,
                    image: data.image,
                    exp: data.exp,

                }
            }

            socket.to(player1.id).emit('matchFound', JSON.stringify())
            socket.emit('matchFound', JSON.stringify(match.matchID))

            console.log("Matched: ", player1.name, data.name,)
            console.log("Match Queue Length: ", matchQueue.length.toString(), '\n')
        }
        console.log("Match Queue Length: ", matchQueue.length.toString(), '\n');


    });
    socket.on('disconnect', _ => {
        if (matchQueue.length > 0) {
            const index = matchQueue.findIndex(e => e.id === socket.id)
            if (index !== -1)
                matchQueue.splice(index, 1)
            console.log(socket.name, ' left matchmaking')
            console.log("Match Queue Length: ", matchQueue.length.toString(), '\n')
        }
    });
});


io.of("match").on('connection', socket => {
    socket.join(socket.handshake.query.matchID);


})

var port = process.env.PORT;
server.listen(port);


