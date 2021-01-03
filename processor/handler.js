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
		const address = `${TP_NAMESPACE}${_hash(payload.oName, 16)}${_hash(
			payload.wID,
			48
		)}`;

		if (action === "CREATE_BATCH") {
			return create_batch(context, payload, address).catch((error) => {
				console.log(error);
			});
		} else if (action === "UPDATE_BATCH") {
			return update_batch(context, payload, address).catch((error) => {
				console.log(error);
			});
		} else if (action === "DELETE_BATCH") {
			return delete_batch(context, address).catch((error) =>{
				console.log(error);
			})
		} else {
			throw new InvalidTransaction("Unknown action: " + action);
		}
	}
}
const create_batch = (context, payload, address) => {
	return context.getState([address]).then((state) => {
		if (state[address].length > 0) {
			throw "Wine Batch already exists!";
		}
		let wineBatch = create_wineBatch(payload);
		let entries = {
			[address]: Buffer.from(new String(JSON.stringify(wineBatch))),
		};
		return context.setState(entries);
	});
};
const update_batch = (context, payload, address) => {
	return context.getState([address]).then((state) => {
		console.log(state[address].length);
		if (state[address].length === 0) {
			throw "No Batch to update!";
		}
		let wineBatch = create_wineBatch(payload);
		let entries = {
			[address]: Buffer.from(new String(JSON.stringify(wineBatch))),
		};
		return context.setState(entries);
	});
};
const delete_batch = (context, address) => {
	return context.getState([address]).then((state) => {
		console.log(state[address].length);
		if (state[address].length === 0) {
			throw "No Batch to delete!";
		}
		return context.deleteState([address]);
	});
};

const create_wineBatch = (payload) => {
	let wineBatch = {

		wID: payload.wID,
		bName: payload.value.bName,
		wName: payload.value.wName,
		grapes: payload.value.grapes,
		numBottles: payload.value.numBottles,
		gLocation: payload.value.gLocation,
		barrel: payload.value.barrel,
		comments: payload.value.comments,
	};
	console.log(wineBatch);
	return wineBatch;
};

module.exports = Handler;
