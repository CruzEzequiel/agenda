import type { EventoAgenda } from '../../../../../domain/entities/db/local/evento'
import { minLocal, fmtHoraISO, colorEstatus } from '../../../../../infrastructure/useCases/agendaHelpers'
import { PX_POR_MIN } from './types'

export function EventoBloque({
  evento,
  rangoInicio,
  onSelect,
}: {
  evento: EventoAgenda
  rangoInicio: number
  onSelect: (e: EventoAgenda) => void
}) {
  const offsetMin = minLocal(evento.fecha_inicio) - rangoInicio
  const durMin = minLocal(evento.fecha_fin) - minLocal(evento.fecha_inicio)
  if (offsetMin < 0) return null

  const top = offsetMin * PX_POR_MIN
  const height = Math.max(durMin * PX_POR_MIN, 20)
  const col = colorEstatus(evento.estatus)
  const corto = height < 34

  return (
    <div
      onClick={(e) => { e.stopPropagation(); onSelect(evento) }}
      className={`absolute inset-x-1 cursor-pointer overflow-hidden border border-l-4 border-zinc-200 px-2 transition-opacity hover:opacity-80 ${col.pill} ${col.border}`}
      style={{ top, height, paddingTop: 3, paddingBottom: 3 }}
    >
      {corto ? (
        <p className={`text-2xs font-semibold leading-none truncate ${col.text}`}>
          {fmtHoraISO(evento.fecha_inicio)} {evento.titulo}
        </p>
      ) : (
        <>
          <p className={`text-2xs font-semibold leading-tight truncate ${col.text}`}>{evento.titulo}</p>
          <p className={`text-2xs leading-none opacity-70 ${col.text}`}>
            {fmtHoraISO(evento.fecha_inicio)} – {fmtHoraISO(evento.fecha_fin)}
          </p>
        </>
      )}
    </div>
  )
}
