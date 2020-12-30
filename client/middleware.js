const { wineBatchSchema } = require("./schemas.js");
const ExpressError = require("./utils/ExpressError");
const WineBatch = require("./models/winebatch");

module.exports.isLoggedIn = (req,res,next) => {
    if(!req.isAuthenticated()){
        req.session.returnTo = req.originalUrl;
        req.flash("error", "You aren't signed in.")
        return res.redirect('/login')
    }
    next();
};

module.exports.validateWineBatch = (req, res, next) => {
	const { error } = wineBatchSchema.validate(req.body);
	if (error) {
		const msg = error.details.map((el) => el.message).join(",");
		throw new ExpressError(msg, 400);
	} else {
		next();
	}
};

module.exports.isOwner = async (req, res, next) => {
	const { id } = req.params;
	const winebatch = await WineBatch.findById(id);
	if (!winebatch.owner.equals(req.user._id)) {
		req.flash("error", "You do not have permission to do that!");
		return res.redirect(`/winebatches`);
	}
	next();
};