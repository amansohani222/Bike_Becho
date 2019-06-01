var express = require("express");
var router = express.Router();
var Vechile = require("../models/vechile.js");
var Comment = require("../models/comment.js");

router.get("/vechiles/:id/comments/new", isLoggedIn, function(req, res){
    Vechile.findById(req.params.id, function(err, foundVechile){
        if(err)
         console.log(err);
        else
        {
            
            res.render("comment/new.ejs", {vechile: foundVechile});
        }
    });
});

router.post("/vechiles/:id/comments", isLoggedIn, function(req,res){
    var comment = req.body.comment;
    Comment.create(comment, function(err, success){
        if(err)
         console.log(err);
        else
        {   success.author.id = req.user._id;
            success.author.username = req.user.username;
            success.save();
            Vechile.findById(req.params.id, function(err, foundVechile){
                if(err)
                 console.log(err);
                else
                {
                    foundVechile.comments.push(success);
                    foundVechile.save();
                    req.flash("success", "New comment added successfully");
                }
                
                res.redirect("/vechiles/"+req.params.id);
            });
        }
    });
});

router.get("/vechiles/:id/comments/:comment_id/edit", hasOwnership, function(req, res){
    Vechile.findById(req.params.id, function(err, foundVechile){
        if(err)
        {
            console.log(err);
            res.redirect("/vechiles/"+req.params.id);
        }
        else
        {
            Comment.findById(req.params.comment_id, function(err, foundComment){
                if(err)
                {
                    console.log(err);
                    res.redirect("/vechiles/"+req.params.id);
                }
                else
                {  
                    res.render("comment/edit.ejs", {vechile: foundVechile, comment: foundComment});
                }
            })
        }
    })
})

router.post("/vechiles/:id/comments/:comment_id/edit", hasOwnership, function(req, res){
    Comment.findByIdAndUpdate(req.params.comment_id, req.body.comment, function(err, success){
        if(err)
         { console.log(err);
           res.redirect("/vechiles/"+req.params.id); }
        else
        { req.flash("success", "Comment edited successfully");
          res.redirect("/vechiles/"+req.params.id); }
    });
});

router.post("/vechiles/:id/comments/:comment_id/delete", hasOwnership, function(req, res){
    Comment.findByIdAndRemove(req.params.comment_id, function(err){
        if(err)
         { console.log(err);
           res.redirect("/vechiles/"+req.params.id); }
        else
         {   req.flash("success", "Comment deleted successfully");
             res.redirect("/vechiles/"+req.params.id); }
         
    });
});


function isLoggedIn(req, res, next){
    if(req.isAuthenticated())
     return next();
    else
    {   req.flash("error", "You need to login first");
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