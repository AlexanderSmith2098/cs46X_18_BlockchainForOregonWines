// winebatches.js contains all of the endpoints that deal with creating, deleting, updating, and fetching winebatch information from the blockchain.
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

// If a user is logged in, this endpoint fetches all in-progress winebatches from the blockchain.  This route definitely needs some pagination built into it.
// VIEWWINEBATCHES
router.get(
	"/",
	isLoggedIn,
	catchAsync(async (req, res) => {
		const address = TP_NAMESPACE + _hash(req.user._id.toString(), 16);
		let winebatches = await fetchMBatches(address);
		res.render("winebatches/index", { winebatches, address });
	})
);

// Jim requested that we make an "info" page
router.get('/home', isLoggedIn, catchAsync(async(req, res) => {
	res.render("winebatches/home")
}))

// This endpoint fetches all of the completed winebatches from the blockchain.
router.get(
	"/comp",
	isLoggedIn,
	catchAsync(async (req, res) => {
		const address = TP_NAMESPACE + _hash(req.user._id.toString(), 16);
		let winebatches = await fetchMBatches(address);
		res.render("winebatches/comp", { winebatches, address });
	})
);

// This endpoint renders the new winebatches view.
router.get("/new", isLoggedIn, (req, res) => {
	res.render("winebatches/new");
});

// This endpoint submits a newly created winebatch to the blockchain.  If the blockchain accepts the winebatch, the user is redirected
// to a page that displays the information for the successfully added winebatch.
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

// This endpoint fetches information for an individual winebatch from the blockchain.
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

// This endpoint fetches information for an individual winebatch and then renders a page that contains a form that the user can use
// to edit the winebatch's information.  Only in-progress winebatches can be edited.
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

// This endpoint changes the status of a winebatch from in-progress to complete.
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

// This endpoint is used to update winebatch information.
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

// This endpoint deletes a winebatch from the blockchain.  Only in-progress winebatches can be deleted.
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

// This is the first of many functions that take a build a transaction and then wrap the transaction up in a batch (multiple transactions can be in a batch).
// This particular function constructs the payload of the transaction.  This provides the validator and transaction processor with addressing information
// and instructions on how the node's state database should be modified.

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

// All of these functions wrap a payload up in a transaction and then wrap the transaction up in a batch.
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
// The transaction is taken and is wrapped up in a batch file.
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

// This function fetches an individual wine batch from the blockchain (and then decodes it into something readable)
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

// This function fetches all of a winery's winebatches from the blockchain.
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
