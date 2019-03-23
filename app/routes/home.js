const express = require('express');

const router = express.Router();

router.get('/', (req, res) => {
  res.render('index', {
    title: 'My vidly app',
    message: 'Welcome to my express app.',
  });
});

module.exports = router;
