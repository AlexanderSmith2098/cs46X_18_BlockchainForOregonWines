// This links the transaction process up with the validator.
const { TransactionProcessor } = require("sawtooth-sdk/processor");

const WineHandler = require("./handler");

// Uncomment this line if you don't want to run the transaction processor in a docker container.
// const transactionProcessor = new TransactionProcessor("tcp://localhost:4004");

// Comment this line of code if you uncomment the line up above.
const transactionProcessor = new TransactionProcessor(process.env.URL);

transactionProcessor.addHandler(new WineHandler());
transactionProcessor.start();

console.log("Started Transaction Processor");
