import type { EventoAgenda } from '../../../domain/entities/db/local/evento'

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

export function listarEventos(): EventoAgenda[] {
  return leer()
}

export function crearEvento(input: Omit<EventoAgenda, 'id'>): EventoAgenda {
  const evento: EventoAgenda = { ...input, id: crypto.randomUUID() }
  escribir([...leer(), evento])
  return evento
}

export function actualizarEvento(evento: EventoAgenda): EventoAgenda {
  escribir(leer().map((e) => (e.id === evento.id ? evento : e)))
  return evento
}

export function eliminarEvento(id: string): void {
  escribir(leer().filter((e) => e.id !== id))
}
