const mongoose = require("mongoose");
const wines = require("./wines");
const WineBatch = require("../models/winebatch");

mongoose.connect("mongodb://172.29.128.1:27017/oregon-wines", {
	useNewUrlParser: true,
	useCreateIndex: true,
	useUnifiedTopology: true,
});

const db = mongoose.connection;

db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
	console.log("Database connected");
});

const seedDB = async () => {
    await WineBatch.deleteMany({});
    for (let i = 0; i < wines.length; i++){
        const winebatch = new WineBatch({
					owner: '5fe684418b25010222e29393',
					bName: `${wines[i].bName}`,
					grapes: `${wines[i].grapes}`,
					numBottles: `${wines[i].numBottles}`,
					gLocation: `${wines[i].gLocation}`,
					barrel: `${wines[i].barrel}`,
					comments: `${wines[i].comments}`,
				});
                await winebatch.save();
    }
}

seedDB().then(() => {
    mongoose.connection.close();
})
