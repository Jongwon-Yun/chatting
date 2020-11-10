var bodyParser = require("body-parser");
var parser = bodyParser.urlencoded({extended:false});
const { render } = require("ejs");
const mysql = require("mysql2");
let conn_info = {
    host : 'localhost',
    port : 3320,
    user : 'root',
    password : '1234',
    database : 'chatdb'
};

module.exports = function(app){
    app.get("/", function(req,res){
        res.render("login.ejs");
    })

    app.post("/main", parser, function(req,res){
        let conn = mysql.createConnection(conn_info);
        let sql = "select user_id, phone_number ,password, nic_name from user_info where user_id = ? and password = ?";
        let sql1 = "select name from user_info";
        conn.query(sql, [req.body.id, req.body.pw], (err,result)=>{
            if(result[0].user_id == req.body.id && result[0].password == req.body.pw){
                req.session.data1 = req.body.id;
                req.session.data2 = result[0].nic_name;
                req.session.data3 = result[0].phone_number;
                conn.query(sql1,(err,result1)=>{
                    let render_data = {
                        user_id : req.body.id,
                        nic_name : result[0].nic_name,
                        user_list : result1
                    }
                    res.render("main.ejs",render_data);    
                })
                
            }else{
                res.redirect("/");
            }
        })
    })

    app.get("/main", function(req,res){
        let conn = mysql.createConnection(conn_info);
        let sql = "select room_title, room_composition from chat_room_list"
        let sql1 = "select name from user_info";
        conn.query(sql, (err,result)=>{
            conn.query(sql1, (err,result1)=>{
                let render_data = {
                    user_id : req.session.data1,
                    nic_name : req.session.data2,
                    room_list : result,
                    user_list : result1
                }
                res.render("main_1.ejs",render_data)
            })

        })
    })

    app.post("/chat", parser, function(req,res){
        let render_data = {
            nic_name : req.session.data2,
            room : req.body.room
        }
        res.render("chat.ejs",render_data)
    })

    app.post("/made_room", parser, function(req, res){
        let conn = mysql.createConnection(conn_info);
        let sql = "insert into chat_room_list (room_title, phone_number, room_composition, anonymous) values(?, ?, ?, ?)"
        conn.query(sql, [req.body.room_title, req.session.data3, req.body.chat_target, req.body.anony], (err)=>{
            console.log(err);
            res.redirect("/main");
        })
    })
}