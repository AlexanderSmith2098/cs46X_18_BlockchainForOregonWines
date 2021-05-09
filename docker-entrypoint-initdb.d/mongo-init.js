// Database initialization info necessary to set up the mongodb container

db.createUser({
	user: "winery",
	pwd: "pass",
	roles: [
		{
			role: "readWrite",
			db: "oregon-wines",
		},
	],
});

db.createUser({
	user: "customer",
	pwd: "pass",
	roles: [
		{
			role: "readWrite",
			db: "oregon-wines",
		},
	],
});
