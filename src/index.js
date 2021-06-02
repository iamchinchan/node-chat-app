const  express = require("express");
const http = require("http");
const path = require("path");
const socketio = require("socket.io");
const Filter  = require("bad-words");
const {generateMessage,generateLocation} = require('./utils/messages');
const {addUser,removeUser,getUser,getUsersInRoom} = require('./utils/users');

const app=express();
const server = http.createServer(app);
const io = socketio(server); //given server by express., thats why refactored/  raw http server

const port = process.env.PORT||3000;

const publicDirectoryPath = path.join(__dirname,'../public');

app.use(express.static(publicDirectoryPath));


io.on('connection',(socket)=>{ //socket is an object containing info about newly created connection.
console.log("New websocket connection"); //load in client side of socket io library to print this

  

  socket.on('join',(options ,callback)=>{ // options={username,room} given from chat.html

    const {error,user} = addUser({id:socket.id,...options});

    if(error){
     return  callback(error);
    }

    socket.join(user.room); // only used on server


    socket.emit('message',generateMessage("Admin",'Welcome!!'));
    socket.broadcast.to(user.room).emit("message",generateMessage("Admin",`${user.username} has joined!`));

    io.to(user.room).emit('roomData',{
      room:user.room,
      users:getUsersInRoom(user.room),
    })
    callback();
  })

  socket.on('sendMessage',(message,callback)=>{

    const user = getUser(socket.id);
    if(user){
      const filter = new Filter();
      if(filter.isProfane(message)){
        return callback('profanity is not allowed!');
      }
  
      io.to(user.room).emit('message',generateMessage(user.username,message));
      callback();
    }
    
  })

  socket.on('sendLocation',(coords,callback)=>{

    const user = getUser(socket.id);
    if(user){
      io.to(user.room).emit('locationMessage',generateLocation(user.username,`https://google.com/maps?q=${coords.latitude},${coords.longitude}`));
      callback();
    }
  })

  socket.on('disconnect',()=>{
    const user = removeUser(socket.id);

    if(user){
    io.to(user.room).emit('message',generateMessage("Admin",`${user.username} has left!`));
    io.to(user.room).emit('roomData',{
      room:user.room,
      users:getUsersInRoom(user.room),
    })
    }
    
  })
})
  


server.listen(port,()=>{
console.log(`server is up on port ${port}!`);
});