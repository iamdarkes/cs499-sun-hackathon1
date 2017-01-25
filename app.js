/*
	Name: Victor Darkes & Michelle Duong
	Course: CS 499-01
	Instructor: Dr. Sun
	Assignment: Hackathon 1

	Building a dropbox style file uploading application with AWS S3.
*/

var express = require('express')
var AWS = require('aws-sdk')
var fs = require('fs')
var s3 = new AWS.S3();

var myBucket = 'cs499-sun';
var app = express()

// This is how your enable CORS for your web service
app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

//Watches file changes within 'dropbox' directory which is local to application
fs.watch('dropbox', (eventType, filename) => {
  console.log(`event type is: ${eventType}`);
  if(eventType == 'rename') {
  	if(fs.existsSync('dropbox/' + filename)) {
  		console.log(`File ${filename} uploaded`);
  		uploadFileToS3('dropbox/' + filename);
  	} else {
  		console.log(`File ${filename} deleted`);
	    deleteFileFromS3('dropbox/' + filename);
  	}
  } else if (eventType == 'change') {
	  	console.log(`File ${filename} uploaded`);
	  	uploadFileToS3('dropbox/' + filename);
  } else {
    	console.log('filename not provided');
  }
});


//lists all the elements within the S3 bucket 
app.get('/list', function(req, res){
	var params = {
	  Bucket: myBucket	  
	};
	s3.listObjects(params, 	function(err, data){	  
	  for(var i = 0; i < data.Contents.length; i++) {
	  	data.Contents[i].Url = 'https://s3-us-west-2.amazonaws.com/' + data.Name + '/' + data.Contents[i].Key;
	  }	  
	  res.send(data.Contents);
	})
})

//Upload new or modified item to S3 bucket 
function uploadFileToS3(filename) {
	fs.readFile(filename, function (err, data) {
		params = {Bucket: myBucket, Key: filename, Body: data, ACL: "public-read", ContentType: "text/plain"};
	    s3.putObject(params, function(err, data) {
	         if (err) {
	             console.log(err)
	         } else {
	             console.log("Successfully uploaded data to " + myBucket, data);
	         }
	    });
	});
}




//Delete removed item from S3 bucket
function deleteFileFromS3(filename) {
	fs.readFile(filename, function (err, data) {
		params = {Bucket: myBucket, Key: filename };
	    s3.deleteObject(params, function(err, data) {
	         if (err) {
	             console.log(err)
	         } else {
	             console.log("Successfully deleted data from " + myBucket);
	         }
	    });
	});
}

//Run application on port 3000
app.listen(3000, function () {
  console.log('Listening on port 3000!')
})