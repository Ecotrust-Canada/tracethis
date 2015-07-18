var express = require('express');
var router = express.Router();
require('json.date-extensions');
JSON.useDateParser();

var mongojs = require('mongojs');
var db = mongojs('tracethis', ['traces']);


router.get('/:code', function(req, res, next) {
  db.traces.find({'code': req.params.code}, function(err, docs){
    res.send(docs);
  });
});



router.post('/:code', function(req, res, next) {

  trace = {
    code: req.params.code,
    date: new Date(),
    activity: req.body.activity,
    description: req.body.description,
    filename: req.body.filename,
    latitude: req.body.latitude,
    longitude: req.body.longitude
  };
  console.log(trace);
  db.traces.save(trace);

  res.send({
    success: true
  });

});



module.exports = router;
