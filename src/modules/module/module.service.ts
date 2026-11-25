import { ModuleRepository, type CreateModuleRecord } from '../module/module.repositry.js';
import { Module } from '../module/module.model.js';
 
export class ModuleService {
    constructor(private readonly moduleRepository: ModuleRepository = new ModuleRepository()) { }

    async createModule(data: CreateModuleRecord): Promise<Module> {
        const existingModule = await this.moduleRepository.findByName(data.name);
        if (existingModule) {
            throw new Error("Un module avec ce nom existe déjà.");
        }
        return this.moduleRepository.create(data);
    }
    async listModules(): Promise<Module[]> {
        return this.moduleRepository.findAll();
    }

    async getModuleById(id: string): Promise<Module | null> {
        return this.moduleRepository.findById(id);
    }

    async updateModuleName(id: string, name: string): Promise<Module | null> {
        return this.moduleRepository.updateName(id, name);
    }

    async deleteModule(id: string): Promise<void> {
        await this.moduleRepository.delete(id);
    }

}