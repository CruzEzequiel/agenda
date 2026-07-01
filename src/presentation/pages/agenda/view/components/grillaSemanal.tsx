import { useState, useRef, useEffect } from 'react'
import type { EventoAgenda } from '../../../../../domain/entities/db/local/evento'
import { isoFecha, addDias, minLocal, fmtHoraMin } from '../../../../../infrastructure/useCases/agendaHelpers'
import { EventoBloque } from './eventoBloque'
import { PX_POR_MIN, COL_HORA_W } from './types'

const DIAS_GRILLA = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo']

export function GrillaSemanal({
  lunes,
  eventosPorDia,
  rangoInicio,
  rangoFin,
  hoy,
  onSelectEvento,
  onSelectSlot,
}: {
  lunes: Date
  eventosPorDia: Record<string, EventoAgenda[]>
  rangoInicio: number
  rangoFin: number
  hoy: string
  onSelectEvento: (e: EventoAgenda) => void
  onSelectSlot: (fecha: string, hora: string) => void
}) {
  const [hoverSlot, setHoverSlot] = useState<{ fecha: string; min: number } | null>(null)
  const totalMin = rangoFin - rangoInicio
  const totalPx = totalMin * PX_POR_MIN
  const dias = Array.from({ length: 7 }, (_, i) => addDias(lunes, i))

  const horas: number[] = []
  for (let m = rangoInicio; m <= rangoFin; m += 60) horas.push(m)

  const ahora = new Date()
  const ahoraMin = ahora.getHours() * 60 + ahora.getMinutes()
  const ahoraOffset = ahoraMin - rangoInicio
  const scrollRef = useRef<HTMLDivElement | null>(null)
  const semanaKey = isoFecha(lunes)

  const slotOcupadoPorEvento = (min: number, eventos: EventoAgenda[]) =>
    eventos.some((e) => {
      const inicio = minLocal(e.fecha_inicio)
      const fin = minLocal(e.fecha_fin)
      return inicio <= min && min < fin
    })

  useEffect(() => {
    const el = scrollRef.current
    if (!el) return
    const top = Math.max(0, ahoraOffset * PX_POR_MIN - el.clientHeight / 2)
    requestAnimationFrame(() => {
      el.scrollTop = top
    })
  }, [semanaKey, rangoInicio, rangoFin, ahoraOffset])

  return (
    <div className="flex min-h-0 flex-1 flex-col bg-white">
      <div className="flex flex-shrink-0 border-b border-slate-200 overflow-visible">
        <div className="flex-shrink-0 border-r border-slate-200" style={{ width: COL_HORA_W }} />
        {dias.map((dia, i) => {
          const iso = isoFecha(dia)
          const esHoy = iso === hoy
          return (
            <div
              key={iso}
              className={`flex flex-1 flex-col items-center justify-center border-r border-slate-200 py-2 pb-3 last:border-r-0 ${esHoy ? 'bg-blue-50/30' : ''}`}
            >
              <span className={`text-[10px] font-semibold uppercase tracking-widest ${esHoy ? 'text-blue-600' : 'text-slate-400'}`}>
                {DIAS_GRILLA[i]}
              </span>
              <span
                className={[
                  'mt-1 flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold',
                  esHoy ? 'bg-blue-600 text-white shadow-md' : 'text-slate-800',
                ].join(' ')}
              >
                {dia.getDate()}
              </span>
            </div>
          )
        })}
      </div>

      <div ref={scrollRef} className="flex flex-1 min-h-0 overflow-y-auto">
        <div className="relative flex-shrink-0 border-r border-slate-200" style={{ width: COL_HORA_W, height: totalPx }}>
          <div className="relative" style={{ height: totalPx }}>
            {horas.map((m) => (
              <div
                key={m}
                className="absolute right-2 text-[10px] text-slate-400 leading-none select-none"
                style={{ top: (m - rangoInicio) * PX_POR_MIN - 6 }}
              >
                {m < rangoFin ? fmtHoraMin(m) : ''}
              </div>
            ))}
          </div>
        </div>

        <div className="flex flex-1 min-w-0">
          {dias.map((dia) => {
            const iso = isoFecha(dia)
            const esHoy = iso === hoy
            const eventos = eventosPorDia[iso] ?? []
            const ahoraAqui = esHoy && ahoraOffset >= 0 && ahoraOffset < totalMin

            return (
              <div
                key={iso}
                className={`relative flex flex-1 flex-col border-r border-slate-200 last:border-r-0 ${esHoy ? 'bg-blue-50/30' : ''}`}
                style={{ height: totalPx }}
              >
                <div
                  className="relative"
                  style={{ height: totalPx }}
                  onMouseMove={(e) => {
                    const rect = e.currentTarget.getBoundingClientRect()
                    const y = e.clientY - rect.top
                    const rawMin = rangoInicio + y / PX_POR_MIN
                    const snapped = Math.max(rangoInicio, Math.min(rangoFin - 15, Math.round(rawMin / 15) * 15))
                    if (slotOcupadoPorEvento(snapped, eventos)) {
                      setHoverSlot((h) => (h?.fecha === iso ? null : h))
                      return
                    }
                    setHoverSlot({ fecha: iso, min: snapped })
                  }}
                  onMouseLeave={() => setHoverSlot((h) => (h?.fecha === iso ? null : h))}
                  onClick={(e) => {
                    const rect = e.currentTarget.getBoundingClientRect()
                    const y = e.clientY - rect.top
                    const rawMin = rangoInicio + y / PX_POR_MIN
                    const snapped = Math.max(rangoInicio, Math.min(rangoFin - 15, Math.round(rawMin / 15) * 15))
                    if (slotOcupadoPorEvento(snapped, eventos)) return
                    onSelectSlot(iso, fmtHoraMin(snapped))
                  }}
                >
                  {hoverSlot?.fecha === iso && (
                    <div
                      className="pointer-events-none absolute left-0 right-0 z-[1] border-y border-blue-200 bg-blue-50/70"
                      style={{
                        top: (hoverSlot.min - rangoInicio) * PX_POR_MIN,
                        height: 15 * PX_POR_MIN,
                      }}
                    />
                  )}

                  {horas.map((m) => (
                    <div
                      key={m}
                      className="absolute left-0 right-0 border-t border-slate-100"
                      style={{ top: (m - rangoInicio) * PX_POR_MIN }}
                    />
                  ))}
                  {horas.slice(0, -1).map((m) => (
                    <div
                      key={`h-${m}`}
                      className="absolute left-0 right-0 border-t border-dashed border-slate-100"
                      style={{ top: (m - rangoInicio) * PX_POR_MIN + 30 * PX_POR_MIN }}
                    />
                  ))}

                  {ahoraAqui && (
                    <div
                      className="absolute left-0 right-0 z-10 flex items-center pointer-events-none"
                      style={{ top: ahoraOffset * PX_POR_MIN }}
                    >
                      <div className="h-2 w-2 flex-shrink-0 rounded-full bg-blue-600 -ml-1 shadow-sm" />
                      <div className="flex-1 border-t border-blue-500" />
                    </div>
                  )}

                  {eventos.map((e) => (
                    <EventoBloque key={e.id} evento={e} rangoInicio={rangoInicio} onSelect={onSelectEvento} />
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
