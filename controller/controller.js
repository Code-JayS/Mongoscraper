const express = require("express");
const router = express.Router();
const db = require("../models/Index");
const axios = require("axios"); //Makes http calls
const cheerio = require("cheerio");



router.get("/", function (req, res) {
    // Grab every document in the Articles collection
    db.Article.find({})
    .then(function (dbArticle) {
        // If we were able to successfully find Articles, send them back to the client
        let hbsObject;
        hbsObject = {
            articles: dbArticle
        };
        res.render("index", hbsObject);        
    })
    .catch(function (err) {
        // If an error occurred, send it to the client
        res.json(err);
    });
});
// A GET route for scraping the website
router.get("/scrape", function (req, res) {
    // First, we grab the body of the html with axios
    axios.get("https://www.crunchyroll.com/news").then(function (response) {
        if (!error && response.statusCode === 200) {
            var $ = cheerio.load(response.data);

            $("li.news-item h2").each(function (i, element) {
                // Save an empty result object
                let result = {};

                result.title = $(this)
                    .children("a")
                    .text();
                result.link = $(this)
                    .children("a")
                    .attr("href");

                // Create a new Article using the `result` object built from scraping
                db.Article.create(result)
                    .then(function (dbArticle) {
                        // View the added result in the console
                        res.json(dbArticle);
                    })
                    .catch(function (err) {
                        // If an error occurred, log it
                        console.log(err);
                    });
            });

            res.redirect('/')
        }
        else if (error || response.statusCode != 200){
            res.send("Error: Unable to obtain new articles")
        }
    });
});

// Route for getting all Articles from the db
router.get("/api/articles", function (req, res) {
    // Grab every document in the Articles collection
    db.Article.find({})
        .then(function (Article) {
            // If we were able to successfully find Articles, send them back to the client
            console.log(Article);
            res.json(Article);
        })
        .catch(function (err) {
            // If an error occurred, send it to the client
            res.json(err);
        });

});

// Route for grabbing a specific Article by id, populate it with it's note
router.get("/api/articles/:id", function (req, res) {
    // Using the id passed in the id parameter, prepare a query that finds the matching one in our db...
    db.Article.findOne({ _id: req.params.id })
        // ..and populate all of the notes associated with it
        .populate("note")
        .then(function (dbArticle) {
            // If we were able to successfully find an Article with the given id, send it back to the client
            res.json(dbArticle);
        })
        .catch(function (err) {
            // If an error occurred, send it to the client
            res.json(err);
        });
});

// Route for saving/updating an Article's associated Note
router.post("/api/articles/:id", function (req, res) {
    // Create a new note and pass the req.body to the entry
    db.Comment.create(req.body)
        .then(function (dbNote) {
            // If a Note was created successfully, find one Article with an `_id` equal to `req.params.id`. Update the Article to be associated with the new Note
            // { new: true } tells the query that we want it to return the updated User -- it returns the original by default
            // Since our mongoose query returns a promise, we can chain another `.then` which receives the result of the query
            return db.Article.findOneAndUpdate({ _id: req.params.id }, { comment: dbNote._id }, { new: true });
        })
        .then(function (dbArticle) {
            // If we were able to successfully update an Article, send it back to the client
            res.json(dbArticle);
        })
        .catch(function (err) {
            // If an error occurred, send it to the client
            res.json(err);
        });
});


module.exports=router