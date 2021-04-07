const express = require("express");
const router = express.Router();
const passport = require("passport");
const catchAsync = require("../utils/catchAsync");
const User = require("../models/users");
const { isLoggedIn} = require("../middleware");

router.get("/register", (req, res) => {
	res.render("users/register");
});

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

router.get("/login", (req, res) => {
	res.render("users/login");
});


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
router.get("/passchan", isLoggedIn, (req, res) => {
	res.render("users/passchan");
});
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


router.get("/logout", (req, res) => {
	req.logout();
	req.flash("success", "Logged Out");
	res.redirect("/login");
});

module.exports = router;
