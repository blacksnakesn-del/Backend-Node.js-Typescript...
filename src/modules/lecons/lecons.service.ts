import { Lecons } from "./lecons.model.js";
import { LeconsRepository, type CreateLeconsRecord, type ILeconsRepository } from '../lecons/lecons.repository.js';

export class LeconsService {
    constructor(private readonly leconsRepository: ILeconsRepository = new LeconsRepository()) {}

    async createLecons(data: CreateLeconsRecord): Promise<Lecons> {
        const existingLecons = await this.leconsRepository.findByName(data.name);
        if (existingLecons) {
            throw new Error("Une leçon avec ce nom existe déjà.");
        }
        return this.leconsRepository.create(data);
    }

    async getLeconsById(id: string): Promise<Lecons | null> {
        return this.leconsRepository.findById(id);
    }

    async updateLeconsName(id: string, name: string): Promise<Lecons | null> {
        return this.leconsRepository.updateName(id, name);
    }

    async updateLeconsDescription(id: string, description: string): Promise<Lecons | null> {
        return this.leconsRepository.updateDescription(id, description);
    }

    async updateLeconsDuree(id: string, duree: string): Promise<Lecons | null> {
        return this.leconsRepository.updateDuree(id, duree);
    }

    async updateLeconsModuleId(id: string, moduleId: string): Promise<Lecons | null> {
        return this.leconsRepository.updateModuleId(id, moduleId);
    }

    async deleteLecons(id: string): Promise<void> {
        await this.leconsRepository.delete(id);
    }
}