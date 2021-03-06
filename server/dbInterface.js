//http://mongodb.github.io/node-mongodb-native/3.0/quick-start/quick-start/

const MongoClient = require('mongodb').MongoClient;
const assert = require('assert');

// Connection URL
const url = 'mongodb://localhost:27017';

// Database Name
const dbName = 'ServiceDb';

// Database connection
let db = null;

// Use connect method to connect to the server
MongoClient.connect(url, function(err, client) {
  assert.equal(null, err);
  console.log("Connected successfully to server");

  db = client.db(dbName);
});


/*
//Users Schema

{
	name: String,
	email: String,
	password: String,
	interests: [String/int/enum],
	phone: String,
	eventsAttending: [int],
	eventsHosting:[int]
}
*/

module.exports.getUser = function(username){
	return new Promise(	
		function (resolve, reject) {
			const collection = db.collection('Users');
			// Find some documents
			
			let query = {'name': username} ;
			console.log(query);

		 	collection.findOne(query, function(err, doc) {
			if(err == null){
				console.log("getUser() query Success");
				resolve(doc);
			} else{
				console.log("getUser() query Failed");
				reject(err);
			}
		});
	});
};

module.exports.addUser = function(name, email, password, phone){
	return new Promise(	
		function (resolve, reject) {
			const collection = db.collection('Users');
			let doc = {
				'name': name, 
				'email': email, 
				'password': password,
				'interests': [], 
				'phone': phone,
				'eventsAttending': [],
				'eventsHosting':[]
			}
		 	collection.insertOne(doc,{},function(err, result) {
			if(err == null){
				console.log("addUser() query Success: " + name);
				resolve(result);
			} else{
				console.log("addUser() query failed: " + name);
				reject(err);
			}
		});
	});
};


module.exports.updateUserPassword = function(name, password){
	return new Promise(	
		function (resolve, reject) {
			const collection = db.collection('Users');
			let doc = {};
			doc.password = password;

		 	collection.updateOne({'name': name},{ '$set': doc}, {'upsert':false},function(err, result) {
			if(err == null){
				console.log("updateUserPassword() Success: " + name);
				resolve(result);
			} else{
				console.log("updateUserPassword() Failed: " + name);
				reject(err);
			}
		});
	});
};

module.exports.updateUserDetails = function(name, interestList, phone){
	return new Promise(	
		function (resolve, reject) {
			const collection = db.collection('Users');
			let doc = {};
			doc.interests = interestList;
			doc.phone = phone;

		 	collection.updateOne({'name': name},{ '$set': doc}, {'upsert':false},function(err, result) {
			if(err == null){
				console.log("updateUserDetails() Success: " + name);
				resolve(result);
			} else{
				console.log("updateUserDetailss() Failed: " + name);
				reject(err);
			}
		});
	});
};

module.exports.addUserAttendingEvent = function(name, eventID){
	return new Promise(	
		function (resolve, reject) {
			const collection = db.collection('Users');
			let doc = {
				'eventsAttending': eventID
			};
		 	collection.updateOne({'name': name},{ '$push': doc},
		 			{'upsert':false},function(err, result) {
			if(err == null){
				console.log("addUserAttendingEvent() Success: " 
				+ name
				+ ":" + eventID);
				resolve(result);
			} else{
				console.log("addUserAttendingEvent() Failed: "
				+ name
				+ ":" + eventID);
				reject(err);
			}
		});
	});
};

module.exports.removeUserAttendingEvent = function(name, eventID){
	return new Promise(	
		function (resolve, reject) {
			const collection = db.collection('Users');
			let doc = {
				'eventsAttending': eventID
			};
		 	collection.updateOne({'name': name},{ '$pull': doc},
		 			{'upsert':false},function(err, result) {
			if(err == null){
				console.log("removeUserAttendingEvent() Success: " 
				+ name
				+ ":" + eventID);
				resolve(result);
			} else{
				console.log("removeUserAttendingEvent() Failed: "
				+ name
				+ ":" + eventID);
				reject(err);
			}
		});
	});
};

module.exports.addUserHostingEvent = function(name, eventID){
	return new Promise(	
		function (resolve, reject) {
			const collection = db.collection('Users');
			let doc = {
				'eventsHosting': eventID
			};
		 	collection.updateOne({'name': name},{ '$push': doc},
		 			{'upsert':false},function(err, result) {
			if(err == null){
				console.log("addUserHostingEvent() Success: " 
				+ name
				+ ":" + eventID);
				resolve(result);
			} else{
				console.log("addUserHostingEvent() Failed: "
				+ name
				+ ":" + eventID);
				reject(err);
			}
		});
	});
};

module.exports.removeUserHostingEvent = function(name, eventID){
	return new Promise(	
		function (resolve, reject) {
			const collection = db.collection('Users');
			let doc = {
				'eventsHosting': eventID
			};
		 	collection.updateOne({'name': name},{ '$pull': doc},
		 			{'upsert':false},function(err, result) {
			if(err == null){
				console.log("removeUserHostingEvent() Success: " 
				+ name
				+ ":" + eventID);
				resolve(result);
			} else{
				console.log("removeUserHostingEvent() Failed: "
				+ name
				+ ":" + eventID);
				reject(err);
			}
		});
	});
};

/*
//Events Schema
{
	eventID: int
	title: String
	timeDate: Date
	tag:[String/int/enum],
	location: TBD
	locationName: String
	host: String (username)
	attendees: [String]
	reviews:[{user: String, score:Int, review:String}]
}
*/

module.exports.getAllEvents = function(){
	return new Promise(	
		function (resolve, reject) {
			const collection = db.collection('Events');
			// Find some documents
		 	let dbRes = collection.find({},{
				'attendees': 0, 
				'reviews': 0
			}).sort('timeDate',-1);
			dbRes.toArray(function(err, docs) {
			if(err == null){
				console.log("getAllEvents() query Success");
				resolve(docs);
			} else{
				console.log("getAllEvents() query Failed");
				reject(err);
			}
		});
	});
};

module.exports.queryEvents = function(keywordRegex, upperBound, lowerBound, numberBound){
	// keywordRegex is a RegExp Obj corresponding to the keywords	
	return new Promise(	
		function (resolve, reject) {
			const collection = db.collection('Events');
			let doc = {};
			if (keywordRegex != null) {
				doc['title'] = keywordRegex;
			}

			let andList = [];
			if (upperBound != null) {
				andList.push({'$lte': upperBound});
			}
			if (lowerBound != null) {
				andList.push({'$gt': lowerBound});
			}
			if (andList.length != 0) {
				doc['$timeDate']['$and'] = andList;
			}

		 	let dbRes = collection.find(doc,{
				'attendees': 0, 
				'reviews': 0
			}).sort('timeDate',1);
			if (numberBound != null) {
				dbRes = dbRes.limit(numberBound);
			}
			dbRes.toArray(function(err, doc) {
			if(err == null){
				console.log("queryEvents() query Success");
				resolve(doc);
			} else{
				console.log("queryEvents() query Failed");
				reject(err);
			}
		});
	});
};

module.exports.getEvent = function(eventID){
	return new Promise(	
		function (resolve, reject) {
			const collection = db.collection('Events');
			// Find some documents
			
			let query = {'eventID': eventID} ;
			console.log(query);

		 	collection.findOne(query, function(err, doc) {
			if(err == null){
				console.log("getEvent() query Success");
				resolve(doc);
			} else{
				console.log("getEvent() query Failed");
				reject(err);
			}
		});
	});
};

module.exports.addEvent = function(eventID, title, tag, location, locationName, host){
	return new Promise(	
		function (resolve, reject) {
			const collection = db.collection('Events');
			let doc = {
				'eventID': eventID,
				'title': title,
				'timeDate': new Date(),
				'tag': tag,
				'location': location,
				'locationName': locationName,
				'host': host,
				'attendees': [],
				'reviews':[]
			};
		 	collection.insertOne(doc,{},function(err, result) {
			if(err == null){
				console.log("addEvent() query Success: " + title);
				resolve(result);
			} else{
				console.log("addEvent() query failed: " + title);
				reject(err);
			}
		});
	});
};

module.exports.updateEvent = function(eventID, title, tag, location, locationName){
	return new Promise(	
		function (resolve, reject) {
			const collection = db.collection('Events');
			let doc = {
				'title': title,
				'timeDate': new Date(),
				'tag': tag,
				'location': location,
				'locationName': locationName
			};
		 	collection.updateOne({'eventID': eventID},{ '$set': doc},
		 			{'upsert':false},function(err, result) {
			if(err == null){
				console.log("updateEvent() Success: " + eventID);
				resolve(result);
			} else{
				console.log("updateEvent() Failed: " + eventID);
				reject(err);
			}
		});
	});
};

module.exports.addEventAttendee = function(eventID, attendee){
	return new Promise(	
		function (resolve, reject) {
			const collection = db.collection('Events');
			let doc = {
				'attendees': attendee
			};
		 	collection.updateOne({'eventID': eventID},{ '$push': doc},
		 			{'upsert':false},function(err, result) {
			if(err == null){
				console.log("addEventAttendee() Success: " + eventID);
				resolve(result);
			} else{
				console.log("addEventAttendee() Failed: " + eventID);
				reject(err);
			}
		});
	});
};

module.exports.removeEventAttendee = function(eventID, attendee){
	return new Promise(	
		function (resolve, reject) {
			const collection = db.collection('Events');
			let doc = {
				'attendees': attendee
			};
		 	collection.updateOne({'eventID': eventID},{ '$pull': doc},
		 			{'upsert':false},function(err, result) {
			if(err == null){
				console.log("addEventAttendee() Success: " + eventID);
				resolve(result);
			} else{
				console.log("addEventAttendee() Failed: " + eventID);
				reject(err);
			}
		});
	});
};

module.exports.addEventReview = function(eventID, user, score, review){
	return new Promise(	
		function (resolve, reject) {
			const collection = db.collection('Events');
			let doc = {
				'reviews':{
					'user': user,
					'score': score,
					'review': review
				}
			};
		 	collection.updateOne({'eventID': eventID},{ '$push': doc},
		 			{'upsert':false},function(err, result) {
			if(err == null){
				console.log("addEventReview() Success: " + eventID);
				resolve(result);
			} else{
				console.log("addEventReview() Failed: " + eventID);
				reject(err);
			}
		});
	});
};



