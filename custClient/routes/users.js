// users.js contains endpoints related to user management.
const express = require("express");
const router = express.Router();
const passport = require("passport");
const catchAsync = require("../utils/catchAsync");
const User = require("../models/users");
const { isLoggedIn} = require("../middleware");

// Renders the registration page
router.get("/register", (req, res) => {
	res.render("users/register");
});

// Creates a new user account.
router.post(
	"/register",
	catchAsync(async (req, res) => {
		try {
			const { email, username, password, firstname, lastname, address, city, zip, phone, state} = req.body;
			const user = new User({
				email,
				username,
				firstname,
				lastname,
				address,
				city,
				zip,
				phone,
                state,
			});
			const registeredUser = await User.register(user, password);
			req.login(registeredUser, (err) => {
				if (err) {
					return next(err);
				} else {
					req.flash("success", "Account creation successful");
					res.redirect("/viewaccount");
				}
			});
		} catch (e) {
			req.flash("error", e.message);
			res.redirect("/register");
		}
	})
);

// Renders the login page
router.get("/login", (req, res) => {
	res.render("users/login");
});

// Logs the user in (Or tells the user that they failed to login)
router.post(
	"/login",
	passport.authenticate("local", {
		failureFlash: true,
		failureRedirect: "/login",
	}),
	(req, res) => {
		req.flash("success", "Welcome back!");
		const redirectUrl = req.session.returnTo || "/viewaccount";
		delete req.session.returnTo;
		res.redirect(redirectUrl);
	}
);

// Renders the account management page.
router.get("/viewaccount", isLoggedIn, (req, res) => {
    const user = {
			firstname: req.user.firstname,
			lastname: req.user.lastname,
            email: req.user.email,
			address: req.user.address,
			city: req.user.city,
			zip: req.user.zip,
            state: req.user.state,
			phone: req.user.phone,
		};
        res.render("users/account", {user});
});

// Renders the password change page.
router.get("/passchan", isLoggedIn, (req, res) => {
	res.render("users/passchan");
});

// Changes a user's password
router.post(
	"/passchan",
	isLoggedIn,
	catchAsync(async (req, res) => {
		if (req.body.Npassword != req.body.NpasswordAg) {
			req.flash("error", "New passwords don't match!");
			return res.redirect("/passchan");
		} else {
			try {
				const user = await User.findOne(req.user._id);
				await user.changePassword(req.body.Opassword, req.body.Npassword);
				req.flash("success", "Password Changed Successfully");
				return res.redirect("/viewaccount");
			} catch (e) {
				req.flash("error", "Old password not entered correctly!");
				return res.redirect("/passchan");
			}
		}
	})
);

// Renders the account editing page
router.get("/account/edit", isLoggedIn, (req, res) => {
	const user = {
		email: req.user.email.trim(),
		address: req.user.address.trim(),
		city: req.user.city.trim(),
		zip: req.user.zip.trim(),
		state: req.user.state.trim(),
		phone: req.user.phone.trim(),
	};
	res.render("users/infochange", {user});
});

// Changes a user's account information (not their password).
router.patch(
	"/account",
	isLoggedIn,
	catchAsync(async (req, res) => {
		try {const user = await User.findOne(req.user._id);
		user.email = req.body.email;
		user.address = req.body.address;
		user.city = req.body.city;
		user.zip = req.body.zip;
		user.state = req.body.state;
		user.phone = req.body.phone;
		await user.save();
		req.flash("success", "Account info changed Successfully!");
		return res.redirect("/viewaccount");
	}catch (e){
		req.flash("error", "Failure to change account info!");
		return res.redirect("/account");
	}

	})
);

// Logs a user out and redirects them to the login page.
router.get("/logout", (req, res) => {
	req.logout();
	req.flash("success", "Logged Out");
	res.redirect("/login");
});

module.exports = router;
