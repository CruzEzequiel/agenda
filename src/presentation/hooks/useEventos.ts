import { useCallback, useEffect, useState } from 'react'
import type { EventoAgenda } from '../../domain/entities/db/local/evento'
import { eventosApi } from '../../infrastructure/api/eventosApi'

export function useEventos() {
  const [eventos, setEventos] = useState<EventoAgenda[]>([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const recargar = useCallback(async () => {
    setCargando(true)
    setError(null)
    try {
      setEventos(await eventosApi.listar())
    } catch {
      setError('No se pudieron cargar los eventos.')
    } finally {
      setCargando(false)
    }
  }, [])

  useEffect(() => {
    recargar()
  }, [recargar])

  const guardar = useCallback(async (input: Omit<EventoAgenda, 'id'> & { id?: string }) => {
    if (input.id) {
      const actualizado = await eventosApi.actualizar({ ...input, id: input.id })
      setEventos((prev) => prev.map((e) => (e.id === actualizado.id ? actualizado : e)))
      return actualizado
    }
    const creado = await eventosApi.crear(input)
    setEventos((prev) => [...prev, creado])
    return creado
  }, [])

  const eliminar = useCallback(async (id: string) => {
    await eventosApi.eliminar(id)
    setEventos((prev) => prev.filter((e) => e.id !== id))
  }, [])

  return { eventos, cargando, error, recargar, guardar, eliminar }
}
