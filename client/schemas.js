const Joi = require('joi');

module.exports.wineBatchSchema = Joi.object({
	winebatch: Joi.object({
		batch_name: Joi.string().required(),
		wine_name: Joi.string().required(),
		num_bottles: Joi.number().required().min(0),
		style: Joi.string().required(),
		alcohol: Joi.string().required(),
		ava: Joi.string().required(),
		acidity: Joi.string().required(),
		grape_variety: Joi.string().required(),
		harvest_loc: Joi.string().required(),
		harvest_date: Joi.string().required(),
		bottle_date: Joi.string().required(),
		avg_sunshine: Joi.string().required(),
		avg_temp: Joi.string().required(),
		tannins: Joi.string().required(),
		comments: Joi.string().required(),
	}).required()
});