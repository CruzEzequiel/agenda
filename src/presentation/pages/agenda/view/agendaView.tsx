import { useState, useMemo, type ReactNode } from 'react'
import { ChevronLeft, ChevronRight, Clock3, Plus, RefreshCcw } from 'lucide-react'
import type { EventoAgenda, EstatusEvento } from '../../../../domain/entities/db/local/evento'
import { isoFecha, lunesDe, addDias, MESES_ES } from '../../../../infrastructure/useCases/agendaHelpers'
import { useEventos } from '../../../hooks/useEventos'
import { MiniCal } from './components/miniCal'
import { GrillaSemanal } from './components/grillaSemanal'
import { FiltrosYLeyenda } from './components/filtrosYLeyenda'
import { ESTATUS_INFO } from './components/estatusInfo'
import { EventoModal } from '../../../components/modals/eventoModal'

type ModalState =
  | { tipo: 'cerrado' }
  | { tipo: 'crear'; fecha?: string; hora?: string }
  | { tipo: 'editar'; evento: EventoAgenda }

function RibbonCommand({
  icon,
  label,
  hint,
  active = false,
  onClick,
}: {
  icon: ReactNode
  label: string
  hint?: string
  active?: boolean
  onClick?: () => void
}) {
  return (
    <button
      type="button"
      title={hint ?? label}
      onClick={onClick}
      className={[
        'flex h-9 items-center justify-center gap-1.5 px-2.5 text-xs font-medium transition-colors hover:bg-white/10',
        label ? '' : 'w-9 px-0',
        active ? 'bg-violet-500/20 text-violet-100 hover:bg-violet-500/30' : 'text-zinc-200',
      ].join(' ')}
    >
      {icon}
      {label && <span className="text-xs">{label}</span>}
    </button>
  )
}

export default function AgendaView() {
  const [semanaLunes, setSemanaLunes] = useState(() => lunesDe(new Date()))
  const { eventos, cargando, error, recargar, guardar, eliminar } = useEventos()
  const [modal, setModal] = useState<ModalState>({ tipo: 'cerrado' })
  const [filtrosActivos, setFiltrosActivos] = useState<Set<EstatusEvento>>(
    () => new Set(ESTATUS_INFO.map((e) => e.key)),
  )
  const hoy = isoFecha(new Date())

  const toggleFiltro = (e: EstatusEvento) =>
    setFiltrosActivos((prev) => {
      const next = new Set(prev)
      if (next.has(e)) {
        next.delete(e)
      } else {
        next.add(e)
      }
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

  async function handleGuardar(input: Omit<EventoAgenda, 'id'> & { id?: string }) {
    await guardar(input)
    setModal({ tipo: 'cerrado' })
  }

  async function handleEliminar(id: string) {
    await eliminar(id)
    setModal({ tipo: 'cerrado' })
  }

  return (
    <>
      <div className="flex min-h-0 flex-1 flex-col bg-zinc-950 text-zinc-800">
        <div className="flex flex-shrink-0 items-center gap-3 border-b border-black bg-neutral-950 px-2 py-1.5 shadow-sm">
          <RibbonCommand
            icon={<Plus size={14} />}
            label="Nuevo"
            hint="Crear un evento"
            active
            onClick={() => setModal({ tipo: 'crear' })}
          />

          <div className="h-5 w-px bg-white/20" />

          <div className="flex items-center gap-0.5">
            <RibbonCommand
              icon={<ChevronLeft size={14} />}
              label=""
              hint="Semana anterior"
              onClick={() => setSemanaLunes((d) => addDias(d, -7))}
            />
            <RibbonCommand
              icon={<Clock3 size={14} />}
              label="Hoy"
              hint="Volver a la semana actual"
              active={esEstaSemana}
              onClick={() => setSemanaLunes(lunesDe(new Date()))}
            />
            <RibbonCommand
              icon={<ChevronRight size={14} />}
              label=""
              hint="Semana siguiente"
              onClick={() => setSemanaLunes((d) => addDias(d, 7))}
            />
          </div>

          <div className="h-5 w-px bg-white/20" />

          <RibbonCommand icon={<RefreshCcw size={14} className={cargando ? 'animate-spin' : ''} />} label="Recargar" hint="Recargar eventos" onClick={() => recargar()} />

          <div className="h-5 w-px bg-white/20" />

          <div className="w-48">
            <FiltrosYLeyenda activos={filtrosActivos} onToggle={toggleFiltro} />
          </div>

          {error && <span className="text-xs font-medium text-rose-400">{error}</span>}

          <span className="ml-auto border-l border-white/20 pl-3 text-xs font-semibold text-zinc-200">{labelSemana}</span>
        </div>

        <div className="flex min-h-0 flex-1 bg-zinc-900">
          <aside className="flex w-52 flex-shrink-0 flex-col overflow-y-auto border-r border-zinc-700 bg-zinc-900 px-3 py-3">
            <MiniCal semanaRef={semanaLunes} onSelectSemana={setSemanaLunes} />
          </aside>

          <section className="flex min-h-0 flex-1 flex-col bg-zinc-900">
            <div className="flex flex-shrink-0 items-center justify-between border-b border-zinc-700 bg-zinc-800 px-3 py-1.5">
              <p className="text-xs font-semibold text-zinc-100">{labelSemana}</p>
              <p className="text-xs font-medium text-violet-300">00:00 a 24:00</p>
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
