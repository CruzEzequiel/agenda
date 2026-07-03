import { Pencil, X } from 'lucide-react'
import type { EventoAgenda } from '../../../domain/entities/db/local/evento'
import { colorEstatus, fmtFechaLarga, fmtHoraISO } from '../../../infrastructure/useCases/agendaHelpers'

interface EventoVistaModalProps {
  evento: EventoAgenda
  onClose: () => void
  onEditar: () => void
}

const ESTATUS_LABEL: Record<EventoAgenda['estatus'], string> = {
  pendiente: 'Pendiente',
  confirmado: 'Confirmado',
  cancelado: 'Cancelado',
}

export function EventoVistaModal({ evento, onClose, onEditar }: EventoVistaModalProps) {
  const col = colorEstatus(evento.estatus)

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-zinc-950/70 backdrop-blur-[2px]" onClick={onClose} />

      <div className="relative z-10 flex max-h-[90vh] w-full max-w-md flex-col overflow-hidden rounded-md border border-zinc-600 bg-zinc-800 shadow-2xl shadow-black/50">
        <div className="relative flex items-center justify-between border-b border-zinc-700 bg-zinc-800 px-5 py-3">
          <p className="pr-14 text-xs font-semibold leading-snug text-zinc-100">{evento.titulo}</p>
          <div className="absolute right-3 top-2.5 flex items-center gap-1">
            <button
              onClick={onEditar}
              title="Editar evento"
              className="rounded-md p-1.5 text-zinc-400 hover:bg-white/10 hover:text-zinc-100 transition-colors"
            >
              <Pencil size={14} />
            </button>
            <button onClick={onClose} title="Cerrar" className="rounded-md p-1.5 hover:bg-white/10 transition-colors">
              <X size={14} className="text-zinc-400" />
            </button>
          </div>
        </div>

        <div className="flex flex-1 flex-col gap-3 overflow-y-auto bg-zinc-900 px-5 py-4">
          <div>
            <label className="text-2xs font-semibold uppercase text-zinc-400">Estatus</label>
            <div className="mt-1">
              <span className={`inline-block rounded-md border-l-4 px-2.5 py-1 text-xs font-medium ${col.pill} ${col.text} ${col.border}`}>
                {ESTATUS_LABEL[evento.estatus]}
              </span>
            </div>
          </div>

          <div>
            <label className="text-2xs font-semibold uppercase text-zinc-400">Fecha</label>
            <p className="mt-1 text-xs capitalize text-zinc-100">{fmtFechaLarga(evento.fecha_inicio)}</p>
          </div>

          <div>
            <label className="text-2xs font-semibold uppercase text-zinc-400">Horario</label>
            <p className="mt-1 text-xs text-zinc-100">
              {fmtHoraISO(evento.fecha_inicio)} – {fmtHoraISO(evento.fecha_fin)}
            </p>
          </div>

          {evento.notas && (
            <div>
              <label className="text-2xs font-semibold uppercase text-zinc-400">Notas</label>
              <p className="mt-1 whitespace-pre-wrap text-xs text-zinc-100">{evento.notas}</p>
            </div>
          )}
        </div>

        <div className="flex items-center justify-end gap-2 border-t border-zinc-800 px-5 py-3">
          <button
            onClick={onClose}
            className="rounded-md border border-zinc-700 bg-zinc-900 px-4 py-2 text-xs font-medium text-zinc-300 hover:bg-zinc-800 transition-colors"
          >
            Cerrar
          </button>
          <button
            onClick={onEditar}
            className="flex items-center gap-1.5 rounded-md bg-violet-600 px-4 py-2 text-xs font-semibold text-white hover:bg-violet-700 transition-colors"
          >
            <Pencil size={12} />
            Editar
          </button>
        </div>
      </div>
    </div>
  )
}
