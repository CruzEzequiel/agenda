import type { EventoAgenda } from '../../../domain/entities/db/local/evento'
import type { EventosRepository } from '../../../domain/repositories/eventosRepository'

const KEY = 'agenda:eventos'

function leer(): EventoAgenda[] {
  const raw = localStorage.getItem(KEY)
  if (!raw) return []
  try {
    return JSON.parse(raw) as EventoAgenda[]
  } catch {
    return []
  }
}

function escribir(eventos: EventoAgenda[]): void {
  localStorage.setItem(KEY, JSON.stringify(eventos))
}

// Implementación basada en localStorage. El día que exista una base de
// datos real, se reemplaza por otra clase que cumpla EventosRepository
// (ej. hablando con un backend por fetch) sin tocar el resto de la app.
export const eventosLocalStorageRepository: EventosRepository = {
  async listar() {
    return leer()
  },

  async crear(input) {
    const evento: EventoAgenda = { ...input, id: crypto.randomUUID() }
    escribir([...leer(), evento])
    return evento
  },

  async actualizar(evento) {
    escribir(leer().map((e) => (e.id === evento.id ? evento : e)))
    return evento
  },

  async eliminar(id) {
    escribir(leer().filter((e) => e.id !== id))
  },
}
