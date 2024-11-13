import Joi from 'joi';
import { UUIDTypes } from 'uuid';

export interface Category {
  id: UUIDTypes;

  name: string;

  description: string;

  enabled: boolean;

  depth: number;

  parentId: Category['id'];

  pathCategory: string;

  children: Category['id'][];

  createdAt: Date;

  updatedAt: Date;

  deletedAt: Date | null;

  deleted: boolean;
}

export const categorySchema = Joi.object<Category>({
  id: Joi.string().uuid(),

  name: Joi.string().min(3).max(100).required(),

  description: Joi.string().max(500).required(),

  enabled: Joi.boolean().required(),

  pathCategory: Joi.string(),

  depth: Joi.number().integer().min(0).max(5),

  parentId: Joi.string().uuid().allow(null),

  children: Joi.array().items(Joi.string()).max(20),

  createdAt: Joi.date().iso(),

  updatedAt: Joi.date().iso(),

  deletedAt: Joi.date().iso().allow(null),

  deleted: Joi.boolean().required(),
});
