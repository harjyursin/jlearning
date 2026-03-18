const express  = require('express');
const server = express();
const layout = require('express-ejs-layouts');
require("dotenv").config()
const session = require('express-session');
const flash = require('connect-flash');
const bcrypt = require("bcrypt")
const upload = require('express-fileupload');
const { PrismaClient } = require("./generated/prisma")
const prisma = new PrismaClient();
require('dotenv').config();
const cloudinary = require('cloudinary').v2;

server.set('view engine','ejs');
server.set('views','views');

server.use(upload());
server.use(layout);
server.set('layout','layouts/main');

// statuc

server.use(express.static('public'));
server.use('/admin/courses',express.static('public'));
server.use('/admin/courses/exercice/',express.static('public'));
server.use('/admin/profile',express.static('public'));
server.use('/client/',express.static('public'));
server.use('/client/message',express.static('public'));
server.use('/client/cours',express.static('public'));
server.use('/admin/message',express.static('public'));
server.use(express.urlencoded({extended:true}));



server.use(session({
  secret:process.env.SECRET_KEY,
  resave:false,
  saveUninitialized:true
}))

server.use(flash());

server.use((req,res,next)=>{
  res.locals.success = req.flash('success');
  res.locals.error = req.flash('error');
  next();
});
server.use((req,res,next)=>{
  res.locals.user = req.session.user;

  next();
});

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});



// Route auth
server.use("/",require('./router/auth'))
// Route user
server.use("/client",require('./router/user'))
// Route admin
server.use("/admin",require('./router/admin'))





server.listen(process.env.PORT, ()=>{
    console.log("http://localhost:"+process.env.PORT);
})