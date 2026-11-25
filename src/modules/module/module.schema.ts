import { z } from "zod";

export const createModuleSchema = z.object({
    name: z.string().min(1, { message: "Le nom du module est requis" }),
    description: z.string().optional(),
    nombreLecons: z.number().int().min(1, { message: "Le nombre de leçons doit être un entier positif" }),
});

export const moduleSchema = createModuleSchema.extend({
    coursId: z.string().uuid({ message: "L'ID du cours doit être un UUID valide" }),
});

export type CreateModuleInput = z.infer<typeof createModuleSchema>;
export type CreateModuleRecord = z.infer<typeof moduleSchema>;