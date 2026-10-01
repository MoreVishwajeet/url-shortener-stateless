const express = require("express");
const { 
    handleGenerateNewShortURL, 
    handleRedirecting, 
    handleGetAnalytics 
} = require('../controllers/url')


const router = express.Router();

router.post("/", handleGenerateNewShortURL);
router.get("/:shortId", handleRedirecting);
router.get('/analytics/:shortId', handleGetAnalytics);


module.exports = router;