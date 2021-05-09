// This file contains information necessary to connect to mongodb.
const mongoHost = process.env.MONGO_HOST || "localhost";
const mongoPort = process.env.MONGO_PORT || "27017";
const mongoUser = process.env.MONGO_USER || "customer";
const mongoPassword = process.env.MONGO_PASSWORD || "pass";
const mongoDBName = process.env.MONGO_DB_NAME || "oregon-wines";
const mongoURL = `mongodb://${mongoUser}:${mongoPassword}@${mongoHost}:${mongoPort}/${mongoDBName}`;
exports.mongoURL = mongoURL;
