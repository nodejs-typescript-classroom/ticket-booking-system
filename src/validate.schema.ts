import * as Joi from 'joi';

export const validateSchema = Joi.object({
  JWT_ACCESS_TOKEN_SECRET: Joi.string().required(),
  JWT_ACCESS_TOKEN_EXPIRATION_MS: Joi.number().required(),
  JWT_REFRESH_TOKEN_SECRET: Joi.string().required(),
  JWT_REFRESH_TOKEN_EXPIRATION_MS: Joi.number().required(),
  DB_URI: Joi.string().required(),
  NODE_ENV: Joi.string()
});