// This file either reads environment variables or uses hardcoded values.  This is the information that the client needs to connect to the mongodb that is setup on docker.
const mongoHost = process.env.MONGO_HOST || "localhost"
const mongoPort = process.env.MONGO_PORT || 3300
const mongoUser = process.env.MONGO_USER || "winery"
const mongoPassword = process.env.MONGO_PASSWORD || "pass"
const mongoDBName = process.env.MONGO_DB_NAME || "oregon-wines"
const mongoURL = `mongodb://${mongoUser}:${mongoPassword}@${mongoHost}:${mongoPort}/${mongoDBName}`;
exports.mongoURL = mongoURL;
