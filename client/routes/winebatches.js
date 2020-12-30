const express = require('express');
const router = express.Router();
const catchAsync = require("../utils/catchAsync");
const {isLoggedIn, isOwner, validateWineBatch} = require('../middleware');
const WineBatch = require("../models/winebatch");

router.get(
	"/",
	isLoggedIn,
	catchAsync(async (req, res) => {
		console.log(req.user._id);
		const winebatches = await WineBatch.find({owner: req.user._id});
		res.render("winebatches/index", { winebatches });
	})
);

router.get("/new", isLoggedIn, (req, res) => {
	res.render("winebatches/new");
});

router.post(
	"/",
	isLoggedIn,
	validateWineBatch,
	catchAsync(async (req, res) => {
		const winebatch = new WineBatch(req.body.winebatch);
		console.log(req.user._id)
		winebatch.owner = req.user._id;
		console.log(winebatch)
		await winebatch.save();
		req.flash("success", "Successfully created a new wine batch.");
		res.redirect(`/winebatches/${winebatch._id}`);
	})
);

router.get(
	"/:id",
	isLoggedIn,
	isOwner,
	catchAsync(async (req, res) => {
		const winebatch = await WineBatch.findById(req.params.id);
		if(!winebatch){
			req.flash('error', 'Cannot find that wine batch.')
			return res.redirect('/winebatches');
		}
		res.render("winebatches/show", { winebatch });
	})
);

router.get(
	"/:id/edit",
	isLoggedIn,
	isOwner,
	catchAsync(async (req, res) => {
		const winebatch = await WineBatch.findById(req.params.id);
		if (!winebatch) {
			req.flash("error", "Cannot find that wine batch.");
			return res.redirect("/winebatches");
		}
		res.render("winebatches/edit", { winebatch });
	})
);

router.put(
	"/:id",
	isLoggedIn,
	isOwner,
	validateWineBatch,
	catchAsync(async (req, res) => {
		const { id } = req.params;
		const winebatch = await WineBatch.findByIdAndUpdate(id, {
			...req.body.winebatch,
		});
		req.flash('success', 'Successfully updated wine batch.')
		res.redirect(`/winebatches/${winebatch._id}`);
	})
);

router.delete(
	"/:id",
	isLoggedIn,
	isOwner,
	catchAsync(async (req, res) => {
		const { id } = req.params;
		await WineBatch.findByIdAndDelete(id);
		req.flash('success', 'Successfully deleted wine batch.')
		res.redirect("/winebatches");
	})
);

module.exports = router