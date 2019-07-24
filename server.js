const express = require("express");
const mongoose = require("mongoose");
const axios = require("axios");
const exphbs = require("express-handlebars");
const cheerio = require("cheerio");

var db = require("./models");

const MONGODB_URI =
  process.env.MONGODB_URI || "mongodb://localhost/mongoHeadlines";
mongoose.connect(MONGODB_URI, { useNewUrlParser: true });

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(express.static("public"));

app.engine("handlebars", exphbs({ defaultLayout: "main" }));
app.set("view engine", "handlebars");

app.get("/", function(req, res) {
  db.Article.find({}).then(dbArticle => {
    res.render("index", { articles: dbArticle });
  });
});

// A GET route for scraping the New York Times website
app.get("/scrape", function(req, res) {
  db.Article.find({})
    .then(dbArticle => {
      if (dbArticle.length) {
        // found some articles
        res.json(dbArticle);
      } else {
        // perform a scrape

        axios.get("http://www.nytimes.com/").then(function(response) {
          const $ = cheerio.load(response.data);

          const results = [];

          $("article").each(function(i, element) {
            const result = {};

            // Add the text and href of every link, and save them as properties of the result object
            result.title = $(this)
              .find("h2")
              .text();
            result.link =
              "http://www.nytimes.com/" +
              $(this)
                .find("a")
                .attr("href");

            if (result.title && result.link) {
              results.push(result);
            }

            // Create a new Article using the `result` object built from scraping
            db.Article.create(result)
              .then(function(dbArticle) {
                console.log(dbArticle);
              })
              .catch(function(err) {
                console.log(err);
              });
          });

          res.json(results);
        });
      }
    })
    .catch(err => {
      console.log(err);
    });
});

app.delete("/clear", function(req, res) {
  db.Article.remove()
    .then(result => {
      res.send(200).end();
    })
    .catch(err => {
      res.send(500).end();
    });
});

// Route for getting all Articles from the db
app.get("/articles", function(req, res) {
  db.Article.find({})
    .then(function(dbArticle) {
      res.json(dbArticle);
    })
    .catch(function(err) {
      res.json(err);
    });
});

// Route for grabbing a specific Article by id, populate it with a comment
app.get("/articles/:id", function(req, res) {
  db.Article.findOne({ _id: req.params.id })
    .populate("comment")
    .then(function(dbArticle) {
      // If we were able to successfully find an Article with the given id, send it back to the client
      res.json(dbArticle);
    })
    .catch(function(err) {
      // If an error occurred, send it to the client
      res.json(err);
    });
});

// Route for saving/updating an Article's associated Note
app.post("/articles/:id", function(req, res) {
  // Create a new note and pass the req.body to the entry
  db.Note.create(req.body)
    .then(function(dbNote) {
      // If a Note was created successfully, find one Article with an `_id` equal to `req.params.id`. Update the Article to be associated with the new Note
      // { new: true } tells the query that we want it to return the updated User -- it returns the original by default
      // Since our mongoose query returns a promise, we can chain another `.then` which receives the result of the query
      return db.Article.findOneAndUpdate(
        { _id: req.params.id },
        { note: dbNote._id },
        { new: true }
      );
    })
    .then(function(dbArticle) {
      // If we were able to successfully update an Article, send it back to the client
      res.json(dbArticle);
    })
    .catch(function(err) {
      // If an error occurred, send it to the client
      res.json(err);
    });
});

// Start the server
app.listen(PORT, function() {
  console.log("App running on port " + PORT + "!");
});
