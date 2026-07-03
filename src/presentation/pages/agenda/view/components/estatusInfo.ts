import type { EstatusEvento } from '../../../../../domain/entities/db/local/evento'

export interface EstatusInfo {
  key: EstatusEvento
  label: string
}

export const ESTATUS_INFO: EstatusInfo[] = [
  { key: 'pendiente', label: 'Pendiente' },
  { key: 'confirmado', label: 'Confirmado' },
  { key: 'cancelado', label: 'Cancelado' },
]
