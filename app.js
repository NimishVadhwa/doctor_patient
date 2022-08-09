const express = require('express');
const app = express();
const db = require('./src/database');
require('dotenv').config()
const port = process.env.PORT || 7100;
const cors = require('cors');
const route = require('./src/routes');
const chat = require('./src/models/ChatModel');
const room = require('./src/models/RoomModel');
const { Op } = require("sequelize");

app.use(express.json());
app.use(cors());


app.use('/api/', route);

app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'OPTIONS,GET,POST');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Accept');
    next();
})

app.use("/assets", express.static("assets"));

//error handling
app.use((err, req, res, next) => {
    res.status(err.status || 500).json({ status: false, message: err.message });
});


db
    .sync()
    .then((result) => {
        const server = app.listen(port);
        const io = require('socket.io')(server, { 
            cors: {
                origin: "*",
                methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
            } 
            
        });
        
        
        io.on('connection',(socket) => {
            console.log('socket id=======',socket.id);
            
            
            socket.on('join-chat',async(data)=>{
               
               console.log('join chat===',data);
               
                socket.join(data.room_name);
                
                await chat.update({
                    status : "read"
                },{
                    where:{ room_id : data.room_id }
                })
                
                console.log('Room joined == ', socket.rooms);
                
                const clients = io.sockets.adapter.rooms.get(data.room_name);
                
                console.log(data.room_name+' room======>',clients)
                
            });
            
            
            socket.on('send_chat',async(data)=>{
                console.log('send====',data);
                
                let dta = await chat.create({
                    message : data.message,
                    file_type : data.file_type,
                    room_name : data.room_name,
                    room_id : data.room_id,
                    status : "unread",
                    sender_id : data.sender_id,
                    receiver_id : data.receiver_id
                });
                
                socket.broadcast.to(data.room_name).emit('receive_chat',dta);
            })
            
            
            socket.on('disconnects',async(data)=>{
               
                // socket.disconnect(data.room_name);
                socket.leave(data.room_name);
                
                console.log('disconnet==',socket.id);
                
                console.log('ALl rooms======',    socket.rooms);
            });

            
            //   console.log('ALl rooms======',    io.sockets.adapter.rooms);
              
              console.log('ALl rooms======',    socket.rooms);

        });

        
        console.log('Db connected===', port);
    }).catch((err) => {
        console.log('db not connected');
        console.log(err);
    });

