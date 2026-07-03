import { useState } from 'react'
import { X } from 'lucide-react'
import type { EventoAgenda, EstatusEvento } from '../../../domain/entities/db/local/evento'
import { colorEstatus } from '../../../infrastructure/useCases/agendaHelpers'

interface EventoModalProps {
  evento: EventoAgenda | null
  fechaInicial?: string
  horaInicial?: string
  onClose: () => void
  onGuardar: (input: Omit<EventoAgenda, 'id'> & { id?: string }) => void
  onEliminar?: (id: string) => void
}

const ESTATUS_OPCIONES: { value: EstatusEvento; label: string }[] = [
  { value: 'pendiente', label: 'Pendiente' },
  { value: 'confirmado', label: 'Confirmado' },
  { value: 'cancelado', label: 'Cancelado' },
]

const DURACIONES: { value: number; label: string }[] = [
  { value: 10, label: '10 min' },
  { value: 15, label: '15 min' },
  { value: 30, label: '30 min' },
  { value: 60, label: '60 min' },
]

const DURACION_PERSONALIZADA = -1

function combinarFechaHora(fecha: string, hora: string): string {
  return `${fecha}T${hora}:00`
}

function partirIso(iso: string): { fecha: string; hora: string } {
  const [fecha, resto] = iso.split('T')
  return { fecha: fecha ?? '', hora: (resto ?? '00:00').slice(0, 5) }
}

function sumarMinutos(hora: string, minutos: number): string {
  const [h, m] = hora.split(':').map(Number)
  const total = (h! * 60 + m! + minutos + 1440) % 1440
  return `${String(Math.floor(total / 60)).padStart(2, '0')}:${String(total % 60).padStart(2, '0')}`
}

function diferenciaMinutos(horaInicio: string, horaFin: string): number {
  const [h1, m1] = horaInicio.split(':').map(Number)
  const [h2, m2] = horaFin.split(':').map(Number)
  return ((h2! * 60 + m2!) - (h1! * 60 + m1!) + 1440) % 1440
}

export function EventoModal({ evento, fechaInicial, horaInicial, onClose, onGuardar, onEliminar }: EventoModalProps) {
  const inicioBase = evento ? partirIso(evento.fecha_inicio) : { fecha: fechaInicial ?? '', hora: horaInicial ?? '09:00' }
  const duracionInicial = evento
    ? diferenciaMinutos(partirIso(evento.fecha_inicio).hora, partirIso(evento.fecha_fin).hora)
    : 30
  const duracionPredefinida = DURACIONES.some((d) => d.value === duracionInicial) ? duracionInicial : DURACION_PERSONALIZADA

  const [titulo, setTitulo] = useState(evento?.titulo ?? '')
  const [fecha, setFecha] = useState(inicioBase.fecha)
  const [horaInicio, setHoraInicio] = useState(inicioBase.hora)
  const [duracion, setDuracion] = useState<number>(duracionPredefinida)
  const [duracionPersonalizada, setDuracionPersonalizada] = useState<number>(
    duracionPredefinida === DURACION_PERSONALIZADA ? duracionInicial : 30,
  )
  const [notas, setNotas] = useState(evento?.notas ?? '')
  const [estatus, setEstatus] = useState<EstatusEvento>(evento?.estatus ?? 'pendiente')

  const duracionMinutos = duracion === DURACION_PERSONALIZADA ? duracionPersonalizada : duracion
  const valido = titulo.trim().length > 0 && fecha.length > 0 && duracionMinutos > 0

  function handleGuardar() {
    if (!valido) return
    const horaFin = sumarMinutos(horaInicio, duracionMinutos)
    onGuardar({
      id: evento?.id,
      titulo: titulo.trim(),
      fecha_inicio: combinarFechaHora(fecha, horaInicio),
      fecha_fin: combinarFechaHora(fecha, horaFin),
      notas: notas.trim() || undefined,
      estatus,
    })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center md:items-center md:p-4">
      <div className="absolute inset-0 bg-zinc-950/70 backdrop-blur-[2px]" onClick={onClose} />

      <div className="relative z-10 flex max-h-[85vh] w-full flex-col overflow-hidden rounded-t-xl border border-zinc-600 bg-zinc-800 shadow-2xl shadow-black/50 md:max-h-[90vh] md:max-w-md md:rounded-md">
        <div className="mx-auto mt-2 h-1 w-10 flex-shrink-0 rounded-full bg-zinc-600 md:hidden" />
        <div className="relative border-b border-zinc-700 bg-zinc-800 px-5 py-3">
          <button onClick={onClose} className="absolute right-3 top-3 rounded-md p-1 hover:bg-white/10 transition-colors">
            <X size={14} className="text-zinc-400" />
          </button>
          <p className="text-xs font-semibold leading-snug text-zinc-100">
            {evento ? 'Editar evento' : 'Nuevo evento'}
          </p>
        </div>

        <div className="flex flex-1 flex-col gap-3 overflow-y-auto bg-zinc-900 px-5 py-4">
          <div>
            <label className="text-2xs font-semibold uppercase text-zinc-400">Título</label>
            <input
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
              placeholder="Ej. Reunión con equipo"
              className="mt-1 w-full rounded-md border border-zinc-700 bg-zinc-900 px-3 py-1.5 text-xs text-zinc-100 focus:outline-none focus:border-violet-500"
            />
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <div className="flex-1">
              <label className="text-2xs font-semibold uppercase text-zinc-400">Fecha</label>
              <input
                type="date"
                value={fecha}
                onChange={(e) => setFecha(e.target.value)}
                className="mt-1 w-full rounded-md border border-zinc-700 bg-zinc-900 px-3 py-1.5 text-xs text-zinc-100 focus:outline-none focus:border-violet-500"
              />
            </div>

            <div className="flex-1">
              <label className="text-2xs font-semibold uppercase text-zinc-400">Hora inicio</label>
              <input
                type="time"
                value={horaInicio}
                onChange={(e) => setHoraInicio(e.target.value)}
                className="mt-1 w-full rounded-md border border-zinc-700 bg-zinc-900 px-3 py-1.5 text-xs text-zinc-100 focus:outline-none focus:border-violet-500"
              />
            </div>
          </div>

          <div>
            <label className="text-2xs font-semibold uppercase text-zinc-400">Duración</label>
            <div className="mt-1 flex gap-2">
              {DURACIONES.map((d) => (
                <button
                  key={d.value}
                  onClick={() => setDuracion(d.value)}
                  className={`flex-1 rounded-md border px-2 py-1.5 text-xs font-medium transition-colors ${
                    duracion === d.value
                      ? 'border-violet-600 bg-violet-600 text-white'
                      : 'border-zinc-700 text-zinc-300 hover:bg-zinc-800'
                  }`}
                >
                  {d.label}
                </button>
              ))}
              <button
                onClick={() => setDuracion(DURACION_PERSONALIZADA)}
                className={`flex-1 rounded-md border px-2 py-1.5 text-xs font-medium transition-colors ${
                    duracion === DURACION_PERSONALIZADA
                      ? 'border-violet-600 bg-violet-600 text-white'
                      : 'border-zinc-700 text-zinc-300 hover:bg-zinc-800'
                }`}
              >
                Otra
              </button>
            </div>
            {duracion === DURACION_PERSONALIZADA && (
              <input
                type="number"
                min={1}
                value={duracionPersonalizada}
                onChange={(e) => setDuracionPersonalizada(Math.max(1, Number(e.target.value)))}
                placeholder="Minutos"
                className="mt-2 w-full rounded-md border border-zinc-700 bg-zinc-900 px-3 py-1.5 text-xs text-zinc-100 focus:outline-none focus:border-violet-500"
              />
            )}
          </div>

          <div>
            <label className="text-2xs font-semibold uppercase text-zinc-400">Estatus</label>
            <div className="mt-1 flex gap-2">
              {ESTATUS_OPCIONES.map((op) => {
                const opCol = colorEstatus(op.value)
                const activo = estatus === op.value
                return (
                  <button
                    key={op.value}
                    onClick={() => setEstatus(op.value)}
                    className={`flex-1 rounded-md border px-2 py-1.5 text-xs font-medium transition-colors ${
                      activo
                        ? `${opCol.border} ${opCol.pill} ${opCol.text} border-2`
                        : 'border-zinc-700 text-zinc-300 hover:bg-zinc-800'
                    }`}
                  >
                    {op.label}
                  </button>
                )
              })}
            </div>
          </div>

          <div>
            <label className="text-2xs font-semibold uppercase text-zinc-400">Notas</label>
            <textarea
              value={notas}
              onChange={(e) => setNotas(e.target.value)}
              rows={3}
              placeholder="Opcional"
              className="mt-1 w-full rounded-md border border-zinc-700 bg-zinc-900 px-3 py-1.5 text-xs text-zinc-100 focus:outline-none focus:border-violet-500"
            />
          </div>
        </div>

        <div className="flex items-center justify-between gap-2 border-t border-zinc-800 px-5 py-3">
          <div>
            {evento && onEliminar && (
              <button
                onClick={() => {
                  if (!confirm('¿Eliminar este evento? Esta acción no se puede deshacer.')) return
                  onEliminar(evento.id)
                }}
                className="rounded-md border border-red-900/50 bg-zinc-900 px-4 py-2 text-xs font-medium text-red-400 hover:bg-red-950/40 transition-colors"
              >
                Eliminar
              </button>
            )}
          </div>
          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="rounded-md border border-zinc-700 bg-zinc-900 px-4 py-2 text-xs font-medium text-zinc-300 hover:bg-zinc-800 transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={handleGuardar}
              disabled={!valido}
              className="rounded-md bg-violet-600 px-4 py-2 text-xs font-semibold text-white hover:bg-violet-700 transition-colors disabled:opacity-40 disabled:hover:bg-violet-600"
            >
              Guardar
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
