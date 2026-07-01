export type EstatusEvento = 'pendiente' | 'confirmado' | 'cancelado'

export interface EventoAgenda {
  id: string
  titulo: string
  fecha_inicio: string
  fecha_fin: string
  notas?: string
  estatus: EstatusEvento
}
