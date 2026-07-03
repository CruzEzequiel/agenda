import type { EventoAgenda } from '../../domain/entities/db/local/evento'
import type { EventosRepository } from '../../domain/repositories/eventosRepository'
import { eventosLocalStorageRepository } from '../data/local/eventos'

// Capa "API" simulada: expone la misma forma que tendría un cliente HTTP
// real (async, con latencia de red) mientras por debajo sigue usando
// localStorage. Cuando exista un backend, esta es la única pieza que se
// reemplaza (fetch/axios contra el servidor) — el resto de la app ya
// consume esta interfaz y no se entera del cambio.
const LATENCIA_SIMULADA_MS = 250

function delay<T>(valor: T): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(valor), LATENCIA_SIMULADA_MS))
}

const repo: EventosRepository = eventosLocalStorageRepository

export const eventosApi = {
  async listar(): Promise<EventoAgenda[]> {
    const eventos = await repo.listar()
    return delay(eventos)
  },

  async crear(input: Omit<EventoAgenda, 'id'>): Promise<EventoAgenda> {
    const evento = await repo.crear(input)
    return delay(evento)
  },

  async actualizar(evento: EventoAgenda): Promise<EventoAgenda> {
    const actualizado = await repo.actualizar(evento)
    return delay(actualizado)
  },

  async eliminar(id: string): Promise<void> {
    await repo.eliminar(id)
    return delay(undefined)
  },
}
