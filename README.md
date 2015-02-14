feathers-mongo-collections Service
=========================

[![NPM](https://nodei.co/npm/feathers-mongo-collections.png?downloads=true&stars=true)](https://nodei.co/npm/feathers-mongo-collections/)


> Create a service for managing [MongoDB](http://mongodb.org/) collections with [FeatherJS](https://github.com/feathersjs).

`feathers-mongo-collections` works just like a standard [FeatherJS](https://github.com/feathersjs) service, except for the get/findOne.  It uses the collection name as the `id` value when performing `create`, `update`, and `remove`.

## Installation

```bash
npm install feathers-mongo-database --save
```

## Getting Started
To create an instance of a `feathers-mongo-collections` service, first connect to your MongoDB database.  Then pass the connected database into `feathers-mongo-collections`.

```js
var feathers = require('feathers');
var feathersMongoColls = require('feathers-mongo-collections');
var MongoClient = require('mongodb').MongoClient;
var dbAddress = 'mongodb://localhost:27017/feathers-tuts';

// Prep the Feathers server.
var app = feathers()
  .use(feathers.static(__dirname + '/public'))
  .use(bodyParser.json())
  .use(bodyParser.urlencoded({extended: true}))
  .configure(feathers.socketio())
  .configure(feathers.rest());

// Connect to the database.
MongoClient.connect(dbAddress, function(err, db) {
    // Create a `feathers-mongo-collections` instance.
    app.use('/feathers-tuts/_collections', feathersMongoColls(db))
});

// Start the server.
var port = 8081;
app.listen(port, function() {
  // app.use('/api/tasks', require('./services/tasks'));
  console.log('Feathers server listening on port ' + port);
});

```

## API

### find()
`find()` currently accepts no parameters.  It simply returns an array of all of the collections in the connected db.  It returns data in this format:

```json
[
    {
        "size": "",
        "max": "",
        "capped": false,
        "name": "users",
        "stats": {
          "ns": "feathers-tuts.users",
          "count": 6,
          "size": 1360,
          "avgObjSize": 226.66666666666666,
          "storageSize": 40960,
          "numExtents": 2,
          "nindexes": 2,
          "lastExtentSize": 32768,
          "paddingFactor": 1,
          "systemFlags": 1,
          "userFlags": 0,
          "totalIndexSize": 16352,
          "indexSizes": {
            "_id_": 8176,
            "id_1": 8176
          },
          "ok": 1
        }
    },
    {
        "name": "employees",
        "stats": {
          "ns": "feathers-tuts.employees",
          "count": 0,
          "size": 0,
          "storageSize": 8192,
          "numExtents": 1,
          "nindexes": 2,
          "lastExtentSize": 8192,
          "paddingFactor": 1,
          "systemFlags": 1,
          "userFlags": 0,
          "totalIndexSize": 16352,
          "indexSizes": {
            "_id_": 8176,
            "id_1": 8176
          },
          "ok": 1
        }
    }
]
```

***

### get()
Not implemented

***

### create(name)
Provide a collection `name`.  If `create` is successful, the data returned will look like this:
```json
{
    "name": "MyCollection"
}
```

If the collection already exists, the existing collection will not be overwritten.  MongoDB doesn't actually require creating a collection before inserting a document.  If you insert a document into a collection that doesn't exist, the collection will be created upon insert, so this method is mostly a convenience method for web apps.

***

### update(name)
For update operations, the collection name replaces the REST id. Pass the current db name as the id, and the new name in the data.

```
PUT /api/localhost:27017/feathers-tuts/_collections/MyCollection HTTP/1.1
Content-Type: application/x-www-form-urlencoded

name=NewCollectionName
```

If the update operation is successful, the response will look like this:
```json
{
    "name": "NewCollectionName"
}
```

If the name / id doesn't exist, the following MongoDB error will be returned:
```
"exception: source namespace does not exist"
```

If the target name already exists, the following MongoDB error will be returned:
```
"exception: target namespace exists"
```

***

### remove(name)
For remove operations, the collection name is used as the REST id.

Successful remove operations will return `true`.

If the named collection cannot be found, the following MongoDB error will be returned:
```
"ns not found"
```

***

## License

[MIT](LICENSE)

## Author

[Marshall Thompson](https://github.com/marshallswain)