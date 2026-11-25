import { InscriptionProgress } from './inscription-progress.model.js'

export interface IInscriptionProgressRepository {
  setProgress(inscriptionId: string, lessonId: string, progress: number): Promise<InscriptionProgress>
}

export class InscriptionProgressRepository implements IInscriptionProgressRepository {
  async setProgress(
    inscriptionId: string,
    lessonId: string,
    progress: number,
  ): Promise<InscriptionProgress> {
    const [record, created] = await InscriptionProgress.findOrCreate({
      where: { inscriptionId, lessonId },
      defaults: { inscriptionId, lessonId, progress },
    })

    if (!created && record.progress !== progress) {
      record.progress = progress
      await record.save()
    }

    return record
  }
}
