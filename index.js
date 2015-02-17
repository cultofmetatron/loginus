var express = require('express');
var app     = express();
var path    = require('path');

app.set('view engine', 'jade');
app.set('views', [path.join(__dirname, 'views')]);

app.use('/static', express.static('./frontend'));


var loginApp = require('./apps/login');


app.use(loginApp);



app.get('/', function(req, res, next) {
  res.render('index', {
    
  });
});


var port = process.env.PORT || 3000;
console.log('now listening on port: ', port);
app.listen(port);





