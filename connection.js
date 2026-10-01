const mongoose = require("mongoose");

async function connectToMongoDG(url) {
    return await mongoose.connect(url).then(()=> console.log("MongoDB connected...")).catch((err) => console.log("error : ", err));
}

module.exports = {
    connectToMongoDG
}