import { CreationOptional, InferAttributes, InferCreationAttributes, Model, Sequelize } from "sequelize";

export class Module extends Model<InferAttributes<Module>, InferCreationAttributes<Module>> {
    declare id: CreationOptional<string>
    declare name: string
    declare description: CreationOptional<string | null>
    declare nombreLecons: number
    declare coursId: CreationOptional<string | null>

    static initModel(sequelize: Sequelize): typeof Module {
        Module.init(
            {
                id: { type: "UUID", defaultValue: "UUIDV4", primaryKey: true },
                name: { type: "STRING(200)", allowNull: false },
                description: { type: "STRING()", allowNull: true },
                nombreLecons: { type: "INTEGER()", allowNull: false, field: 'nombre_lecons' },
                coursId: { type: "UUID", allowNull: true, field: 'cours_id' },
            },
            { sequelize, tableName: 'modules', modelName: 'Module', underscored: true },
        )
        return Module
    }

    toSafeJSON() {
        return {
            id: this.id,
            name: this.name,
            description: this.description,
            nombreLecons: this.nombreLecons,
            coursId: this.coursId,
        }
    }
}