const { TransactionHandler } = require("sawtooth-sdk/processor/handler");
const { InvalidTransaction } = require("sawtooth-sdk/processor/exceptions");

const { createHash } = require("crypto");

const _hash = (input, length) =>
	createHash("sha512")
		.update(input)
		.digest("hex")
		.toLowerCase()
		.slice(0, length);

const TP_FAMILY = "winebatches";
const TP_NAMESPACE = _hash(TP_FAMILY, 6);
const TP_VERSION = "1.0";
class Handler extends TransactionHandler {
	constructor() {
		super(TP_FAMILY, [TP_VERSION], [TP_NAMESPACE]);
	}

	// Properties of `txn`:
	// - txn.payload: the encoded payload sent from your client
	// - txn.header: the decoded TransactionHeader for this transaction
	// - txn.signature: the hex signature of the header

	//  Methods of `context`:
	//    - context.getState(addresses): takes an array of addresses and returns
	//      a Promise which will resolve with the requested state. The state
	//      object will have keys which are addresses, and values that are encoded
	//      state resources.
	//    - context.setState(updates): takes an update object and returns a
	//      Promise which will resolve with an array of the successfully
	//      updated addresses. The updates object should have keys which are
	//      addresses, and values which are encoded state resources.
	//    - context.deleteState(addresses): deletes the state for the passed
	//      array of state addresses. Only needed if attempting the extra credit.

	// properties of payload:
	// payload.action = what we want to do with payload
	// payload.name = maybe name of winery?
	// payload value = {wine batch data, I guess}
	apply(txn, context) {
		let payload = null;
		try {
			payload = JSON.parse(txn.payload.toString());
		} catch (err) {
			throw new InvalidTransaction("Failed to decode payload: " + err);
		}

		const action = payload.action;
		const publicKey = txn.header.signerPublicKey;
		console.log(action);

		if (action === "CREATE_BATCH") {
			const address = `${TP_NAMESPACE}${_hash(payload.oName, 16)}${_hash(payload.bName, 48)}`;
			console.log(address);
			console.log(payload.value);
			let wineBatch = {
				bName: payload.value.bName,
				numBottles: payload.value.numBottles,
				barrel: payload.value.barrel,
			};
			let entries = {
				[address]: Buffer.from(new String(JSON.stringify(wineBatch))),
			};
			return context.setState(entries).catch((error) => {
				let message = error.message ? error.message : error;
				throw new InvalidTransaction(message);
			});
		}
		else if (action === "UPDATE_BATCH") {
			const address = `${TP_NAMESPACE}${_hash(payload.oName, 16)}${_hash(
				payload.bName,
				48
			)}`;
			console.log(address);
			console.log(payload.value);
			let wineBatch = {
				bName: payload.value.bName,
				numBottles: payload.value.numBottles,
				barrel: payload.value.barrel,
			};
			let entries = {
				[address]: Buffer.from(new String(JSON.stringify(wineBatch))),
			};
			return context.setState(entries).catch((error) => {
				let message = error.message ? error.message : error;
				throw new InvalidTransaction(message);
			});
		}
		// const address = `${TP_NAMESPACE}${_hash("sampleKey", 64)}`;
		else if (action === "DELETE_BATCH") {
			const address = `${TP_NAMESPACE}${_hash(payload.oName, 16)}${_hash(
				payload.bName,
				48
			)}`;
			console.log(address);
			console.log(payload.value);
			
			// let entries = {
			// 	[address]: Buffer.from(new String(JSON.stringify(wineBatch))),
			// };
			return context.deleteState([address]).catch((error) => {
				let message = error.message ? error.message : error;
				throw new InvalidTransaction(message);
			});
		}
		// const address = `${TP_NAMESPACE}${_hash("sampleKey", 64)}`;

		// let entries = {
		// 	[address]: Buffer.from(new String(JSON.stringify("somevalue"))),
		// };
		// return context.setState(entries).catch((error) => {
		// 	let message = error.message ? error.message : error;
		// 	throw new InvalidTransaction(message);
		// });
	}
}

module.exports = Handler;
