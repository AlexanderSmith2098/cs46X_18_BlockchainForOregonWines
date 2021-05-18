// This file either reads environment variables or uses hardcoded values.  This is the information that the client needs to connect to the mongodb that is setup on docker.
const mongoHost = process.env.MONGO_HOST
const mongoPort = process.env.MONGO_PORT
const mongoUser = process.env.MONGO_USER
const mongoPassword = process.env.MONGO_PASSWORD
const mongoDBName = process.env.MONGO_DB_NAME
const mongoURL = `mongodb://${mongoUser}:${mongoPassword}@${mongoHost}:${mongoPort}/${mongoDBName}`;
exports.mongoURL = mongoURL;
