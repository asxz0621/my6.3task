const express = require('express')
const bodyParser = require('body-parser')
const mongoose = require('mongoose')
const User = require('./models/User')
const User_google = require('./models/User_google')
const validator = require('validator')
const alert = require('alert')
const path = require('path')
const https = require('https')
const bcrypt = require('bcrypt')
const SendCloud = require('sendcloud')
const passport = require('passport')
const session = require('express-session')
const cookieSession = require("cookie-session")
var GoogleStrategy = require('passport-google-oauth').OAuth2Strategy
const keys = require('./config/keys')
const saltRounds = 10;

const app = express()
app.use(bodyParser.urlencoded({extended:true}))
app.use(express.static('public'))
app.use(cookieSession({
    maxAge: 24 * 60 * 60 * 1000,
    keys: [keys.session.cookieKey]
}))
app.use(passport.initialize())
app.use(passport.session())

//sendCloud
var sc = new SendCloud(keys.sendCloud.apiUser, keys.sendCloud.apiKey, 'shixiaoz', 'iCrowd Tech')

//connect a Mongo database
mongoose.connect("mongodb+srv://shixiaoz:505223306@cluster0.p7xc5.mongodb.net/iCrowdTask63D?retryWrites=true&w=majority", {useNewUrlParser: true})

//passport Google
passport.use(
    new GoogleStrategy(
        {
            clientID: keys.google.clientID,
            clientSecret: keys.google.clientSecret,
            callbackURL: "/auth/google/callback",
            proxy: true
        },
        (accessToken, refreshToken, profile, done) => {
            User_google.findOne({ googleId: profile.id }, (err, currentUser) => {
                if (currentUser) {
                    done(null, currentUser);
                } else {
                    new User_google({
                        googleId: profile.id,
                    }).save().then((newUserGoogle) => {
                        done(null, newUserGoogle);
                    });
                }
            })
        }
    )
);
passport.serializeUser((user_google, done) => {
    done(null, user_google.id)
})
passport.deserializeUser((id, done) => {
    User_google.findById(id).then(user_google => {
        done(null, user_google)
    })
})

//Google Sign In Route
app.get("/auth/google", passport.authenticate("google", {
    scope: ["profile", "email"]
}))

app.get('/auth/google/callback', 
  passport.authenticate('google', { failureRedirect: '/login' }),
  function(req, res) {
    res.redirect('/reqtask');
});

app.get('/', (req, res)=>{
    res.sendFile(path.join(__dirname, "public/login.html"));
})

//register get
app.get('/register', (req, res)=>{
    res.sendFile(path.join(__dirname, "public/registration.html"));
})

//login get
app.get("/login", (req, res)=>{
    res.sendFile(path.join(__dirname, "public/login.html"));
})

//reqtask get
app.get('/reqtask', (req, res) => {
    res.sendFile(path.join(__dirname, "public/reqtask.html"))
})

//success get
app.get("/success", (req, res) => {
    res.sendFile(path.join(__dirname, "public/success.html"));
  });

//login post
app.post('/login', (req, res)=>{
    const email = req.body.email
    const password = req.body.password
    User.findOne({email: email}, function(err, doc){
        if(doc){
            const result = bcrypt.compareSync(password, doc.password)
            if(result){
                res.redirect("/reqtask")
            }
            else{
                alert("Wrong password!")
                // res.send("Wrong password!")
            }
        }
        else{
            alert("Invalid email address!")
            // res.send("Invalid email address!")
        }
    })

})

//Register post
app.post('/register', (req, res)=>{

    const body = req.body;
    const userInfo = {country, firstName, lastName, email, password, confirmPassword, address1, address2, city, state, zip, phoneNumber} = body;

    const salt = bcrypt.genSaltSync(saltRounds)
    const hash = bcrypt.hashSync(body.password, salt)
    body.password = hash
    body.confirmPassword = body.password

    const user = new User(userInfo)

    //Determine whether the mailbox has been registered
    User.findOne({email: email}, function(err, doc){
        if(doc){
            alert("This email address has already been registered! Please change another email address!")
            // res.send("This email address has already been registered! Please change another email address!")
        }
        else{
            user.save(function(error){
                if(error){
                    // res.send("Error!")
                    console.log("Error!")
                }
                else{
                    // res.redirect("/login")
                    res.redirect("/success")
                }
            })
        }
    })

    //Send Email
    const data = {
        members:[{
            email_address: email,
            status: "subscribed",
            merge_fields:{
                // FNAME and LNAME are named on the mailchimp website
                FNAME: firstName,
                LNAME: lastName
            }
        }]
    }

    // mailchimp only accessible json
    // define json
    // convert "data" to json
    // create the json "data"
    jsonData = JSON.stringify(data)

    const url = keys.mailchimp.url
    const options = keys.mailchimp.options

    const request = https.request(url, options, (response)=>{
        response.on("data", (data)=>{
            console.log(JSON.parse(data))
        })
    })
    
    request.write(jsonData)
    request.end()

    console.log(firstName, lastName, email)

    // user.save(function(error){
    //     if(error){
    //         // res.send("Error!")
    //         console.log("Error!")
    //     }
    //     else{
    //         res.redirect("/success")
    //     }
    // })
    
})

//Forget get
app.get('/forgot', (req, res) => {
    res.sendFile(path.join(__dirname, "public/forgot.html"))
})

//Forget post
app.post('/forgot_handler', async (req, res) => {
    const email = req.body.email
    if (email) {
        let url = "http://localhost:5000/reset/" + email;
        sc.send(email, 'iCrowd Password Reset', '<h1><a href="' + url + '">Click here to reset password</a></h1>').then((info) => {
            if (info.message == 'success') {
                res.redirect('/')
            } else {
                res.send(info)
            }
        })
    } else {
        res.send("please enter your email!")
    }
})

//Reset get
app.get('/reset/:email', (req, res) => {
    res.sendFile(path.join(__dirname, "public/reset.html"))
})

app.post('/reset/:email', async (req, res) => {
    const salt = await bcrypt.genSalt(saltRounds)
    const hash = await bcrypt.hash(req.body.password, salt)
    const confirmHash = await bcrypt.hash(req.body.confirmPassword, salt)
    if (hash == confirmHash) {
        User.updateOne(
            { email: req.body.email },
            {
                password: hash,
                confirmPassword: confirmHash
            },
            (err) => {
                if (!err) {
                    res.sendFile(path.join(__dirname, "public/resetsucc.html"));
                    // res.send('Successfully reset!')
                }
                else {
                    res.send(err)
                }
            }
        )
    } else {
        res.send("Password and Confirm Password are different!")
    }
})

//Port
let port = process.env.PORT;
if (port == null || port == "") {
    port = 5000;
}
var server = app.listen(port, function () {
    console.log("server is running on http://localhost:" + port)
})
