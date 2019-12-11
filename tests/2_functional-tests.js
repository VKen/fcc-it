/*
*
*
*       FILL IN EACH FUNCTIONAL TEST BELOW COMPLETELY
*       -----[Keep the tests in the same order!]-----
*       (if additional are added, keep them at the very end!)
*/

var chaiHttp = require('chai-http');
var chai = require('chai');
var assert = chai.assert;
var server = require('../server');
var ObjectId = require('mongodb').ObjectID;

chai.use(chaiHttp);

suite('Functional Tests', function() {
    let issue_id;  // used for PUT functional testing

    suite('POST /api/issues/{project} => object with issue data', function() {

      test('Every field filled in', function(done) {
       chai.request(server)
        .post('/api/issues/test')
        .send({
          issue_title: 'Title',
          issue_text: 'text',
          created_by: 'Functional Test - Every field filled in',
          assigned_to: 'Chai and Mocha',
          status_text: 'In QA'
        })
        .end(function(err, res){
          if (err) {
             return  assert.fail("some error happened");
          }
          assert.equal(res.status, 200);

          //fill me in too!
          assert.equal(res.body.issue_title, 'Title');
          assert.equal(res.body.issue_text, 'text');
          assert.equal(res.body.created_by, 'Functional Test - Every field filled in');
          assert.equal(res.body.assigned_to, 'Chai and Mocha');
          assert.equal(res.body.status_text, 'In QA');
          assert.exists(res.body.created_on, 'created_on is an object');
          assert.exists(res.body.updated_on, 'updated_on is an object');
          assert.isBoolean(res.body.open, 'open is boolean');
          assert.exists(res.body._id, '_id field exists');

          issue_id = res.body._id;  // to be used in put request later

          done();
        });
      });

      test('Required fields filled in', function(done) {
       chai.request(server)
        .post('/api/issues/test')
        .send({
          issue_title: 'Title',
          issue_text: 'text',
          created_by: 'Functional Test - Every field filled in',
        })
        .end(function(err, res){
          assert.equal(res.status, 200);

          //fill me in too!
          assert.equal(res.body.issue_title, 'Title');
          assert.equal(res.body.issue_text, 'text');
          assert.equal(res.body.created_by, 'Functional Test - Every field filled in');
          assert.equal(res.body.assigned_to, '');
          assert.equal(res.body.status_text, '');
          assert.exists(res.body.created_on, 'created_on is an object');
          assert.exists(res.body.updated_on, 'updated_on is an object');
          assert.isBoolean(res.body.open, 'open is boolean');
          assert.exists(res.body._id, '_id field exists');
          done();
        });
      });

      test('Missing required fields', function(done) {
       chai.request(server)
        .post('/api/issues/test')
        .send({
          assigned_to: 'Chai and Mocha',
          status_text: 'In QA'
        })
        .end(function(err, res){
          assert.equal(res.status, 422);
          assert.equal(res.text, 'missing required fields');
          done();
        });

      });

    });

    suite('PUT /api/issues/{project} => text', function() {

      test('No body', function(done) {
       chai.request(server)
        .put('/api/issues/test')
        .send({})  // no body
        .end(function(err, res){
          assert.equal(res.status, 422);
          assert.equal(res.text, 'missing required fields');

          chai.request(server)
            .put('/api/issues/test')
            .send({
              _id: issue_id,  // nofields
            })
            .end(function(err, res){
              assert.equal(res.status, 200);
              assert.equal(res.text, 'no updated field sent');
              done();
            })
        })
      });

      test('One field to update', function(done) {
       chai.request(server)
        .put('/api/issues/test')
        .send({
          _id: issue_id,
          issue_title: 'Updated Title',
        })
        .end(function(err, res){
          assert.equal(res.status, 200);
          assert.equal(res.text, 'successfully updated');

          // test invalid `_id`
          let invalid_id = '5df0d8b60ddb3b196b5494f2';
          chai.request(server)
            .put('/api/issues/test')
            .send({
              _id: invalid_id,
              issue_title: 'Updated Title',
            })
            .end(function(err, res){
              assert.equal(res.status, 200);
              assert.equal(res.text, `could not update ${invalid_id}`);
              done();
            })
        })
      });

      test('Multiple fields to update', function(done) {
        chai.request(server)
          .put('/api/issues/test')
          .send({
            _id: issue_id,
            created_by: 'Functional Test - more fields updated',
            assigned_to: 'unknown updated',
          })
          .end(function(err, res){
            assert.equal(res.status, 200);
            assert.equal(res.text, 'successfully updated');
            done();
          })

      });

    });

    suite('GET /api/issues/{project} => Array of objects with issue data', function() {

      test('No filter', function(done) {
        chai.request(server)
        .get('/api/issues/test')
        .query({})
        .end(function(err, res){
          assert.equal(res.status, 200);
          assert.isArray(res.body);
          assert.property(res.body[0], 'issue_title');
          assert.property(res.body[0], 'issue_text');
          assert.property(res.body[0], 'created_on');
          assert.property(res.body[0], 'updated_on');
          assert.property(res.body[0], 'created_by');
          assert.property(res.body[0], 'assigned_to');
          assert.property(res.body[0], 'open');
          assert.property(res.body[0], 'status_text');
          assert.property(res.body[0], '_id');
          done();
        });
      });

      test('One filter', function(done) {

      });

      test('Multiple filters (test for multiple fields you know will be in the db for a return)', function(done) {

      });

    });

    suite('DELETE /api/issues/{project} => text', function() {

      test('No _id', function(done) {

      });

      test('Valid _id', function(done) {

      });

    });

});
