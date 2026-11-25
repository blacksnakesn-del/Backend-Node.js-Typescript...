import { CreationOptional, InferAttributes, InferCreationAttributes, Model, Sequelize } from "sequelize";

export class Lecons extends Model<InferAttributes<Lecons>, InferCreationAttributes<Lecons>> {
    declare id: CreationOptional<string>
    declare name: string
    declare description: CreationOptional<string | null>
    declare duree: CreationOptional<string | null>
    declare moduleId: string

    static initModel(sequelize: Sequelize): typeof Lecons {
        Lecons.init(
            {
                id: { type: "UUID", defaultValue: "UUIDV4", primaryKey: true },
                name: { type: "STRING(200)", allowNull: false },
                description: { type: "STRING()", allowNull: true },
                duree: { type: "TIME", allowNull: true },
                moduleId: { type: "UUID", allowNull: false, field: 'module_id' },
            },
            { sequelize, tableName: 'lecons', modelName: 'Lecons', underscored: true },
        )
        return Lecons
    }

    toSafeJSON() {
        return {
            id: this.id,
            name: this.name,
            description: this.description,
            duree: this.duree,
            moduleId: this.moduleId
        }
    }
}