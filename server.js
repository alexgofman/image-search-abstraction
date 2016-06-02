var express = require('express');
var http = require('http');
var request = require('request');
var url = require('url');
var mongo = require('mongodb').MongoClient;

var app = express();

app.use(express.static("public"));

mongo.connect(process.env.MONGOLAB_URI || process.env.MONGO_URI, function(err, db) {
    if (err)
	throw err;

    var collection = db.collection('history');

    app.get('/image', function(req, res) {
	qurl = url.parse(req.url, true);
	qurl.query.date = new Date();

	collection.insert( qurl.query );

	var offset;
	var config = { url : "http://api.pixplorer.co.uk/image",
	    qs : {amount : 10, size: "l" }};
	
	if (qurl.query.hasOwnProperty('amount'))
	    config.qs.amount = qurl.query.amount;

	if (qurl.query.hasOwnProperty('word'))
	    config.qs.word = qurl.query.word;

	request(config, function(error, response, body) {
	    if (error)
		throw error;

	    res.send(JSON.parse(body).images);
	});
    });

    app.get('/history', function(req, res) {
	collection.find({}, {"_id":0}).sort({"date": -1}).limit(10).toArray( function(err, docs) {
	    console.log(docs);
	    res.send(docs);
	});
    });

    app.listen(process.env.PORT, function() {
	console.log("listening on port " + process.env.PORT + "...");
    });
});
