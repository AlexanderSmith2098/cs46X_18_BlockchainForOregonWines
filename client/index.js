// Index.js is sort of the nexus for everything.  It sets a lot of the modules up, and it has the final error checking route that all of our endpoints go to if an error is found
const express = require("express");
const path = require("path");
const mongoose = require("mongoose");
const ejsMate = require("ejs-mate");
const session = require('express-session');
const flash = require('connect-flash');
const ExpressError = require("./utils/ExpressError");
const methodOverride = require("method-override");
const passport = require('passport');
const LocalStrategy = require('passport-local');
const User = require('./models/users');

// These are the two routes or collection of endpoints that we have.  userRoutes contains all of the endpoints related to authentication/authorization
// winebatchesRoutes contains all of the endpoints related to the manipulation of wine batches
const usersRoutes= require('./routes/users');
const winebatchesRoutes = require('./routes/winebatches');

// Setting up our connection to our mongodb
const {mongoURL} = require('./lib/mongo')
console.log(mongoURL)
mongoose.connect(mongoURL, {
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
app.use(express.static(path.join(__dirname, 'public')))

// Session info
const sessionConfig = {
	secret: "teenagemutantninjaturtles",
	resave: false,
	saveUninitialized: true,
	cookie: {
		httpOnly: true,
		expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
		maxAge: 1000 * 60 * 60 * 24 * 7,
	},
};

// We use the flash module to assist in error handeling
app.use(session(sessionConfig));
app.use(flash());

// A bunch of passport setup/init stuff
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req,res,next) => {
	res.locals.currentUser = req.user;
	res.locals.success = req.flash('success');
	res.locals.error = req.flash('error');
	next();
})

app.use('/', usersRoutes);
app.use('/winebatches', winebatchesRoutes);


// If a resource isn't found, express hits this endpoint (or whatever) and a 404 error is sent to the user
app.all("*", (req, res, next) => {
	next(new ExpressError("Page Not Found", 404));
});

// This endpoint handles all other errors
app.use((err, req, res, next) => {
	const { statusCode = 500 } = err;
	if (!err.message) {
		err.message = "Something went wrong.";
	}
	res.status(statusCode).render("error", { err });
});

app.listen(8080, () => {
	console.log("Serving on port 8080");
});
