var express = require('express');
var router = express.Router();
require('json.date-extensions');
JSON.useDateParser();

var DB = {
  '123': {
    date: new Date(),
    descripton: "Lorem ipsum dolor."
  }
};

/* GET users listing. */
router.get('/:code', function(req, res, next) {
  res.send(DB[req.params.code] || []);
});

router.post('/:code', function(req, res, next) {

  DB[req.params.code] = DB[req.params.code] || [];
  DB[req.params.code].push({
    date: new Date(),
    activity: req.body.activity,
    description: req.body.description
  });

  res.send({
    success: true
  });

});

module.exports = router;
