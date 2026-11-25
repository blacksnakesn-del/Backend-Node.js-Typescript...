import {
  CreationOptional,
  DataTypes,
  InferAttributes,
  InferCreationAttributes,
  Model,
  Sequelize,
} from 'sequelize'

export class InscriptionProgress extends Model<
  InferAttributes<InscriptionProgress>,
  InferCreationAttributes<InscriptionProgress>
> {
  declare id: CreationOptional<string>
  declare inscriptionId: string
  declare lessonId: string
  declare progress: number
  declare createdAt: CreationOptional<Date>
  declare updatedAt: CreationOptional<Date>

  static initModel(sequelize: Sequelize): typeof InscriptionProgress {
    InscriptionProgress.init(
      {
        id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
        inscriptionId: {
          type: DataTypes.UUID,
          allowNull: false,
          field: 'inscription_id',
        },
        lessonId: { type: DataTypes.UUID, allowNull: false, field: 'lesson_id' },
        progress: { type: DataTypes.TINYINT.UNSIGNED, allowNull: false, defaultValue: 0 },
        createdAt: { type: DataTypes.DATE, allowNull: false, field: 'created_at' },
        updatedAt: { type: DataTypes.DATE, allowNull: false, field: 'updated_at' },
      },
      {
        sequelize,
        tableName: 'inscription_progressions',
        modelName: 'InscriptionProgress',
        underscored: true,
        indexes: [
          {
            unique: true,
            fields: ['inscription_id', 'lesson_id'],
            name: 'inscription_progression_uq',
          },
        ],
      },
    )
    return InscriptionProgress
  }

  toSafeJSON() {
    return {
      id: this.id,
      inscription_id: this.inscriptionId,
      lesson_id: this.lessonId,
      progress: this.progress,
      created_at: this.createdAt,
      updated_at: this.updatedAt,
    }
  }
}
