const { log } = require("console");
const { createServer } = require("http");
const { Server } = require("socket.io");

const httpServer = createServer();
const io = new Server(httpServer, {
  cors: "http://localhost:5174/",
});

//allUsers object
const allUsers = {};
const allRooms = [];

io.on("connection", (socket) => {

  allUsers[socket.id] = {
    socket: socket,
    online: true,
  };

  socket.on("request_to_play", (data) => {
    const currentUser = allUsers[socket.id];
    currentUser.playerName = data.playerName;

    let opponentPlayer;

    for (const key in allUsers) {
      const user = allUsers[key];
      if (user.online && !user.playing && socket.id !== key) {
        opponentPlayer = user;
        break;
      }
    }

    if (opponentPlayer) {
      allRooms.push({
        player1:opponentPlayer,
        player2:currentUser
      })
      opponentPlayer.socket.emit("Opponent Found",{
         OpponentName: currentUser.playerName,
         playingAs: "circle",
      })
      currentUser.socket.emit("Opponent Found",{
        OpponentName: opponentPlayer.playerName,
        playingAs: "cross",
     })

    currentUser.socket.on("playerMoveFromClient",(data)=>{
      opponentPlayer.socket.emit("playerMoveFromServer",{
        ...data,
      })
    })

    opponentPlayer.socket.on("playerMoveFromClient",(data)=>{
      currentUser.socket.emit("playerMoveFromServer",{
        ...data,
      })
    })

    } else {
      currentUser.socket.emit("Opponent Not Found");
    }
  });

  socket.on("disconnect", function () {
    const currentUser = allUsers[socket.id];
    currentUser.online = false;
    currentUser.playing = false;

    for (let index = 0; index < allRooms.length; index++) {
      const {player1,player2}= allRooms[index];
      if(player1.socket.id===socket.id){
         player2.socket.emit("opponentLeftMatch")
         break;
      }
      if(player2.socket.id===socket.id){
        player1.socket.emit("opponentLeftMatch")
        break;
      }
    }
  });

});

//publisher -> action
//listener -> react

httpServer.listen(3000);