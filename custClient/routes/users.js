// users.js contains endpoints related to user management.
const express = require("express");
const router = express.Router();
const passport = require("passport");
const catchAsync = require("../utils/catchAsync");
const User = require("../models/users");
const { isLoggedIn } = require("../middleware");
// const nodemailer = require('nodemailer');

// Renders the registration page
router.get("/register", (req, res) => {
	res.render("users/register");
});

// Creates a new user account.
router.post(
	"/register",
	catchAsync(async (req, res) => {
		try {
			const {
				email,
				username,
				password,
				firstname,
				lastname,
				address,
				city,
				zip,
				phone,
				state,
			} = req.body;
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
	res.render("users/account", { user });
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
	res.render("users/infochange", { user });
});

// Changes a user's account information (not their password).
router.patch(
	"/account",
	isLoggedIn,
	catchAsync(async (req, res) => {
		try {
			const user = await User.findOne(req.user._id);
			user.email = req.body.email;
			user.address = req.body.address;
			user.city = req.body.city;
			user.zip = req.body.zip;
			user.state = req.body.state;
			user.phone = req.body.phone;
			await user.save();
			req.flash("success", "Account info changed Successfully!");
			return res.redirect("/viewaccount");
		} catch (e) {
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

// let transporter = nodemailer.createTransport({
// 	// host: 'smtp.ethereal.email',
// 	service: "Gmail", // list：https://nodemailer.com/smtp/well-known/
// 	port: 465, // SMTP port
// 	secureConnection: true, // SSL
// 	auth: {
// 		user: "blockchainoregonwine@gmail.com",
// 		// google account password
// 		pass: "password!!4321",
// 	},
// });

// let mailOptions = {
// 	from: '"Blockchain of Oregon Wine Group18" <blockchainoregonwine@gmail.com>', // sender address
// 	to: req.user.email, //receivers
// 	subject: "Your Account is Now Active!" + Date.now(), // Subject line
// 	// text or html format
// 	// text: 'Hello world?', // plain text body
// 	html: '<p><img src="https://robbreport.com/wp-content/uploads/2020/02/farnienteestate_007.jpg?w=1000" width="1000" height="350"/></p><h1>Dear Customer</h1><p>Thank you for taking the time to create an account and joining the Blockchain of Oregon Wine mailing list.</p><p>Watch your inbox for special inventory sales, invitations to our exclusive events, and the latest news about our wines</p><p>Access your <a href="www.google.com">account</a> to redeem your rebate by scanning the QR code on our premier wines. For more tips about entertaining and enjoying wine please visit our website: <a href="www.google.com">WINERY WEBSITE</a></p><p>When you’re in our neighborhood stop by we would love to see you and share a glass of wine in the meantime will stay in touch!</p><h2>Cheers!</h2><p style="color:grey;">You’re getting this email because you are a registered customer. Thank you!</p>', // html body
// };

// // send mail with defined transport object
// transporter.sendMail(mailOptions, (error, info) => {
// 	if (error) {
// 		return console.log(error);
// 	}
// 	console.log("Message sent: %s", info.messageId);
// 	// Message sent: <04ec7731-cc68-1ef6-303c-61b0f796b78f@qq.com>
// });

module.exports = router;
