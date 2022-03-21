//jshint esversion:6
require('dotenv').config();
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const $ = require('jquery');
const mongoose = require("mongoose");
const session = require('express-session');
const passport = require("passport");
const passportLocalMongoose = require("passport-local-mongoose");
const GoogleStrategy = require('passport-google-oauth20').Strategy;
// const LocalStrategy = require('passport-local').Strategy;
const findOrCreate = require('mongoose-findorcreate');

const app = express();
app.use(express.static("public"));
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended: true}));





app.use(session({
  secret: "Our litle secret",
  resave: false,
  saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());

mongoose.connect('mongodb://localhost:27017/cprojectDB');

const userSchema = new mongoose.Schema({
  email: String,
  password: String,
  status: {},
  userData: {
    nama: {},
    mykad: {},
    jantina: {},
    tel: {},
    emailPendaftaran: {},
    namaAkaun: {},
    noAkaun: {},
    statusPerkahwinan: {},
    alamat: {},
    tarikhDaftar: {type:String},
    namaPasangan: {},
    jenisPengenalan: {},
    nomborPengenalan: {}
  }

}, { minimize: false });

//Hash password(passport-local-mongoose ( pbkdf2 algorithm ))
userSchema.plugin(passportLocalMongoose);
userSchema.plugin(findOrCreate);

const User = mongoose.model("User", userSchema);

passport.use(User.createStrategy());

passport.serializeUser(function(user, done) {
  done(null, user);
});

passport.deserializeUser(function(user, done) {
  done(null, user);
});

// passport.use(new LocalStrategy(
//     {username:"email", password:"password"},
//     function(username, password, done) {
//         return done(null, false, {message:'Unable to login'});
//     }
// ));

passport.use(new GoogleStrategy({
    clientID: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
    callbackURL: "http://localhost:3000/auth/google/"
  },
  function(accessToken, refreshToken, profile, cb) {
    User.findOrCreate({ googleId: profile.id }, function (err, user) {
      return cb(err, user);
    });
  }
));




app.get("/", function(req, res){
  res.render("login");
});

app.get('/auth/google',
  passport.authenticate('google', { scope: ['profile'] }));

  app.get("/auth/google/secrets",
  passport.authenticate("google", {failureRedirect: "/login"}),
  function(req, res){
    res.redirect("/secrets");
  }
);


//Github Oauth2
// passport.use(new GitHubStrategy({
//   clientID: process.env.GITHUB_CLIENT_ID,
//   clientSecret: process.env.GITHUB_CLIENT_SECRETS,
//   callbackURL: "http://localhost:3000/auth/github/secrets"
//   },
//   function(accessToken, refreshToken, profile, done) {
//     User.findOrCreate({ githubId: profile.id }, function (err, user) {
//       return done(err, user);
//     });
//   }
// ));
//
// app.get('/auth/github',
//   passport.authenticate('github', { scope: [ 'user:email' ] }));
//
// app.get('/auth/github/secrets',
//   passport.authenticate('github', { failureRedirect: '/login' }),
//   function(req, res) {
//     // Successful authentication, redirect home.
//     res.redirect('/secrets');
//   });

app.get("/login", function(req, res){
  res.render("login");
});

app.get("/signup", function(req, res){
  res.render("signup");
});

app.get("/main", function(req, res) {
  if(req.isAuthenticated()) {
    User.find({"userData": { $ne: null }}, function(err, foundUsers){
    if(err) {
      console.log(err);
    } else {
      // console.log(foundUsers);
      res.render("main", {userWithData: foundUsers});
    }
  });
  } else {
    res.redirect("/login");
  }
});

app.get("/usermain", function(req, res) {
  if(req.isAuthenticated()) {

    User.findById(req.user._id, function(err, result) {
      if(err) {
        console.log(err);
      } else {
        res.render("usermain", {
          id: req.user,
          status: result.status,
          nama: result.userData.nama,
          mykad: result.userData.mykad,
          jantina: result.userData.jantina,
          tel: result.userData.tel,
          emailPendaftaran: result.userData.emailPendaftaran,
          namaAkaun: result.userData.namaAkaun,
          noAkaun: result.userData.noAkaun,
          statusPerkahwinan: result.userData.statusPerkahwinan,
          alamat: result.userData.alamat,
          tarikhDaftar: result.userData.tarikhDaftar,
          namaPasangan: result.userData.namaPasangan,
          jenisPengenalan: result.userData.jenisPengenalan,
          nomborPengenalan: result.userData.nomborPengenalan
        });
      }
    });

} else {
  res.redirect('/login');
}

});

app.get("/pendaftaran", function(req, res) {
  if(req.isAuthenticated()) {

    User.findById(req.user._id, function(err, result) {
      if(err) {
        console.log(err);
      } else {
        res.render("form", {
          id: req.user,
          status: result.status,
          nama: result.userData.nama,
          mykad: result.userData.mykad,
          jantina: result.userData.jantina,
          tel: result.userData.tel,
          emailPendaftaran: result.userData.emailPendaftaran,
          namaAkaun: result.userData.namaAkaun,
          noAkaun: result.userData.noAkaun,
          statusPerkahwinan: result.userData.statusPerkahwinan,
          alamat: result.userData.alamat,
          tarikhDaftar: result.userData.tarikhDaftar,
          namaPasangan: result.userData.namaPasangan,
          jenisPengenalan: result.userData.jenisPengenalan,
          nomborPengenalan: result.userData.nomborPengenalan
        });
      }
    });

  } else {
      res.redirect("/login");
  }
});

app.get("/main/diluluskan", function(req, res) {

  User.find({ status: 'Diluluskan'}, function(err, result){
    if(err){
      console.log(err);
    } else{
      res.render("diluluskan", {userApproved: result});

    }
  });

});

app.get("/main/tidakdiluluskan", function(req, res) {

  User.find({ status: 'Tidak Diluluskan'}, function(err, result){
    if(err){
      console.log(err);
    } else{
      res.render("tidakdiluluskan", {userDispproved: result});

    }
  });

});

// app.get("/secrets", function(req, res) {
//   User.find({"secret": { $ne: null }}, function(err, foundUsers){
//     if(err) {
//       console.log(err);
//     } else {
//       res.render("secrets", {usersWithSecrets: foundUsers});
//     }
//   });
// });



app.get ("/logout", function(req, res) {
  req.logout();
  res.redirect("/");
});


app.post("/signup", function(req, res){

  User.register({username: req.body.username}, req.body.password, function(err, user) {
    if (err) {
      console.log(err);
      res.redirect("/signup");
    } else {
      passport.authenticate("local")(req, res, function(){
        if(req.body.username === "admin@1.com") {
          res.redirect("/main");
        } else {
          res.redirect("/usermain");
        }
      });
    }
  });

});

// app.post('/login',
//   passport.authenticate('local', { successRedirect: '/secrets'}),
//   function(req, res) {
//     res.redirect('/secrets');
//   });

app.post("/login", function(req, res){

  const user = new User({
    username: req.body.username,
    password:req.body.password
  });
  req.login(user, function(err){
    if(err) {
      console.log(err);
    }else {
      passport.authenticate("local")(req, res, function(){
        if(req.body.username === "admin1@1.com") {
          res.redirect("/main");
        } else {
          res.redirect("/usermain");
        }
      });
    }
  });
});


app.post("/pendaftaran", function(req,res) {

  const formData = {
    nama: req.body.nama,
    mykad: req.body.mykad,
    jantina: req.body.jantina,
    tel: req.body.tel,
    emailPendaftaran: req.body.emailPendaftaran,
    namaAkaun: req.body.namaAkaun,
    noAkaun: req.body.noAkaun,
    statusPerkahwinan: req.body.statusPerkahwinan,
    alamat: req.body.alamat,
    tarikhDaftar: req.body.tarikhDaftar,
    namaPasangan: req.body.namaPasangan,
    jenisPengenalan: req.body.jenisPengenalan,
    nomborPengenalan: req.body.nomborPengenalan
  };

  User.findByIdAndUpdate(req.user._id, { userData: formData } ,function(err){
    if(err) {
      console.log(err);
    } else {
      console.log("Updated Successfully");


      }
            res.redirect("/usermain");
    }
  );


  // User.findById(req.user._id, function(err, foundUser){
  //   if(err) {
  //     console.log(err);
  //   } else {
  //     if (foundUser) {
  //     foundUser.userData = formData;
  //     foundUser.save(function(){
  //     console.log("Successful");
  //     res.redirect("/usermain");
  //     });
  //   }
  //     }
  //   }
  // );
});

app.post('/delete/:id', function(req, res) {
    // var id = req.body._id;
    // console.log(id);
    User.findByIdAndRemove(req.params.id, function (err) {
       if(err) {
         console.log(err);
       } else {
         console.log("deleted");
         res.redirect('/main');
       }

     });
});

app.post('/delete/user/:id', function(req, res) {

  const formData = {
    nama: undefined,
    mykad: undefined,
    jantina: undefined,
    tel: undefined,
    emailPendaftaran: undefined,
    namaAkaun: undefined,
    noAkaun: undefined,
    statusPerkahwinan: undefined,
    alamat: undefined,
    tarikhDaftar: undefined,
    namaPasangan: undefined,
    jenisPengenalan: undefined,
    nomborPengenalan: undefined
  };

  User.findByIdAndUpdate(req.user._id, { userData: formData, status: undefined } ,function(err){
    if(err) {
      console.log(err);
    } else {
      console.log("Successful");


      }
            res.redirect("/usermain");
    }
  );




});

app.post("/main/statuslulus/:id", function(req, res) {

  User.findByIdAndUpdate(req.params.id, { status: "Diluluskan" } ,function(err){
    if(err) {
      console.log(err);
    } else {
      console.log("Diluluskan");


      }
            res.redirect("/main");
    }
  );

});



app.post("/main/statustidaklulus/:id", function(req, res) {

  User.findByIdAndUpdate(req.params.id, { status: "Tidak Diluluskan" } ,function(err){
    if(err) {
      console.log(err);
    } else {
      console.log("Diluluskan");


      }
            res.redirect("/main");
    }
  );

});

app.post("/main/statustidaklulus/:id", function(req, res) {

  User.findByIdAndUpdate(req.params.id, { status: "Tidak Diluluskan" } ,function(err){
    if(err) {
      console.log(err);
    } else {
      console.log("Diluluskan");


      }
            res.redirect("/main");
    }
  );

});

app.post("/main/view/:id", function(req, res) {

  User.findById(req.params.id, function(err, result){
    if(err) {
      console.log(err);
    } else{
      res.render("form", {
      nama: result.userData.nama,
      mykad: result.userData.mykad,
      jantina: result.userData.jantina,
      tel: result.userData.tel,
      emailPendaftaran: result.userData.emailPendaftaran,
      namaAkaun: result.userData.namaAkaun,
      noAkaun: result.userData.noAkaun,
      statusPerkahwinan: result.userData.statusPerkahwinan,
      alamat: result.userData.alamat,
      tarikhDaftar: result.userData.tarikhDaftar,
      namaPasangan: result.userData.namaPasangan,
      jenisPengenalan: result.userData.jenisPengenalan,
      nomborPengenalan: result.userData.nomborPengenalan
      });
    }

  });

});

// app.post("/submit", function(req, res){
//   const submittedSecret=req.body.secret;
//   User.findById(req.user._id, function(err, foundUser){
//     if(err) {
//       console.log(err);
//     } else {
//       if (foundUser) {
//         foundUser.secret = submittedSecret;
//         foundUser.save(function(){
//           res.redirect("/secrets");
//         });
//       }
//     }
//   });
// });










app.listen(3000, function(){
  console.log("Server started at port 3000.");
});
