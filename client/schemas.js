const Joi = require('joi');

module.exports.wineBatchSchema = Joi.object({
	winebatch: Joi.object({
		batch_name: Joi.string().required(),
		wine_name: Joi.string().required(),
		num_bottles: Joi.number().required().min(0),
		style: Joi.string().required(),
		alcohol: Joi.number().required().min(0),
		ava: Joi.string().required(),
		acidity: Joi.number().required().min(0),
		grape_variety: Joi.string().required(),
		harvest_loc: Joi.string().required(),
		harvest_date: Joi.date().raw().required(),
		bottle_date: Joi.date().raw().required(),
		avg_sunshine: Joi.number().required().min(0),
		avg_temp: Joi.number().required().min(0),
		tannins: Joi.number().required().min(0),
		comments: Joi.string().required(),
	}).required()
});