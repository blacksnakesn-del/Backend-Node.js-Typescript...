import {
  CreationOptional,
  DataTypes,
  InferAttributes,
  InferCreationAttributes,
  Model,
  Sequelize,
} from 'sequelize'

export class Inscription extends Model<
  InferAttributes<Inscription>,
  InferCreationAttributes<Inscription>
> {
  declare id: CreationOptional<string>
  declare coursId: string
  declare userId: string
  declare dateInscription: CreationOptional<Date>
  declare createdAt: CreationOptional<Date>
  declare updatedAt: CreationOptional<Date>

  static initModel(sequelize: Sequelize): typeof Inscription {
    Inscription.init(
      {
        id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
        coursId: { type: DataTypes.UUID, allowNull: false, field: 'cours_id' },
        userId: { type: DataTypes.UUID, allowNull: false, field: 'user_id' },
        dateInscription: {
          type: DataTypes.DATE,
          allowNull: false,
          defaultValue: DataTypes.NOW,
          field: 'date_inscription',
        },
        createdAt: { type: DataTypes.DATE, allowNull: false, field: 'created_at' },
        updatedAt: { type: DataTypes.DATE, allowNull: false, field: 'updated_at' },
      },
      { sequelize, tableName: 'inscriptions', modelName: 'Inscription', underscored: true },
    )
    return Inscription
  }

  toSafeJSON() {
    return {
      id: this.id,
      cours_id: this.coursId,
      user_id: this.userId,
      date_inscription: this.dateInscription,
      created_at: this.createdAt,
      updated_at: this.updatedAt,
    }
  }
}
