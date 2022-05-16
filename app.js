var createError = require('http-errors');
var express = require('express');
var hbs = require('hbs');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const { allowInsecurePrototypeAccess } = require('@handlebars/allow-prototype-access');
var indexRouter = require('./routes/index');
var flash = require('connect-flash');
var mongoose = require('mongoose');
require('dotenv/config');
var session = require('express-session');
const{engine}=require("express-handlebars");
const Handlebars = require('handlebars');
var app = express();

mongoose.Promise = global.Promise;

mongoose.connect(process.env.DB_URL,{useNewUrlParser:true, useUnifiedTopology:true})
.then( ()=>{
  console.log('DB connect');

})
.catch((err)=>{
  console.log(err);
    return res.sendStatus(500);
});


app.engine('hbs',engine({defaultLayout:'layout',extname:'.hbs',layoutsDir:'views/layouts',partialsDir:'views/partials',handlebars: allowInsecurePrototypeAccess(Handlebars)}));



app.get('/users/login', (req, res) => {
  res.render('user/login', {layout: 'login'})
})

hbs.registerPartials(path.join(__dirname,'views/partials'),(err)=>{})

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', '.hbs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use(session({cookie:{maxAge:60000},secret:'secret',resave:false,saveUninitialized:false}));
app.get('/users/signup',function(req,res){
  
  res.render('user/signup', {layout: 'login'}) ;

});


app.use('/', indexRouter);
app.use('/users',require('./routes/users'));

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error',layout="error");
  
});



module.exports = app;


