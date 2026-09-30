import type { NextFunction, Request, Response } from "express";

import type { ValidationBody, ValidationError } from "@/utils/validators";

export type Validator = (body: ValidationBody) => ValidationError;

export function validateBody(validator: Validator) {
	return (req: Request, res: Response, next: NextFunction): void => {
		const error = validator((req.body ?? {}) as ValidationBody);

		if (error) {
			res.status(400).json({ error });
			return;
		}

		next();
	};
}
