const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const WineBatchSchema = new Schema({
    bName: String,
	grapes: String,
	bottleDate: Date,
	numBottles: Number,
	gLocation: String,
	gHarvestDate: Date,
	barrel: String,
	comments: String,
	owner: {
		type: Schema.Types.ObjectId,
		ref:'User'
	}
});

module.exports = mongoose.model("Winebatch", WineBatchSchema);
