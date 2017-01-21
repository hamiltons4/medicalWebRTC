

//Server.js:  This is the core Node.js configuration code, and also used for
//setting up signaling channels to be used by socket.io

var express = require('express.io');
var app = express();
app.http().io();
var PORT = 8080;
console.log('server started on port ' + PORT);

app.use(express.static(__dirname + '/public'));

app.get('/', function(req, res){
	res.render('index.ejs');
});

app.listen(process.env.PORT || PORT);

app.io.route('signal', function(req) {
    req.io.join(req.data)
    app.io.room(req.data).broadcast('signal', {
        user_type: req.data.user_type,
        user_name: req.data.user_name,
        user_data: req.data.user_data,
        command: req.data.command
    })
})