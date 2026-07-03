import type { EventoAgenda } from '../entities/db/local/evento'

export interface EventosRepository {
  listar(): Promise<EventoAgenda[]>
  crear(input: Omit<EventoAgenda, 'id'>): Promise<EventoAgenda>
  actualizar(evento: EventoAgenda): Promise<EventoAgenda>
  eliminar(id: string): Promise<void>
}
