import { Module } from '../module/module.model.js';
 

export interface IModuleRepository {
  findById(id: string): Promise<Module | null>;
  findAll(): Promise<Module[]>;
  findByName(name: string): Promise<Module | null>;
  create(data: CreateModuleRecord): Promise<Module>;
  updateName(id: string, name: string): Promise<Module | null>;
  updateNombreLecons(id: string, nombreLecons: number): Promise<Module | null>;
  delete(id: string): Promise<void>;
}

export interface CreateModuleRecord {
  name: string;
  description?: string;
  nombreLecons: number;
  coursId: string;
}

export class ModuleRepository implements IModuleRepository {
  async findById(id: string): Promise<Module | null> {
    return Module.findByPk(id);
  }

  async findByName(name: string): Promise<Module | null> {
    return Module.findOne({ where: { name } });
  }

  async findAll(): Promise<Module[]> {
    return Module.findAll();
  }

  async create(data: CreateModuleRecord): Promise<Module> {
    return Module.create(data);
  }

  async updateName(id: string, name: string): Promise<Module | null> {
    const mod = await this.findById(id);
    if (!mod) return null;
    mod.name = name;
    await mod.save();
    return mod;
  }

  async updateNombreLecons(id: string, nombreLecons: number): Promise<Module | null> {
    const mod = await this.findById(id);
    if (!mod) return null;
    mod.nombreLecons = nombreLecons;
    await mod.save();
    return mod;
  }

  async delete(id: string): Promise<void> {
    const mod = await this.findById(id);
    if (mod) {
      await mod.destroy();
    }
  }
}   