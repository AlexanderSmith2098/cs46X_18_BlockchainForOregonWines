//regular dependencies
const express = require("express");
const router = express.Router();
const catchAsync = require("../utils/catchAsync");
const { isLoggedIn, validateWineBatch } = require("../middleware");
const { createHash } = require("crypto");
const { v4: uuidv4 } = require("uuid");

//blockchain dependencies
const API_URL = "http://localhost:8008";

const { createContext, CryptoFactory } = require("sawtooth-sdk/signing");
const { protobuf } = require("sawtooth-sdk");
const axios = require("axios").default;

const _hash = (input, length) =>
	createHash("sha512")
		.update(input)
		.digest("hex")
		.toLowerCase()
		.slice(0, length);

const TP_FAMILY = "winebatches";
const TP_NAMESPACE = _hash(TP_FAMILY).substr(0, 6);
const TP_VERSION = "1.0";

router.get(
	"/",
	isLoggedIn,
	catchAsync(async (req, res) => {
		const address = TP_NAMESPACE + _hash(req.user._id.toString(), 16);
		let winebatches = await fetchMBatches(address);
		res.render("winebatches/index", { winebatches, address });
	})
);
router.get(
	"/comp",
	isLoggedIn,
	catchAsync(async (req, res) => {
		const address = TP_NAMESPACE + _hash(req.user._id.toString(), 16);
		let winebatches = await fetchMBatches(address);
		res.render("winebatches/comp", { winebatches, address });
	})
);

router.get(
	"/custview",
	catchAsync(async (req, res) => {
		const address = req.query.a;
		let winebatch = await fetchBatch(address);
		res.render("winebatches/custview", { winebatch });
	})
);

router.get("/new", isLoggedIn, (req, res) => {
	res.render("winebatches/new");
});

router.post(
	"/",
	isLoggedIn,
	catchAsync(async (req, res) => {
		const uID = uuidv4();
		req.body.winebatch.status = 'in-progress'
		let payload = create_payload(
			"CREATE_BATCH",
			req.body.winebatch,
			req.user._id.toString(),
			uID
		);
		let address =
			TP_NAMESPACE + _hash(payload.oName, 16) + _hash(payload.wID, 48);
		const batchListBytes = setup_batch(payload, req.user.privateKey, address);
		await axios.post(`${API_URL}/batches`, batchListBytes, {
			headers: { "Content-Type": "application/octet-stream" },
		});
		setTimeout(function () {
			req.flash("success", "Successfully created a new wine batch.");
			res.redirect(`/winebatches/${payload.wID}`);
		}, 1000);
	})
);

router.get(
	"/:id",
	isLoggedIn,
	catchAsync(async (req, res) => {
		const address =
			TP_NAMESPACE +
			_hash(req.user._id.toString(), 16) +
			_hash(req.params.id, 48);
		const winebatch = await fetchBatch(address);
		if (!winebatch) {
			req.flash("error", "Cannot find that wine batch.");
			return res.redirect("/winebatches");
		}
		res.render("winebatches/show", { winebatch });
	})
);

router.get(
	"/:id/edit",
	isLoggedIn,
	catchAsync(async (req, res) => {
		const address =
			TP_NAMESPACE +
			_hash(req.user._id.toString(), 16) +
			_hash(req.params.id, 48);
		const winebatch = await fetchBatch(address);
		if (!winebatch) {
			req.flash("error", "Cannot find that wine batch.");
			return res.redirect("/winebatches");
		}
		res.render("winebatches/edit", { winebatch });
	})
);
router.post(
	"/:id/status",
	isLoggedIn,
	catchAsync(async (req, res) => {
		const address =
			TP_NAMESPACE +
			_hash(req.user._id.toString(), 16) +
			_hash(req.params.id, 48);
		
		const winebatch = await fetchBatch(address);
		if (!winebatch) {
			req.flash("error", "Cannot find that wine batch.");
			return res.redirect("/winebatches");
		}
		winebatch.status = "completed";
		let payload = create_payload(
			"UPDATE_BATCH",
			winebatch,
			req.user._id.toString(),
			req.params.id
		);
		const batchListBytes = setup_batch(payload, req.user.privateKey, address);
		await axios.post(`${API_URL}/batches`, batchListBytes, {
			headers: { "Content-Type": "application/octet-stream" },
		});
		setTimeout(function () {
			req.flash("success", "Successfully updated wine batch.");
			res.redirect(`/winebatches/${payload.wID}`);
		}, 1000);
	})
);
router.put(
	"/:id",
	isLoggedIn,
	catchAsync(async (req, res) => {
		req.body.winebatch.status = "in-progress"
		let payload = create_payload(
			"UPDATE_BATCH",
			req.body.winebatch,
			req.user._id.toString(),
			req.params.id
		);
		let address =
			TP_NAMESPACE + _hash(payload.oName, 16) + _hash(payload.wID, 48);
		const batchListBytes = setup_batch(payload, req.user.privateKey, address);
		await axios.post(`${API_URL}/batches`, batchListBytes, {
			headers: { "Content-Type": "application/octet-stream" },
		});
		setTimeout(function () {
			req.flash("success", "Successfully updated wine batch.");
			res.redirect(`/winebatches/${payload.wID}`);
		}, 1000);
	})
);

router.delete(
	"/:id",
	isLoggedIn,
	catchAsync(async (req, res) => {
		let payload = {
			action: "DELETE_BATCH",
			oName: req.user._id.toString(),
			wID: req.params.id,
		};
		let address =
			TP_NAMESPACE + _hash(payload.oName, 16) + _hash(payload.wID, 48);
		const batchListBytes = setup_batch(payload, req.user.privateKey, address);
		await axios.post(`${API_URL}/batches`, batchListBytes, {
			headers: { "Content-Type": "application/octet-stream" },
		});
		setTimeout(function () {
			req.flash("success", "Successfully deleted wine batch.");
			res.redirect("/winebatches");
		}, 1000);
	})
);

const create_payload = (action, data, oID, uID) => {
	const payload = {
		action: action,
		oName: oID,
		wID: uID,
		value: {
			batch_name: data.batch_name,
			status: data.status,
			wine_name: data.wine_name,
			num_bottles: data.num_bottles,
			style: data.style,
			alcohol: data.alcohol,
			ava: data.ava,
			acidity: data.acidity,
			grape_variety: data.grape_variety,
			harvest_loc: data.harvest_loc,
			harvest_date: data.harvest_date,
			bottle_date: data.bottle_date,
			avg_sunshine: data.avg_sunshine,
			avg_temp: data.avg_temp,
			tannins: data.tannins,
			comments: data.comments,
		},
	};
	return payload;
};

const setup_batch = (payload, pk, address) => {
	const payloadBytes = Buffer.from(JSON.stringify(payload));
	const context = createContext("secp256k1");
	const privateKey = {
		privateKeyBytes: new Buffer.from(pk, "hex"),
	};
	const signer = new CryptoFactory(context).newSigner(privateKey);

	const transactionHeaderBytes = create_transactionHeaderBytes(
		address,
		signer,
		payloadBytes
	);

	const signature = signer.sign(transactionHeaderBytes);
	const transaction = create_transaction(
		transactionHeaderBytes,
		signature,
		payloadBytes
	);

	const transactions = [transaction];
	const batchHeaderBytes = create_batchHeaderBytes(
		signer.getPublicKey().asHex(),
		transactions
	);
	const batchSignature = signer.sign(batchHeaderBytes);
	const batch = create_batch(batchHeaderBytes, batchSignature, transactions);
	const batchListBytes = create_batchListBytes(batch);
	return batchListBytes;
};

const create_transactionHeaderBytes = (address, signer, payloadBytes) => {
	const transactionHeaderBytes = protobuf.TransactionHeader.encode({
		familyName: TP_FAMILY,
		familyVersion: TP_VERSION,
		inputs: [address],
		outputs: [address],
		signerPublicKey: signer.getPublicKey().asHex(),
		batcherPublicKey: signer.getPublicKey().asHex(),
		dependencies: [],
		payloadSha512: createHash("sha512").update(payloadBytes).digest("hex"),
	}).finish();

	return transactionHeaderBytes;
};
const create_transaction = (
	transactionHeaderBytes,
	signature,
	payloadBytes
) => {
	const transaction = protobuf.Transaction.create({
		header: transactionHeaderBytes,
		headerSignature: signature,
		payload: payloadBytes,
	});
	return transaction;
};
const create_batchHeaderBytes = (signer, transactions) => {
	const batchHeaderBytes = protobuf.BatchHeader.encode({
		signerPublicKey: signer,
		transactionIds: transactions.map((txn) => txn.headerSignature),
	}).finish();
	return batchHeaderBytes;
};
const create_batch = (batchHeaderBytes, batchSignature, transactions) => {
	const batch = protobuf.Batch.create({
		header: batchHeaderBytes,
		headerSignature: batchSignature,
		transactions: transactions,
	});
	return batch;
};
const create_batchListBytes = (batch) => {
	const batchListBytes = protobuf.BatchList.encode({
		batches: [batch],
	}).finish();
	return batchListBytes;
};

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

const fetchMBatches = (address) => {
	return axios.get(`${API_URL}/state?address=${address}`).then((response) => {
		return response.data.data.map((entity) => {
			let decoded = Buffer.from(entity.data, "base64").toString("utf8");
			let jsonStr = decoded.replace(/(\w+:)|(\w+ :)/g, function (matchedStr) {
				return '"' + matchedStr.substring(0, matchedStr.length - 1) + '":';
			});
			decoded = JSON.parse(jsonStr);
			return decoded;
		});
	});
};

module.exports = router;
