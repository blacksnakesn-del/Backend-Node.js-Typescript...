import { Lecons } from '../lecons/lecons.model.js';

export interface ILeconsRepository {
  findById(id: string): Promise<Lecons | null>;
  findByName(name: string): Promise<Lecons | null>;
  create(data: CreateLeconsRecord): Promise<Lecons>;
  updateName(id: string, name: string): Promise<Lecons | null>;
  updateDescription(id: string, description: string): Promise<Lecons | null>;
  updateDuree(id: string, duree: string): Promise<Lecons | null>;
  updateModuleId(id: string, moduleId: string): Promise<Lecons | null>;
  delete(id: string): Promise<void>;
}

export interface CreateLeconsRecord {
  name: string;
  description?: string;
  duree: string;
  moduleId: string;
}

export class LeconsRepository implements ILeconsRepository {
  async findById(id: string): Promise<Lecons | null> {
    return Lecons.findByPk(id);
  }

  async findByName(name: string): Promise<Lecons | null> {
    return Lecons.findOne({ where: { name } });
  }

  async create(data: CreateLeconsRecord): Promise<Lecons> {
    return Lecons.create(data);
  }

  async updateName(id: string, name: string): Promise<Lecons | null> {
    const lecon = await this.findById(id);
    if (!lecon) return null;
    lecon.name = name;
    await lecon.save();
    return lecon;
  }

  async updateDescription(id: string, description: string): Promise<Lecons | null> {
    const lecon = await this.findById(id);
    if (!lecon) return null;
    lecon.description = description;
    await lecon.save();
    return lecon;
  }

  async updateDuree(id: string, duree: string): Promise<Lecons | null> {
    const lecon = await this.findById(id);
    if (!lecon) return null;
    lecon.duree = duree;
    await lecon.save();
    return lecon;
  }

  async updateModuleId(id: string, moduleId: string): Promise<Lecons | null> {
    const lecon = await this.findById(id);
    if (!lecon) return null;
    lecon.moduleId = moduleId;
    await lecon.save();
    return lecon;
  }

  async delete(id: string): Promise<void> {
    const lecon = await this.findById(id);
    if (lecon) {
      await lecon.destroy();
    }
  }
}