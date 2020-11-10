var express= require("express");
var ejs = require("ejs");
var cookieParser = require("cookie-parser");
var session = require("express-session");
var fileUpload = require("express-fileupload");

var app = express();

const mysql = require("mysql2");
let conn_info = {
    host : 'localhost',
    port : 3320,
    user : 'root',
    password : '1234',
    database : 'chatdb'
};

app.use(fileUpload({
    createParentPath : true
}));

app.set("views", __dirname+"/view");
app.set("view engine", "ejs");
app.engine("ejs",ejs.renderFile);

app.use(cookieParser());
app.use(express.static(__dirname+'/public'));
app.use(express.json());
app.use(session({
    secret : 'abcde',
    resave : false,
    saveUninitialized :true
}));

var router1 = require("./router/router")(app);

var server = require("http").createServer(app);
var io = require("socket.io")(server);

io.on("connection", function(socket){
    socket.on('login', function(data){
        console.log("접속함"+data.name +" , " + data.user_id);

        socket.name = data.name;
        socket.user_id = data.user_id;

        io.emit('login', data.name);
    });

    socket.on("chat",function(data){
        console.log("보낸메세지 %s : %s", socket.name, data.msg);
        var msg = {
            from: {
                name : socket.name,
                user_id : socket.user_id
            },
            msg: data.msg
        };
        io.emit('chat', msg);
    });



    socket.on('disconnect', function() {
        console.log('user disconnected: ' + socket.name);
    })
})

var chat = io.of('/chat').on('connection', function(socket){
    socket.on('login', function(data){
        console.log("접속함"+data.name +" , " + data.user_id);

        socket.name = data.name;
        socket.user_id = data.user_id;

        chat.emit('login', data.name);
    });
    socket.on('chat message', function(data){
        console.log(data)
        var name = socket.name = data.name;
        var room = socket.room = data.room;
        socket.join(room);
        console.log(io.of('/chat').adapter.rooms)
        var send_data = {
            name : name,
            msg : data.msg
        }
        console.log(data.msg)
        chat.to(room).emit('chat message', send_data);
    })
})

server.listen(2000,function(){
    console.log("using 2000");
});
