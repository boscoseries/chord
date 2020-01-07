const path = require('path');
const fs = require('fs');
const { Router } = require('express');

const router = Router();

router.get('/privacy-policy', (req, res) => {
  fs.readFile(path.join(__dirname, '../../../', 'assets', 'privacy-policy.html'), 'utf8', (err, data) => {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    return res.end(data);
  });
});

router.get('/terms', (req, res) => {
  fs.readFile(path.join(__dirname, '../../../', 'assets', 'terms-service.html'), 'utf8', (err, data) => {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    return res.end(data);
  });
});

module.exports = router;
