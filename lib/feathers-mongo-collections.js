'use strict';

var async = require('async');

/**
 * A feathers service to manage CRUD on MongoDB collections in a provided database.
 * It will allow you to create, read, update, and delete databases on the client.
 *
 * @param  {Object} db [description]
 * @param  {String} collectionName - The name of the collection to be acted upon.
 * @return {Object} - The feathers service.
 */
module.exports = function(db) {

	var parseName = function parseName(colName){
		return colName.replace(db.databaseName + '.', '');
	};

	var dbService = {

		setup: function(app) {
			this.db = db;
			this.service = app.service.bind(app);
		},

		/**
		 * Returns a list of collections belonging to the configured database(s).
		 * Adds stats to each collection.
		 */
		find: function(params, callback) {
			var self = this;
			var collections = [];
		  // Get the collections for this dbName
	  	this.db.listCollections().toArray(function(err, colls) {
			  // Loop through the collections
	  		for (var n = 0; n < colls.length; n++) {

	  			var options = colls[n].options || {};
	  			// Remove the old name.
	  			delete options.create;
		  		// Remove the dbName from the collection name.
	  			options.name = parseName(colls[n].name);
	  			// Set the name as the _id.
	  			options._id = options.name;

	  			// Add it to the list.
	  	  	collections.push(options);
	  	  }

		  	// Async function to add stats to each collection.
		  	var addStats = function(coll, callback){
		  		// Switch databases
		  		var collection = self.db.collection(coll.name);
		  		// Get the stats. null if empty.
		  		collection.stats(function(err, stats){
		  			// Add the stats to the corresponding database.
		  			coll.stats = stats;
			  		callback(err, coll);
		  		});
		  	};

		  	async.each(collections, addStats, function(err){
	  	    if (err) {
	  	    	callback({error:err.errmsg});
	  	    } else {
	  	    	// Sort the collections
	  	    	collections.sort(function (a, b) {
	  	    		return (a.name > b.name) ? 1 : -1;
	  	    	});
	  	    	// Send the collections
					  return callback(null, collections);
	  	    }
		  	});
	  	});
		},

		/**
		 * Create a collection.
		 * @param  {String} data.name - The name of the collection to be created.
		 * @return {Object} - name:collectionName
		 */
		create: function(data, params, callback) {
			if (!data.name) {
				return callback({error:'name is required'});
			}
		  this.db.createCollection(data.name, {}, function(err, collection){
		  	var response = {
		  		name:collection.collectionName,
		  		_id:collection.collectionName
		  	};
				return callback(null, response);
		  });
		},

		update: function(id, data, params, callback) {
		  this.db.renameCollection(id, data.name, {}, function(err){
		  	if (err) {
		  		// All other errors.
		  		return callback({error:err.errmsg});
		  	}
		  	var response = {
		  		name:data.name,
		  		_id:data.name
		  	};
				return callback(null, response);
		  });
		},

		remove: function(id, params, callback) {
		  this.db.dropCollection(id, function(err){
		  	if (err) {
		  		return callback(err.errmsg);
		  	}
				return callback(null, {_id:id});
		  });
		}
	};

	return dbService;
};
