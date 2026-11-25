import { z } from "zod";

export const leconSchema = z.object({
    title: z.string().min(1, { message: "Le titre de la leçon est requis" }),
    content: z.string().optional(),
    moduleId: z.string().uuid({ message: "L'ID du module doit être un UUID valide" }),
    duree: z.string().min(1, { message: "La durée de la leçon est requise" }),
});

export const LeconIsParamSchema = z.object({
    id: z.string().uuid(),
});

export type CreateLeconRecord = z.infer<typeof leconSchema>;