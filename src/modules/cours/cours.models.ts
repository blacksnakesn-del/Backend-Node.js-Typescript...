import { 
    CreationOptional, 
    InferAttributes, 
    InferCreationAttributes, 
    Model, 
    Sequelize 
} from "sequelize";
import { DataTypes } from "sequelize";
import {
    COURSE_CATEGORIES,
    COURSE_LEVELS,
    type CourseCategory,
    type CourseLevel,
} from "./cours.constants.js";

export class Cours extends Model<InferAttributes<Cours>, InferCreationAttributes<Cours>> {
    declare id: CreationOptional<string>
    declare name: string
    declare description: string
    declare summary: CreationOptional<string | null>
    declare level: CreationOptional<CourseLevel | null>
    declare proffesseur: string
    declare capacite: number
    declare lieu: string
    declare category: CreationOptional<CourseCategory>
    declare published: CreationOptional<boolean>

    static initModel(sequelize: Sequelize): typeof Cours {
        Cours.init(
            {
                id: { type: "UUID", defaultValue: "UUIDV4", primaryKey: true },
                name: { type: "STRING(200)", allowNull: true },
                description: { type: "STRING()", allowNull: true },
                summary: { type: "TEXT", allowNull: true },
                level: { type: DataTypes.ENUM(...COURSE_LEVELS), allowNull: true },
                proffesseur: { type: DataTypes.UUID, allowNull: false },
                capacite: { type: "INTEGER.UNSIGNED", allowNull: true },
                lieu: { type: "STRING(200)", allowNull: false },
                category: { type: DataTypes.ENUM(...COURSE_CATEGORIES), allowNull: false, defaultValue: 'web' },
                published: { type: "BOOLEAN", allowNull: false, defaultValue: false },
            },
            { sequelize, tableName: 'cours', modelName: 'Cours', underscored: true },
        )
        return Cours
    }

    toSafeJSON() {
        return {
            id: this.id,
            name: this.name,
            description: this.description,
            summary: this.summary,
            level: this.level,
            proffesseur: this.proffesseur,
            capacite: this.capacite,
            lieu: this.lieu,
            category: this.category,
            published: this.published,
        }
    }

}
