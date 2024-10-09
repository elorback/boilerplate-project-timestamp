const express = require("express");
const cors = require("cors");
const app = express();
const parser = require("body-parser");
const dns = require("dns");
const url = require("url");
require("dotenv").config();

// Basic Configuration
const port = process.env.PORT || 3000;
app.use(parser.urlencoded({ extended: true }));
app.use(cors());

app.use("/public", express.static(`${process.cwd()}/public`));

app.get("/", function (req, res) {
  res.sendFile(process.cwd() + "/views/index.html");
});

// Your first API endpoint
app.get("/api/hello", function (req, res) {
  res.json({ greeting: "hello API" });
});

// Store URLs
let urlDatabase = [];
let urlCount = 1; // Counter to assign short URLs

// POST request to shorten URL
app.post("/api/shorturl", (req, res) => {
  const originalUrl = req.body.url;

  // Extract hostname from the URL
  let host;
  try {
    host = new url.URL(originalUrl).hostname;
  } catch (err) {
    return res.json({ error: "invalid url" });
  }

  // DNS lookup to check if the hostname is valid
  dns.lookup(host, (err) => {
    if (err) {
      return res.json({ error: "invalid url" });
    } else {
      // Add URL to the database
      const newUrlEntry = {
        original_url: originalUrl,
        short_url: urlCount,
      };
      urlDatabase.push(newUrlEntry);

      // Send the response with the original and shortened URL
      res.json({ original_url: originalUrl, short_url: urlCount });

      // Increment the URL counter
      urlCount++;
    }
  });
});

// GET request to redirect to the original URL
app.get("/api/shorturl/:short_url", (req, res) => {
  const shortUrl = parseInt(req.params.short_url);

  // Find the original URL from the database
  const urlEntry = urlDatabase.find((entry) => entry.short_url === shortUrl);

  if (urlEntry) {
    // Redirect to the original URL
    res.redirect(urlEntry.original_url);
  } else {
    // If the short_url does not exist, return an error
    res.json({ error: "No short URL found for the given input" });
  }
});

app.listen(port, function () {
  console.log(`Listening on port ${port}`);
});
