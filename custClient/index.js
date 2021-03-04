const express = require("express");
const path = require("path");
const mongoose = require("mongoose");
const ejsMate = require("ejs-mate");
const session = require("express-session");
const flash = require("connect-flash");
const ExpressError = require("./utils/ExpressError");
const methodOverride = require("method-override");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const custUser = require("./models/users");
const catchAsync = require("./utils/catchAsync");
const axios = require("axios").default;

const API_URL = "http://localhost:8008";

mongoose.connect("mongodb://192.168.112.1:27017/oregon-wines", {
	useNewUrlParser: true,
	useCreateIndex: true,
	useUnifiedTopology: true,
	useFindAndModify: false,
});

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
	console.log("Database connected");
});

const app = express();

app.engine("ejs", ejsMate);
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.use(express.static(path.join(__dirname, "public")));

const sessionConfig = {
	secret: "megasomethingsomething",
	resave: false,
	saveUninitialized: true,
	cookie: {
		httpOnly: true,
		expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
		maxAge: 1000 * 60 * 60 * 24 * 7,
	},
};

app.use(session(sessionConfig));
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(custUser.authenticate()));

passport.serializeUser(custUser.serializeUser());
passport.deserializeUser(custUser.deserializeUser());


app.use((req, res, next) => {
	res.locals.currentUser = req.user;
	res.locals.success = req.flash("success");
	res.locals.error = req.flash("error");
	next();
});

app.get(
	"/home",
	catchAsync(async (req, res) => {
		const address = req.query.a;
		let winebatch = await fetchBatch(address);
		res.render("home", { winebatch });
	})
);

app.all("*", (req, res, next) => {
	next(new ExpressError("Page Not Found", 404));
});

app.use((err, req, res, next) => {
	const { statusCode = 500 } = err;
	if (!err.message) {
		err.message = "Something went wrong.";
	}
	res.status(statusCode).render("error", { err });
});

app.listen(3000, () => {
	console.log("Serving on port 3000");
});

const fetchBatch = (address) => {
	return axios.get(`${API_URL}/state/${address}`).then((response) => {
		let decoded = Buffer.from(response.data.data, "base64").toString("utf8");
		let jsonStr = decoded.replace(/(\w+:)|(\w+ :)/g, function (matchedStr) {
			return '"' + matchedStr.substring(0, matchedStr.length - 1) + '":';
		});
		decoded = JSON.parse(jsonStr);
		decoded.address = address;
		return decoded;
	});
};
