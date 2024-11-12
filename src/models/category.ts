import Joi from 'joi';

export interface Category {
  id: string;

  name: string;

  description: string;

  enabled: boolean;

  depth: number;

  parentId: Category['id'];

  // GSI
  pathCategory?: string;

  children: Category['id'][];

  createdAt: Date;

  updatedAt: Date;

  deletedAt: Date | null;

  deleted: boolean;
}

export const categorySchema = Joi.object<Category>({
  id: Joi.string(),

  name: Joi.string().min(3).max(100).required(),

  description: Joi.string().max(500).required(),

  enabled: Joi.boolean().required(),

  pathCategory: Joi.string(),

  depth: Joi.number().integer().min(0).max(5),

  parentId: Joi.string().uuid().required(),

  children: Joi.array().items(Joi.string().uuid()).max(20),

  createdAt: Joi.date().iso(),

  updatedAt: Joi.date().iso(),

  deletedAt: Joi.date().iso().allow(null),

  deleted: Joi.boolean().required(),
});

export function canAddChild(category: Category): boolean {
  return category.depth < 5 && category.children.length < 20;
}
