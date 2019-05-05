const express = require('express');
const router = express.Router();

router.use(express.json());

router.post('/', async (req, res) => {
  res.status(401).send('Unauthorised.');
});

module.exports = router;
