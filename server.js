import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';

const app = express();
const port = process.env.PORT || 8000;
const server = http.createServer(app);

const hostName = 'https://tracersystem50.great-site.net';

// Use CORS middleware
app.use(cors({
    origin: hostName, // Replace with your front-end URL
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Accept', 'X-Fetch-Request', "X-CSRF-TOKEN"],
    credentials:true
}));

// app.options('/**', cors());
const io = new Server(server, {
    cors: {
        origin: hostName, // Replace with your front-end URL
        methods: ['GET', 'POST'],
        allowedHeaders: ['Content-Type', 'Accept', 'X-Fetch-Request', "X-CSRF-TOKEN"],
        credentials:true
    }
});

const socketHolder = new Map(
    // id(int): objData{
    //  socketId: id
    //  firstName: User First Name,
    //  middleName: User Middle Name,
    //  lastName: User Last Name
    // fullName: User's full name
    //  }
);

io.on('connection', (socket) => {

    socket.on('register', data => {
        data.socketId = socket.id;
        console.log("REGISTED: ", data);
        socketHolder.set(data.id, data);
    });

    socket.on('messageDelivered', data => {
        for(const [key, value] of Object.entries(data)){
            if(socketHolder.has(parseInt(value.to, 10))){
                io.to(socketHolder.get(parseInt(value.to, 10)).socketId).emit('messageDelivered', value);
            }
        }
    });
    socket.on('messageSeen', data => {
        if(socketHolder.has(parseInt(data.to, 10))){
            io.to(socketHolder.get(parseInt(data.to, 10)).socketId).emit('messageSeen', data);
        }
    });

    socket.on('messageSend', data => {
        if(socketHolder.has(parseInt(data.to, 10))){
            io.to(socketHolder.get(parseInt(data.to, 10)).socketId).emit('messageSend', data);
        }
    });

    // Emit the seen status
    socket.on('messageSeenStatus', data => {
        if(socketHolder.has(parseInt(data.to, 10))){
            io.to(socketHolder.get(parseInt(data.to, 10)).socketId).emit('messageSeenStatus', data);
        }
    });

    // Emit delivered status
    socket.on('messageDeliveredStatus', data => {
  
        for(const [_, value] of Object.entries(data)){
            if(socketHolder.has(parseInt(value.to, 10))){
                io.to(socketHolder.get(parseInt(value.to, 10)).socketId).emit('messageDeliveredStatus', value);
            }
        }
    });
    socket.on('adminMessage', data => {
        for(const id of data.ids){
            if(socketHolder.has(parseInt(id, 10))){
                console.log(socketHolder.get(parseInt(id, 10)).firstName);
                io.to(socketHolder.get(parseInt(id, 10)).socketId).emit('adminMessage', data.message);
            }
        }
    })

});

server.listen(port, () => {
    console.log(`Socket.io server running on port ${port}`);
});
