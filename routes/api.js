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

    .get(function (req, res){
        var project = req.params.project;
        let col = mongo.db().collection(project);
        res.json(col.find().toArray());
    })

    .post(function (req, res){
        var project = req.params.project;
        let col = mongo.db().collection(project);
        const input_keys = Object.keys(req.body);
        const required = ['issue_title', 'issue_text', 'created_by'];
        const optional = ['assigned_to', 'status_text'];
        if (required.every((val) => {
            return input_keys.includes(val) && req.body[val];
        })){
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

            col.insertOne(req.body, {}, (err, r) => {
                if (err) {
                    return res.status(500).send()
                }
                res.status(200).json(r.ops[0]);
            });
        } else {
            res.status(422).send('missing required fields');
        }
    })

    .put(function (req, res){
        var project = req.params.project;
        let col = mongo.db().collection(project);

    })

    .delete(function (req, res){
        var project = req.params.project;
        let col = mongo.db().collection(project);
    });
};
