const express = require("express");
const bodyParser = require("body-parser");

const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

/**
 * Need to be modulirized later
 * Sigining and forwarding transaction
 */

const API_URL = "http://localhost:8008";

const { createContext, CryptoFactory } = require("sawtooth-sdk/signing");
const { createHash } = require("crypto");
const { protobuf } = require("sawtooth-sdk");
const axios = require("axios").default;

const context = createContext("secp256k1");
const privateKey = context.newRandomPrivateKey();
const signer = new CryptoFactory(context).newSigner(privateKey);
console.log(signer);

const _hash = (input, length) =>
	createHash("sha512")
		.update(input)
		.digest("hex")
		.toLowerCase()
		.slice(0, length);

const TP_FAMILY = "winebatches";
const TP_NAMESPACE = _hash(TP_FAMILY).substr(0, 6);
const TP_VERSION = "1.0";

app.get("/add", async (req, res) => {
	console.log("idiot");

	const payload = {
		action: "CREATE_BATCH",
		oName: 'bestWines',
		bName: "PN10",
		value: {
            bName: 'PN10',
			numBottles: 100,
			barrel: "WHITE OAK",
		},
	};
	let address = TP_NAMESPACE + _hash(payload.oName, 16) + _hash(payload.bName, 48)
	// Input for one transaction
	const payloadBytes = Buffer.from(JSON.stringify(payload));
	console.log(payload);

	// Output we created with this transaction input

	const transactionHeaderBytes = protobuf.TransactionHeader.encode({
		familyName: TP_FAMILY,
		familyVersion: TP_VERSION,
		// Needs to be same as the expected address we create in contract
		// If diffrent we wont get access to put state and get state of the address
		inputs: [address],
		outputs: [address],
		signerPublicKey: signer.getPublicKey().asHex(),
		batcherPublicKey: signer.getPublicKey().asHex(),
		dependencies: [],
		payloadSha512: createHash("sha512").update(payloadBytes).digest("hex"),
	}).finish();

	const signature = signer.sign(transactionHeaderBytes);

	// Sign the transaction
	const transaction = protobuf.Transaction.create({
		header: transactionHeaderBytes,
		headerSignature: signature,
		payload: payloadBytes,
	});

	// Wrap it into list of transaction
	const transactions = [transaction];

	const batchHeaderBytes = protobuf.BatchHeader.encode({
		signerPublicKey: signer.getPublicKey().asHex(),
		transactionIds: transactions.map((txn) => txn.headerSignature),
	}).finish();

	// Wrap the transaction list into batch
	const batchSignature = signer.sign(batchHeaderBytes);

	// And sign it
	const batch = protobuf.Batch.create({
		header: batchHeaderBytes,
		headerSignature: batchSignature,
		transactions: transactions,
	});

	// Wrap them in batch list
	const batchListBytes = protobuf.BatchList.encode({
		batches: [batch],
	}).finish();
	axios
		.post(`${API_URL}/batches`, batchListBytes, {
			headers: { "Content-Type": "application/octet-stream" },
		})
		.then((response) => {
			console.log({
				address,
				TP_NAMESPACE,
			});
			console.log(response.data);

			res.send({
				message: "submitted",
				data: response.data,
			});
		})
		.catch((error) => {
			console.error(error);
			res.send({
				message: "submitted",
				error: error.response.data,
			});
		});
});

app.get("/update", async (req, res) => {
	console.log("idiot");

	const payload = {
		action: "UPDATE_BATCH",
		oName: "bestWines",
		bName: "PN10",
		value: {
			bName: "PN10",
			numBottles: 50,
			barrel: "IDIOT OAK",
		},
	};
	let address =
		TP_NAMESPACE + _hash(payload.oName, 16) + _hash(payload.bName, 48);
	// Input for one transaction
	const payloadBytes = Buffer.from(JSON.stringify(payload));
	console.log(payload);

	// Output we created with this transaction input

	const transactionHeaderBytes = protobuf.TransactionHeader.encode({
		familyName: TP_FAMILY,
		familyVersion: TP_VERSION,
		// Needs to be same as the expected address we create in contract
		// If diffrent we wont get access to put state and get state of the address
		inputs: [address],
		outputs: [address],
		signerPublicKey: signer.getPublicKey().asHex(),
		batcherPublicKey: signer.getPublicKey().asHex(),
		dependencies: [],
		payloadSha512: createHash("sha512").update(payloadBytes).digest("hex"),
	}).finish();

	const signature = signer.sign(transactionHeaderBytes);

	// Sign the transaction
	const transaction = protobuf.Transaction.create({
		header: transactionHeaderBytes,
		headerSignature: signature,
		payload: payloadBytes,
	});

	// Wrap it into list of transaction
	const transactions = [transaction];

	const batchHeaderBytes = protobuf.BatchHeader.encode({
		signerPublicKey: signer.getPublicKey().asHex(),
		transactionIds: transactions.map((txn) => txn.headerSignature),
	}).finish();

	// Wrap the transaction list into batch
	const batchSignature = signer.sign(batchHeaderBytes);

	// And sign it
	const batch = protobuf.Batch.create({
		header: batchHeaderBytes,
		headerSignature: batchSignature,
		transactions: transactions,
	});

	// Wrap them in batch list
	const batchListBytes = protobuf.BatchList.encode({
		batches: [batch],
	}).finish();
	axios
		.post(`${API_URL}/batches`, batchListBytes, {
			headers: { "Content-Type": "application/octet-stream" },
		})
		.then((response) => {
			console.log({
				address,
				TP_NAMESPACE,
			});
			console.log(response.data);

			res.send({
				message: "submitted",
				data: response.data,
			});
		})
		.catch((error) => {
			console.error(error);
			res.send({
				message: "submitted",
				error: error.response.data,
			});
		});
});

app.get("/delete", async (req, res) => {
	console.log("idiot");

	const payload = {
		action: "DELETE_BATCH",
		oName: "bestWines",
		bName: "PN10",
	};
	let address =
		TP_NAMESPACE + _hash(payload.oName, 16) + _hash(payload.bName, 48);
	// Input for one transaction
	const payloadBytes = Buffer.from(JSON.stringify(payload));
	console.log(payload);

	// Output we created with this transaction input

	const transactionHeaderBytes = protobuf.TransactionHeader.encode({
		familyName: TP_FAMILY,
		familyVersion: TP_VERSION,
		// Needs to be same as the expected address we create in contract
		// If diffrent we wont get access to put state and get state of the address
		inputs: [address],
		outputs: [address],
		signerPublicKey: signer.getPublicKey().asHex(),
		batcherPublicKey: signer.getPublicKey().asHex(),
		dependencies: [],
		payloadSha512: createHash("sha512").update(payloadBytes).digest("hex"),
	}).finish();

	const signature = signer.sign(transactionHeaderBytes);

	// Sign the transaction
	const transaction = protobuf.Transaction.create({
		header: transactionHeaderBytes,
		headerSignature: signature,
		payload: payloadBytes,
	});

	// Wrap it into list of transaction
	const transactions = [transaction];

	const batchHeaderBytes = protobuf.BatchHeader.encode({
		signerPublicKey: signer.getPublicKey().asHex(),
		transactionIds: transactions.map((txn) => txn.headerSignature),
	}).finish();

	// Wrap the transaction list into batch
	const batchSignature = signer.sign(batchHeaderBytes);

	// And sign it
	const batch = protobuf.Batch.create({
		header: batchHeaderBytes,
		headerSignature: batchSignature,
		transactions: transactions,
	});

	// Wrap them in batch list
	const batchListBytes = protobuf.BatchList.encode({
		batches: [batch],
	}).finish();
	axios
		.post(`${API_URL}/batches`, batchListBytes, {
			headers: { "Content-Type": "application/octet-stream" },
		})
		.then((response) => {
			console.log({
				address,
				TP_NAMESPACE,
			});
			console.log(response.data);

			res.send({
				message: "submitted",
				data: response.data,
			});
		})
		.catch((error) => {
			console.error(error);
			res.send({
				message: "submitted",
				error: error.response.data,
			});
		});
});

app.get("/fetch", async (req, res) => {
	let address = TP_NAMESPACE + _hash("bestWines",16) + _hash("PN10", 48);
	const idiot = fetchowners(address)
	idiot.then(function(result) {
        console.log(result);
        console.log(typeof result)
        res.send(result);
    }).catch((error) =>{
		res.send("NO LUCK, MATE");
		console.log(error);
	})
});
const fetchowners = (address) => {
	return axios.get(`${API_URL}/state/${address}`).then(response => {
        // let idiot = Array.from(response.data)
        // return response.data.map(entity => {
        //     const decoded = JSON.parse(
		// 					Buffer.from(entity.data, "base64").toString()
        //                 );
        //                 console.log(decoded);
        //     return decoded;
        // })
        console.log(typeof Buffer.from(response.data.data, 'base64').toString('utf8'));
        console.log(response.data);
        return Buffer.from(response.data.data, "base64").toString(
					"utf8"
				);
        //return console.log(typeof response.data.data);
        //const decoded = JSON.parse(Buffer.from(data.data, "base64").toString());
        // return decoded;
        //console.dir(data)
        //console.dir(data.data)
        //console.log(data.data);
        //console.log(typeof data.data);
	});
};

app.listen(8080, () => console.log("Server started"));
