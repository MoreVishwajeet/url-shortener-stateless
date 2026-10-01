const { nanoid } = require("nanoid")
const URL = require("../models/url")

async function handleGenerateNewShortURL(req, res) {
    const body = req.body;

    //pre-check
    const entry = await URL.findOne({redirectURL : body.url});
    if(entry && req.user._id.equals(entry.createdBy)) return res.render('home', {id : entry.shortId});

    
    if(!body.url) return res.status(400).json({error : "url is required"})
    //short url  generation
    const shortId = nanoid(8);
    //entry creation
    await URL.create({
        shortId : shortId,
        redirectURL : body.url,
        visitHistory : [],
        createdBy: req.user._id,
    });


    return res.render('home', {id : shortId});
};

async function handleRedirecting(req, res) {
    const shortId = req.params.shortId;
    const entry = await URL.findOneAndUpdate({shortId}, {
        $push: {
            visitHistory : { timestamp : Date.now()},
        },
    });

    if (!entry) {
        return res.status(404).json({ message : "URL not found"});
    }

    res.redirect(entry.redirectURL);
}

async function handleGetAnalytics(req, res) {
    const shortId = req.params.shortId;
    const entry = await URL.findOne({shortId});

    return res.json({totalCkicks : entry.visitHistory.length, analytics : entry.visitHistory});
}

module.exports = {
    handleGenerateNewShortURL,
    handleRedirecting,
    handleGetAnalytics,
}