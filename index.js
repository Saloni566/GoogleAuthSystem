const express = require('express')
const app = express()
const cors = require('cors')
const dotenv = require("dotenv");
const mongoose=require('mongoose')
const bodyParser = require('body-parser')
const passport = require('passport');
dotenv.config({ path: "./config/config.env" });
const connectDB = require("../Google_auth/config/db")
const path = require("path");
const cookieSession = require('cookie-session')
require('../Google_auth/passport-setup');
const {User}=require('../Google_auth/Models/Login_user')

app.use(cors())

app.use(bodyParser.urlencoded({ extended: false }))
 
app.use(bodyParser.json())
app.use(cookieSession({
    name: 'tuto-session',
    keys: ['key1', 'key2']
  }))

 connectDB();  

const isLoggedIn = (req, res, next) => {
    if (req.user) {
      console.log(req.user);
      const Signup= new User({
        email:req.user.emails[0].value, //Saving data in mongoose //
        name:req.user.displayName,
        id:req.user.id
       })
       Signup.save()
        next();
    } else {
        res.sendStatus(401);
    }
}

app.use(passport.initialize());
app.use(passport.session());

app.get('/signup', (req, res) => res.sendFile(path.join(__dirname+'/home.html')))  //Route for homepage//
app.get('/failed', (req, res) => res.send('You Failed to log in!'))

app.get('/profile', isLoggedIn, (req, res) => res.send(`Username: ${req.user.displayName}! with Email: ${req.user.emails[0].value}`)
)

// Auth Routes
app.get('/login/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

app.get('/google/callback', passport.authenticate('google', { failureRedirect: '/failed' }),
  async function(req, res) {
    const user=await User.findOne({       //checking User is in database or Not//
      name:req.user.displayName,
      id:req.user.id
  });
  if(user)return res.status(400).send("User Already Registered!!Please Login ")
     else res.redirect('/profile');
  }
);

app.get('/logout', (req, res) => {
    req.session = null;
    req.logout();
    res.redirect('/');
})

app.listen(3000, () => console.log(`Listening on port ${3000}!`))