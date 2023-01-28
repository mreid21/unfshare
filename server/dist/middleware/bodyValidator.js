"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const zod_1 = require("zod");
const validateBody = async (schema, body) => {
    try {
        await schema.parseAsync(body);
        return { result: body };
    }
    catch (error) {
        if (error instanceof zod_1.ZodError) {
            return { result: error };
        }
    }
    return { result: "Unexpected error" };
};
exports.default = validateBody;
