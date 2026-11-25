import { AuthAuditEvent } from '../modules/auth/auth-audit-event.model.js'
import { OneTimeToken } from '../modules/auth/one-time-token.model.js'
import { RefreshToken } from '../modules/auth/refresh-token.model.js'
import { User } from '../modules/users/user.model.js'
import { sequelize } from './sequelize.js'
import { Cours } from '../modules/cours/cours.models.js'
import { Module } from '../modules/module/module.model.js'
import { Lecons } from '../modules/lecons/lecons.model.js'
import { Inscription } from '../modules/inscription/inscription.model.js'
import { InscriptionProgress } from '../modules/inscription/inscription-progress.model.js'

let initialized = false

export function initializeModels(): void {
  if (initialized) return

  User.initModel(sequelize)
  Cours.initModel(sequelize)
  Module.initModel(sequelize)
  Lecons.initModel(sequelize)
  RefreshToken.initModel(sequelize)
  OneTimeToken.initModel(sequelize)
  AuthAuditEvent.initModel(sequelize)
  Inscription.initModel(sequelize)
  InscriptionProgress.initModel(sequelize)
  User.hasMany(RefreshToken, {
    foreignKey: 'userId',
    as: 'refreshTokens',
    onDelete: 'CASCADE',
  })
  RefreshToken.belongsTo(User, { foreignKey: 'userId', as: 'user' })
  RefreshToken.belongsTo(RefreshToken, {
    foreignKey: 'replacedById',
    as: 'replacement',
  })

  User.hasMany(OneTimeToken, {
    foreignKey: 'userId',
    as: 'oneTimeTokens',
    onDelete: 'CASCADE',
  })
  OneTimeToken.belongsTo(User, { foreignKey: 'userId', as: 'user' })

  User.hasMany(AuthAuditEvent, {
    foreignKey: 'userId',
    as: 'authAuditEvents',
    onDelete: 'SET NULL',
  })
  AuthAuditEvent.belongsTo(User, { foreignKey: 'userId', as: 'user' })

  User.hasMany(Cours, { foreignKey: 'proffesseur', as: 'coursEnseignes' })
  Cours.belongsTo(User, { foreignKey: 'proffesseur', as: 'professeur' })

  Cours.hasMany(Module, {
    foreignKey: 'coursId',
    as: 'modules',
    onDelete: 'CASCADE',
  })
  Module.belongsTo(Cours, { foreignKey: 'coursId', as: 'cours' })
  Module.hasMany(Lecons, {
    foreignKey: 'moduleId',
    as: 'lecons',
    onDelete: 'CASCADE',
  })
  Lecons.belongsTo(Module, { foreignKey: 'moduleId', as: 'module' })

  Inscription.belongsTo(User, { foreignKey: 'userId', as: 'user' })
  Inscription.belongsTo(Cours, { foreignKey: 'coursId', as: 'cours' })
  User.hasMany(Inscription, { foreignKey: 'userId', as: 'inscriptions', onDelete: 'CASCADE' })
  Cours.hasMany(Inscription, { foreignKey: 'coursId', as: 'inscriptions', onDelete: 'CASCADE' })
  Inscription.hasMany(InscriptionProgress, {
    foreignKey: 'inscriptionId',
    as: 'progressions',
    onDelete: 'CASCADE',
  })
  InscriptionProgress.belongsTo(Inscription, { foreignKey: 'inscriptionId', as: 'inscription' })
  Lecons.hasMany(InscriptionProgress, {
    foreignKey: 'lessonId',
    as: 'inscriptionProgressions',
    onDelete: 'CASCADE',
  })
  InscriptionProgress.belongsTo(Lecons, { foreignKey: 'lessonId', as: 'lesson' })

  initialized = true
}

export const Models = {
  User,
  RefreshToken,
  OneTimeToken,
  AuthAuditEvent,
  Cours,
  Module,
  Lecons,
  Inscription,
  InscriptionProgress,
}
