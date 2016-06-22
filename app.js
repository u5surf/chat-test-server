var http=require('http');
var sqlite=require('sqlite3').verbose();
var socket=require('socket.io');

var db=new sqlite.Database('db.sqlite');

var reader = require('readline').createInterface({
  input: process.stdin,
  output: process.stdout
});

var server=http.createServer(function(req,res){
    res.writeHead(200,{'Content-Type':'text/html'});
    res.end('connected');
});
var port=3000;
var io =socket.listen(server);
server.listen(port);

db.serialize(function(){
  //サーバ側からの入力
  io.sockets.on('connection',function(socket){
    reader.on('line', function(line) {
        console.log('>' + line);
        //db.run("INSERT INTO messages (content) VALUES (?)", line);
        socket.emit('recieved',line);
    });
  //クライアントに過去の会話を返す 
    socket.on('archive',function(){
      db.each("SELECT content FROM messages",function(err,row){
        if(!err){
          socket.emit('recieved',row.content);
        }
      });
    });
    //クライアントにデータを送信する
    socket.on('send',function(data){
      data="<a href='./schedule.html#2016-0601-15:00:00'>"+data+"</a>"
      console.log(data);
      db.run("INSERT INTO messages (content) VALUES (?)", data);
      socket.emit('recieved',data);
    });
  });
});

