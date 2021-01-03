const Joi = require('joi');

module.exports.wineBatchSchema = Joi.object({
	winebatch: Joi.object({
		bName: Joi.string().required(),
		wName: Joi.string().required(),
		grapes: Joi.string().required(),	
		numBottles: Joi.number().required().min(0),
		gLocation: Joi.string().required(),
		barrel: Joi.string().required(),
		comments: Joi.string().required(),
	}).required()
});