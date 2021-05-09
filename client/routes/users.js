// users.js contains all of the endpoints that are involved user creation and management.  

const express = require("express");
const router = express.Router();
const passport = require("passport");
const catchAsync = require("../utils/catchAsync");
const User = require("../models/users");
const { createContext } = require("sawtooth-sdk/signing");
const { isLoggedIn } = require("../middleware");

// Renders registration page
router.get("/register", (req, res) => {
	res.render("users/register");
});

// Uses passport to create a user document in mongodb.  The password is salted and then hashed obviously.
// Right now, we're storing private keys (which are necessary for each user/winery to send transactions to the blockchain) in the same database that contains user login information.
// This is obviously a huge no-no, but this thing isn't even remotely close to deployment, so IT'S OKAY.
router.post(
	"/register",
	catchAsync(async (req, res) => {
		try {
			const { email, username, password } = req.body;
			const context = createContext("secp256k1");
			const pk = context.newRandomPrivateKey();
			const privateKey = pk.asHex();
			const user = new User({ email, privateKey, username });
			console.log(user.privateKey);
			const registeredUser = await User.register(user, password);
			req.login(registeredUser, (err) => {
				if (err) {
					return next(err);
				} else {
					req.flash("success", "Welcome to Oregon Wines");
					res.redirect("/winebatches");
				}
			});
		} catch (e) {
			req.flash("error", e.message);
			res.redirect("/register");
		}
	})
);

// Renders the login page.
router.get("/login", (req, res) => {
	res.render("users/login");
});

// Creates a session and logs the user in.  
router.post(
	"/login",
	passport.authenticate("local", {
		failureFlash: true,
		failureRedirect: "/login",
	}),
	(req, res) => {
		req.flash("success", "Welcome back!");
		const redirectUrl = req.session.returnTo || "/winebatches";
		delete req.session.returnTo;
		res.redirect(redirectUrl);
	}
);

// Renders the account management page.
router.get("/account", isLoggedIn, (req, res) => {
	res.render("users/account");
});

// Renders the password change page.
router.get("/passchan", isLoggedIn, (req, res) => {
	res.render("users/passchan");
});

// Changes the users password (or tells the user that the entered in their information correctly while trying to change their password)
router.post(
	"/passchan",
	isLoggedIn,
	catchAsync(async (req, res) => {
		if (req.body.Npassword != req.body.NpasswordAg) {
			req.flash("error", "New passwords don't match!");
			return res.redirect("/passchan");
		} else {
			try{
				const user = await User.findOne(req.user._id);
				await user.changePassword(req.body.Opassword, req.body.Npassword);
				req.flash("success", "Password Changed Successfully");
				return res.redirect("/account");
			}catch (e){
				req.flash("error", "Old password not entered correctly!")
				return res.redirect("/passchan");
			}
		}
	})
);

// Logs the user out and redirects them to the login page.
router.get("/logout", (req, res) => {
	req.logout();
	req.flash("success", "Logged Out");
	res.redirect("/login");
});

module.exports = router;
