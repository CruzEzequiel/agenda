import { useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { isoFecha, lunesDe, addDias, primerDiaMes, DIAS_SEMANA_CORTO, MESES_ES } from '../../../../../infrastructure/useCases/agendaHelpers'

export function MiniCal({
  semanaRef,
  onSelectSemana,
}: {
  semanaRef: Date
  onSelectSemana: (lunes: Date) => void
}) {
  const hoyIso = isoFecha(new Date())
  const [mesVista, setMesVista] = useState(() => {
    const d = new Date()
    return { y: d.getFullYear(), m: d.getMonth() }
  })

  const primer = primerDiaMes(mesVista.y, mesVista.m)
  const inicioGrid = lunesDe(primer)
  const celdas = Array.from({ length: 42 }, (_, i) => addDias(inicioGrid, i))
  const semanaActivaLunes = isoFecha(semanaRef)

  return (
    <div className="select-none">
      <div className="flex items-center justify-between pb-1.5">
        <button
          onClick={() => setMesVista(({ y, m }) => (m === 0 ? { y: y - 1, m: 11 } : { y, m: m - 1 }))}
          className="flex h-5 w-5 items-center justify-center text-zinc-400 hover:bg-white/10"
        >
          <ChevronLeft size={12} />
        </button>
        <span className="text-2xs font-semibold text-zinc-100">
          {MESES_ES[mesVista.m]} {mesVista.y}
        </span>
        <button
          onClick={() => setMesVista(({ y, m }) => (m === 11 ? { y: y + 1, m: 0 } : { y, m: m + 1 }))}
          className="flex h-5 w-5 items-center justify-center text-zinc-400 hover:bg-white/10"
        >
          <ChevronRight size={12} />
        </button>
      </div>

      <div className="grid grid-cols-7">
        {DIAS_SEMANA_CORTO.map((d, i) => (
          <div key={i} className="flex h-5 items-center justify-center text-2xs font-semibold text-violet-300">
            {d}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7">
        {celdas.map((dia) => {
          const iso = isoFecha(dia)
          const esMes = dia.getMonth() === mesVista.m
          const esHoy = iso === hoyIso
          const lunes = isoFecha(lunesDe(dia))
          const esSemana = lunes === semanaActivaLunes

          return (
            <button
              key={iso}
              onClick={() => onSelectSemana(lunesDe(dia))}
              className={[
                'flex h-6 items-center justify-center text-2xs transition-colors',
                esSemana ? 'bg-violet-500/25' : 'hover:bg-white/10',
              ].join(' ')}
            >
              <span
                className={[
                  'flex h-4 w-4 items-center justify-center text-2xs font-medium',
                  esHoy ? 'bg-violet-500 text-white' : '',
                  !esHoy && esMes ? 'text-zinc-200' : '',
                  !esHoy && !esMes ? 'text-zinc-600' : '',
                ].join(' ')}
              >
                {dia.getDate()}
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
