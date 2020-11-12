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

    app.post("/main", parser, function(req,res){                                                                            //첫 로그인 시 
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

    app.get("/main", function(req,res){                                                                                             //세션이 유지되는 메인 페이지
        let conn = mysql.createConnection(conn_info);
        let sql = "select room_title, room_composition from chat_room_list where (room_composition like ?) or (phone_number = ?)"
        let sql1 = "select name from user_info";
        conn.query(sql, ['%'+req.session.data2+'%', req.session.data3], (err,result)=>{                                             //방 리스트를 방 참여자와 방 생성자에게 보여줌
            console.log(result)
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

    app.post("/chat", parser, function(req,res){                                                                                    //방 참여 페이지
        let render_data = {
            nic_name : req.session.data2,
            room : req.body.room
        }
        res.render("chat.ejs",render_data)
    })

    app.post("/made_room", parser, function(req, res){                                                                              //방 생성 페이지
        let conn = mysql.createConnection(conn_info);
        let sql = "insert into chat_room_list (room_title, phone_number, room_composition, anonymous) values(?, ?, ?, ?)"
        let sql1 = "CREATE TABLE `"+req.body.room_title+"` (`order` INT NOT NULL AUTO_INCREMENT, `nic_name` VARCHAR(45) NULL, `content` VARCHAR(500) NULL, PRIMARY KEY (`order`))"
        conn.query(sql, [req.body.room_title, req.session.data3, req.body.chat_target, req.body.anony], (err)=>{
            console.log(err);
            res.redirect("/main");
        })
        conn.query(sql1, (err)=>{
            console.log(err)
        })
    })
}