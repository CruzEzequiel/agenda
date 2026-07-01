import { useState, useMemo, useEffect } from 'react'
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Clock3,
  FilePlus2,
  Filter,
  PanelLeft,
  Plus,
  Printer,
  RefreshCcw,
  Search,
  Settings,
} from 'lucide-react'
import type { EventoAgenda, EstatusEvento } from '../../../../domain/entities/db/local/evento'
import { listarEventos, crearEvento, actualizarEvento, eliminarEvento } from '../../../../infrastructure/data/local/eventos'
import { isoFecha, lunesDe, addDias, MESES_ES } from '../../../../infrastructure/useCases/agendaHelpers'
import { MiniCal } from './components/miniCal'
import { GrillaSemanal } from './components/grillaSemanal'
import { FiltrosYLeyenda, ESTATUS_INFO } from './components/filtrosYLeyenda'
import { EventoModal } from '../../../components/modals/eventoModal'

type ModalState =
  | { tipo: 'cerrado' }
  | { tipo: 'crear'; fecha?: string; hora?: string }
  | { tipo: 'editar'; evento: EventoAgenda }

export default function AgendaView() {
  const [semanaLunes, setSemanaLunes] = useState(() => lunesDe(new Date()))
  const [eventos, setEventos] = useState<EventoAgenda[]>([])
  const [modal, setModal] = useState<ModalState>({ tipo: 'cerrado' })
  const [filtrosActivos, setFiltrosActivos] = useState<Set<EstatusEvento>>(
    () => new Set(ESTATUS_INFO.map((e) => e.key)),
  )
  const hoy = isoFecha(new Date())

  useEffect(() => {
    setEventos(listarEventos())
  }, [])

  const toggleFiltro = (e: EstatusEvento) =>
    setFiltrosActivos((prev) => {
      const next = new Set(prev)
      next.has(e) ? next.delete(e) : next.add(e)
      return next
    })

  const eventosPorDia: Record<string, EventoAgenda[]> = useMemo(() => {
    const porDia: Record<string, EventoAgenda[]> = {}
    for (const e of eventos) {
      if (!filtrosActivos.has(e.estatus)) continue
      const dia = e.fecha_inicio.slice(0, 10)
      ;(porDia[dia] ??= []).push(e)
    }
    return porDia
  }, [eventos, filtrosActivos])

  const labelSemana = (() => {
    const fin = addDias(semanaLunes, 6)
    const mismo = semanaLunes.getMonth() === fin.getMonth()
    return mismo
      ? `${semanaLunes.getDate()} – ${fin.getDate()} de ${MESES_ES[fin.getMonth()]} ${fin.getFullYear()}`
      : `${semanaLunes.getDate()} ${MESES_ES[semanaLunes.getMonth()]} – ${fin.getDate()} ${MESES_ES[fin.getMonth()]} ${fin.getFullYear()}`
  })()

  const esEstaSemana = isoFecha(semanaLunes) === isoFecha(lunesDe(new Date()))
  const totalVisibles = Object.values(eventosPorDia).reduce((acc, dia) => acc + dia.length, 0)

  function handleGuardar(input: Omit<EventoAgenda, 'id'> & { id?: string }) {
    if (input.id) {
      const actualizado = actualizarEvento({ ...input, id: input.id })
      setEventos((prev) => prev.map((e) => (e.id === actualizado.id ? actualizado : e)))
    } else {
      const creado = crearEvento(input)
      setEventos((prev) => [...prev, creado])
    }
    setModal({ tipo: 'cerrado' })
  }

  function handleEliminar(id: string) {
    eliminarEvento(id)
    setEventos((prev) => prev.filter((e) => e.id !== id))
    setModal({ tipo: 'cerrado' })
  }

  return (
    <>
      <div className="flex min-h-0 flex-1 flex-col gap-5 p-5">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-slate-900">Agenda</h1>
            <p className="text-sm text-slate-400">Tu agenda personal semanal</p>
          </div>
          <button
            onClick={() => setModal({ tipo: 'crear' })}
            className="inline-flex items-center gap-2 rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700"
          >
            <Plus size={14} /> Nuevo evento
          </button>
        </div>

        <div className="flex min-h-0 flex-1 rounded-xl border border-slate-200 bg-white overflow-hidden">
          <aside className="flex w-52 flex-shrink-0 flex-col overflow-y-auto border-r border-slate-200 px-4 py-4">
            <MiniCal semanaRef={semanaLunes} onSelectSemana={setSemanaLunes} />
            <div className="mt-5">
              <FiltrosYLeyenda activos={filtrosActivos} onToggle={toggleFiltro} />
            </div>
          </aside>

          <section className="flex min-h-0 flex-1 flex-col">
            <div className="flex flex-shrink-0 items-center justify-between border-b border-slate-200 px-5 py-3">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setSemanaLunes((d) => addDias(d, -7))}
                  className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors"
                >
                  <ChevronLeft size={14} className="text-slate-500" />
                </button>
                <button
                  onClick={() => setSemanaLunes((d) => addDias(d, 7))}
                  className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors"
                >
                  <ChevronRight size={14} className="text-slate-500" />
                </button>
                <span className="ml-1 text-sm font-semibold text-slate-900">{labelSemana}</span>
                {!esEstaSemana && (
                  <button
                    onClick={() => setSemanaLunes(lunesDe(new Date()))}
                    className="ml-1 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50 transition-colors"
                  >
                    Hoy
                  </button>
                )}
              </div>
              <p className="text-xs text-slate-400">00:00 a 24:00</p>
            </div>

            <div className="flex min-h-0 flex-1 overflow-x-hidden">
              <GrillaSemanal
                lunes={semanaLunes}
                eventosPorDia={eventosPorDia}
                rangoInicio={0}
                rangoFin={24 * 60}
                hoy={hoy}
                onSelectEvento={(e) => setModal({ tipo: 'editar', evento: e })}
                onSelectSlot={(fecha, hora) => setModal({ tipo: 'crear', fecha, hora })}
              />
            </div>
          </section>
        </div>
      </div>

      {modal.tipo !== 'cerrado' && (
        <EventoModal
          evento={modal.tipo === 'editar' ? modal.evento : null}
          fechaInicial={modal.tipo === 'crear' ? modal.fecha : undefined}
          horaInicial={modal.tipo === 'crear' ? modal.hora : undefined}
          onClose={() => setModal({ tipo: 'cerrado' })}
          onGuardar={handleGuardar}
          onEliminar={handleEliminar}
        />
      )}
    </>
  )
}
