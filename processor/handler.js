// handler.js contains the business rules of our blockchain.  The validator sends batches/transactions to the transaction process.  The transaction process
// Unwraps everything and checks to make sure the proposed transaction is legal or not.  If it is, the state database on the node is updated according, and a new block
// is added to the blockchain.  If it isn't, a block is added to the blockchain showing that the proposed transaction was invalid.
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
	apply(txn, context) {
		let payload = null;
		try {
			payload = JSON.parse(txn.payload.toString());
		} catch (err) {
			throw new InvalidTransaction("Failed to decode payload: " + err);
		}
		// Each payload contains addressing information and proposed state changes.
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

// The transaction processor checks to make sure that the incoming transaction isn't asking for a duplicate winebatch to be created.
// If this isn't the case, the wine batch is created (by updating the state database).
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

// If an update batch request is received, the transaction processor needs to first check to make sure that the winebatch exists.  If it does,
// then the winebatch is updated.  
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

// If a delete batch request is received, the transaction processor needs to first check to see if the winebatch actually exists.  If it does,
// then the winebatch is deleted.
const delete_batch = (context, address) => {
	return context.getState([address]).then((state) => {
		console.log(state[address].length);
		if (state[address].length === 0) {
			throw "No Batch to delete!";
		}
		return context.deleteState([address]);
	});
};

// Taking information fro the incoming payload and creating a new object out of it.
const create_wineBatch = (payload) => {
	let wineBatch = {
		wID: payload.wID,
		status: payload.value.status,
		batch_name: payload.value.batch_name,
		wine_name: payload.value.wine_name,
		num_bottles: payload.value.num_bottles,
		style: payload.value.style,
		alcohol: payload.value.alcohol,
		ava: payload.value.ava,
		acidity: payload.value.acidity,
		grape_variety: payload.value.grape_variety,
		harvest_loc: payload.value.harvest_loc,
		harvest_date: payload.value.harvest_date,
		bottle_date: payload.value.bottle_date,
		avg_sunshine: payload.value.avg_sunshine,
		avg_temp: payload.value.avg_temp,
		tannins: payload.value.tannins,
		comments: payload.value.comments,
	};
	console.log(wineBatch);
	return wineBatch;
};

module.exports = Handler;
