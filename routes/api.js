/*
*
*
*       Complete the API routing below
*
*
*/

'use strict';

var expect = require('chai').expect;
var MongoClient = require('mongodb').MongoClient;
var ObjectId = require('mongodb').ObjectID;

const CONNECTION_STRING = process.env.DB; //MongoClient.connect(CONNECTION_STRING, function(err, db) {});
const mongo = new MongoClient(CONNECTION_STRING, { useUnifiedTopology: true });

mongo.connect((err, client) => {
    if (err) {
        console.error('connection error to db');
    } else {
        console.log('db connection successful');
    }
});

module.exports = function (app) {

  app.route('/api/issues/:project')

    .get(async function (req, res){
        var project = req.params.project;
        let col = mongo.db().collection(project);
        res.json(await col.find(req.query).toArray());
    })

    .post(async function (req, res){
        var project = req.params.project;
        let col = mongo.db().collection(project);
        const input_keys = Object.keys(req.body);
        const required = ['issue_title', 'issue_text', 'created_by'];
        const optional = ['assigned_to', 'status_text'];

        if (!required.every((val) => {
            return input_keys.includes(val) && req.body[val];
        })) return res.status(422).send('missing required fields');

        //  check and insert other optional fields
        optional.forEach((val) => {
            if (!input_keys.includes(val)) {
                req.body[val] = '';
            }
        });

        // insert other meta data fields
        // - created_on
        let timestamp = new Date();
        req.body['created_on'] = timestamp;
        // - updated_on
        req.body['updated_on'] = timestamp;
        // - open
        req.body['open'] = true;  // initial state

        let r = await col.insertOne(req.body)

        if (r.insertedCount == 1) {
            return res.status(200).json(r.ops[0]);
        }
        return res.status(500).send('DB insertion failed');
    })

    .put(async function (req, res){
        var project = req.params.project;
        let col = mongo.db().collection(project);
        const input_keys = Object.keys(req.body);
        const required = ['_id'];
        const optional = ['issue_title', 'issue_text', 'created_by', 'assigned_to', 'status_text'];

        if (!required.every((val) => {
            return input_keys.includes(val) && req.body[val];
        })) return res.status(422).send('missing required fields');

        const {_id, ...optional_fields} = req.body;

        optional.forEach((val) => {
            if (input_keys.includes(val)) {
                if (!optional_fields[val]) delete optional_fields[val];
            }
        });

        if (Object.keys(optional_fields).length == 0) {
            return res.status(200).send('no updated field sent');
        }

        // add updated time
        optional_fields['updated_on'] = new Date();

        // search and update
        let r = await col.updateOne({_id: new ObjectId(req.body._id)}, {$set: optional_fields});
        if (r.matchedCount == 1) {
            return res.status(200).send('successfully updated');
        } else {
            return res.status(200).send(`could not update ${req.body._id}`);
        }
    })

    .delete(async function (req, res){
        var project = req.params.project;
        let col = mongo.db().collection(project);
        const input_keys = Object.keys(req.body);
        const required = ['_id'];

        if (!required.every((val) => {
            return input_keys.includes(val) && req.body[val];
        })) return res.status(422).send('_id error');

        let r = await col.deleteOne({ _id: new ObjectId(req.body._id)});
        if (r.deletedCount == 1) {
            return res.status(200).send(`deleted ${req.body._id}`);
        } else {
            return res.status(404).send(`could not delete ${req.body._id}`);
        }
    });
};
