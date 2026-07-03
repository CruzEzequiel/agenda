import { useState, useMemo, type ReactNode } from 'react'
import { CalendarDays, ChevronLeft, ChevronRight, Clock3, Plus, RefreshCcw, X } from 'lucide-react'
import type { EventoAgenda, EstatusEvento } from '../../../../domain/entities/db/local/evento'
import { isoFecha, lunesDe, addDias, MESES_ES } from '../../../../infrastructure/useCases/agendaHelpers'
import { useEventos } from '../../../hooks/useEventos'
import { useEsMovil } from '../../../hooks/useMediaQuery'
import { MiniCal } from './components/miniCal'
import { GrillaSemanal } from './components/grillaSemanal'
import { FiltrosYLeyenda } from './components/filtrosYLeyenda'
import { ESTATUS_INFO } from './components/estatusInfo'
import { EventoModal } from '../../../components/modals/eventoModal'
import { EventoVistaModal } from '../../../components/modals/eventoVistaModal'

type ModalState =
  | { tipo: 'cerrado' }
  | { tipo: 'crear'; fecha?: string; hora?: string }
  | { tipo: 'ver'; evento: EventoAgenda }
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
      {label && <span className="hidden text-xs sm:inline">{label}</span>}
    </button>
  )
}

export default function AgendaView() {
  const esMovil = useEsMovil()
  const [semanaLunes, setSemanaLunes] = useState(() => lunesDe(new Date()))
  const [diaMovil, setDiaMovil] = useState(() => new Date())
  const { eventos, cargando, error, recargar, guardar, eliminar } = useEventos()
  const [modal, setModal] = useState<ModalState>({ tipo: 'cerrado' })
  const [filtrosActivos, setFiltrosActivos] = useState<Set<EstatusEvento>>(
    () => new Set(ESTATUS_INFO.map((e) => e.key)),
  )
  const [sidebarAbierto, setSidebarAbierto] = useState(false)
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

  const labelDiaMovil = `${diaMovil.getDate()} de ${MESES_ES[diaMovil.getMonth()]} ${diaMovil.getFullYear()}`

  const esEstaSemana = esMovil
    ? isoFecha(diaMovil) === hoy
    : isoFecha(semanaLunes) === isoFecha(lunesDe(new Date()))

  function irHoy() {
    if (esMovil) setDiaMovil(new Date())
    else setSemanaLunes(lunesDe(new Date()))
  }

  function irAnterior() {
    if (esMovil) setDiaMovil((d) => addDias(d, -1))
    else setSemanaLunes((d) => addDias(d, -7))
  }

  function irSiguiente() {
    if (esMovil) setDiaMovil((d) => addDias(d, 1))
    else setSemanaLunes((d) => addDias(d, 7))
  }

  function seleccionarSemanaDesdeMiniCal(lunes: Date) {
    setSemanaLunes(lunes)
    setDiaMovil(lunes)
    setSidebarAbierto(false)
  }

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
        <div className="flex flex-shrink-0 items-center gap-2 border-b border-black bg-neutral-950 px-2 py-1.5 shadow-sm sm:gap-3">
          <RibbonCommand
            icon={<CalendarDays size={14} />}
            label=""
            hint="Mostrar calendario"
            onClick={() => setSidebarAbierto(true)}
          />

          <div className="h-5 w-px bg-white/20 md:hidden" />

          <RibbonCommand
            icon={<Plus size={14} />}
            label="Nuevo"
            hint="Crear un evento"
            active
            onClick={() => setModal({ tipo: 'crear' })}
          />

          <div className="h-5 w-px bg-white/20" />

          <div className="flex items-center gap-0.5">
            <RibbonCommand icon={<ChevronLeft size={14} />} label="" hint="Anterior" onClick={irAnterior} />
            <RibbonCommand
              icon={<Clock3 size={14} />}
              label="Hoy"
              hint="Volver a hoy"
              active={esEstaSemana}
              onClick={irHoy}
            />
            <RibbonCommand icon={<ChevronRight size={14} />} label="" hint="Siguiente" onClick={irSiguiente} />
          </div>

          <div className="hidden h-5 w-px bg-white/20 sm:block" />

          <div className="hidden sm:block">
            <RibbonCommand
              icon={<RefreshCcw size={14} className={cargando ? 'animate-spin' : ''} />}
              label="Recargar"
              hint="Recargar eventos"
              onClick={() => recargar()}
            />
          </div>

          <div className="hidden h-5 w-px bg-white/20 md:block" />

          <div className="hidden w-48 md:block">
            <FiltrosYLeyenda activos={filtrosActivos} onToggle={toggleFiltro} />
          </div>

          {error && <span className="text-xs font-medium text-rose-400">{error}</span>}

          <span className="ml-auto truncate border-l border-white/20 pl-3 text-xs font-semibold text-zinc-200">
            {esMovil ? labelDiaMovil : labelSemana}
          </span>
        </div>

        <div className="flex min-h-0 flex-1 bg-zinc-900">
          <aside className="hidden w-52 flex-shrink-0 flex-col overflow-y-auto border-r border-zinc-700 bg-zinc-900 px-3 py-3 md:flex">
            <MiniCal semanaRef={semanaLunes} onSelectSemana={seleccionarSemanaDesdeMiniCal} />
            <div className="mt-4 border-t border-zinc-800 pt-3 md:hidden">
              <FiltrosYLeyenda activos={filtrosActivos} onToggle={toggleFiltro} />
            </div>
          </aside>

          <section className="flex min-h-0 flex-1 flex-col bg-zinc-900">
            <div className="hidden flex-shrink-0 items-center justify-between border-b border-zinc-700 bg-zinc-800 px-3 py-1.5 sm:flex">
              <p className="text-xs font-semibold text-zinc-100">{esMovil ? labelDiaMovil : labelSemana}</p>
              <p className="text-xs font-medium text-violet-300">00:00 a 24:00</p>
            </div>

            <div className="flex min-h-0 flex-1 overflow-x-hidden">
              <GrillaSemanal
                lunes={semanaLunes}
                diaUnico={esMovil ? diaMovil : undefined}
                eventosPorDia={eventosPorDia}
                rangoInicio={0}
                rangoFin={24 * 60}
                hoy={hoy}
                onSelectEvento={(e) => setModal({ tipo: 'ver', evento: e })}
                onSelectSlot={(fecha, hora) => setModal({ tipo: 'crear', fecha, hora })}
                onSwipeDia={esMovil ? (dir) => setDiaMovil((d) => addDias(d, dir)) : undefined}
              />
            </div>
          </section>
        </div>
      </div>

      {sidebarAbierto && (
        <div className="fixed inset-0 z-40 flex md:hidden">
          <div className="absolute inset-0 bg-zinc-950/70 backdrop-blur-[2px]" onClick={() => setSidebarAbierto(false)} />
          <aside className="relative z-10 flex h-full w-72 max-w-[85vw] flex-col overflow-y-auto border-r border-zinc-700 bg-zinc-900 px-3 py-3 shadow-2xl">
            <div className="mb-2 flex items-center justify-between">
              <p className="text-xs font-semibold text-zinc-100">Calendario</p>
              <button onClick={() => setSidebarAbierto(false)} className="rounded-md p-1.5 text-zinc-400 hover:bg-white/10">
                <X size={14} />
              </button>
            </div>
            <MiniCal semanaRef={esMovil ? diaMovil : semanaLunes} onSelectSemana={seleccionarSemanaDesdeMiniCal} />
            <div className="mt-4 border-t border-zinc-800 pt-3">
              <FiltrosYLeyenda activos={filtrosActivos} onToggle={toggleFiltro} />
            </div>
            <button
              onClick={() => {
                recargar()
                setSidebarAbierto(false)
              }}
              className="mt-4 flex h-9 items-center justify-center gap-1.5 border border-white/15 bg-white/10 text-xs font-medium text-zinc-100 hover:bg-white/15"
            >
              <RefreshCcw size={14} className={cargando ? 'animate-spin' : ''} />
              Recargar eventos
            </button>
          </aside>
        </div>
      )}

      {modal.tipo === 'ver' && (
        <EventoVistaModal
          evento={modal.evento}
          onClose={() => setModal({ tipo: 'cerrado' })}
          onEditar={() => setModal({ tipo: 'editar', evento: modal.evento })}
        />
      )}

      {(modal.tipo === 'crear' || modal.tipo === 'editar') && (
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
