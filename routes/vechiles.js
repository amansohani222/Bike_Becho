var express = require("express");
var router = express.Router();
var Vechile = require("../models/vechile.js");

router.get("/vechiles",function(req,res){
    Vechile.find({}, function(err, vechiles){
     if(err)
      console.log(err);
     else
      res.render("vechile/index.ejs",{vechiles: vechiles});
    });
});

router.get("/vechiles/new" ,isLoggedIn ,function(req, res) {
    res.render("vechile/new.ejs");
});

router.post("/vechiles" ,isLoggedIn ,function(req,res){
    var cmpname = req.body.cmpname;
    var imgurl = req.body.imgurl;
    var price = req.body.price;
    var description = req.body.description;
    var author = {
        id: req.user._id,
        username: req.user.username
    };
    var obj = {name: cmpname, image: imgurl, description: description, author: author, price: price};
    Vechile.create(obj, function(err, cmp){
     if(err)
      console.log(err);
     else{
         req.flash("success", "New vechile added successfully");
         res.redirect("/vechiles");
     }
      
    });
});

router.get("/vechiles/:id", function(req, res) {
    var _id = req.params.id;
    Vechile.findById(_id).populate("comments").exec(function(err, foundVechile){
     if(err)
      console.log(err);
     else
      res.render("vechile/show.ejs", {vechile: foundVechile});
     
    });
});

router.get("/vechiles/:id/edit", hasOwnership, function(req, res){
    Vechile.findById(req.params.id, function(err, foundVechile){
        if(err)
         { console.log(err);
           res.redirect("/vechiles/"+req.params.id); }
        else
        {
            res.render("vechile/edit.ejs", {vechile: foundVechile});
        }
    })
    
});

router.post("/vechiles/:id/edit", hasOwnership, function(req, res){
    Vechile.findByIdAndUpdate(req.params.id, req.body.vechile, function(err, success){
        if(err)
        {
            console.log(err);
            res.redirect("/vechiles/"+req.params.id);
        }
        else
        {   req.flash("success", "Your vechile's information edited successfully");
            res.redirect("/vechiles/"+req.params.id);
        }
    });
});

router.post("/vechile/:id/delete", hasOwnership, function(req, res){
    Vechile.findByIdAndRemove(req.params.id, function(err){
        if(err)
         { console.log(err);
           res.redirect("/vechile/"+req.params.id); }
        else
         {   req.flash("success", "Vechile deleted successfully");
             res.redirect("/vechiles"); }
    });
});


function isLoggedIn(req, res, next){
    if(req.isAuthenticated())
     return next();
    else
    {   
        req.flash("error", "You need to login first");
        res.redirect("/login");
    }
}

function hasOwnership(req, res, next){
    if(!req.isAuthenticated())
     {   res.flash("error", "You don't have permission to do this");
         res.redirect("back"); }
    else{
        Vechile.findById(req.params.id, function(err, foundVechile){
            if(err)
            {
                console.log(err);
                res.flash("error", "You don't have permission to do this");
                res.redirect("back");
            }
            else{
                if(req.user._id.equals(foundVechile.author.id))
                 next();
                else
                {res.flash("error", "You don't have permission to do this");
                 res.redirect("back"); }
            }
        });
    }
   
}

module.exports = router;