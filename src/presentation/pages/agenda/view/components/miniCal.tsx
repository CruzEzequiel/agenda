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
      <div className="flex items-center justify-between px-1 mb-2">
        <button
          onClick={() => setMesVista(({ y, m }) => (m === 0 ? { y: y - 1, m: 11 } : { y, m: m - 1 }))}
          className="flex h-6 w-6 items-center justify-center rounded hover:bg-slate-100"
        >
          <ChevronLeft size={13} className="text-slate-400" />
        </button>
        <span className="text-[11px] font-semibold text-slate-700">
          {MESES_ES[mesVista.m]} {mesVista.y}
        </span>
        <button
          onClick={() => setMesVista(({ y, m }) => (m === 11 ? { y: y + 1, m: 0 } : { y, m: m + 1 }))}
          className="flex h-6 w-6 items-center justify-center rounded hover:bg-slate-100"
        >
          <ChevronRight size={13} className="text-slate-400" />
        </button>
      </div>

      <div className="grid grid-cols-7 mb-1">
        {DIAS_SEMANA_CORTO.map((d, i) => (
          <div key={i} className="flex items-center justify-center text-[10px] font-semibold text-slate-400 h-6">
            {d}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7">
        {celdas.map((dia, i) => {
          const iso = isoFecha(dia)
          const esMes = dia.getMonth() === mesVista.m
          const esHoy = iso === hoyIso
          const lunes = isoFecha(lunesDe(dia))
          const esSemana = lunes === semanaActivaLunes
          const esLunes = i % 7 === 0
          const esDom = i % 7 === 6

          return (
            <button
              key={iso}
              onClick={() => onSelectSemana(lunesDe(dia))}
              className={[
                'flex h-7 items-center justify-center text-[11px] transition-colors',
                esLunes ? 'rounded-l-full' : '',
                esDom ? 'rounded-r-full' : '',
                esSemana ? 'bg-slate-900/8' : 'hover:bg-slate-100',
              ].join(' ')}
            >
              <span
                className={[
                  'flex h-5 w-5 items-center justify-center rounded-full font-medium',
                  esHoy ? 'bg-blue-600 text-white text-[11px]' : '',
                  !esHoy && esMes ? 'text-slate-700' : '',
                  !esHoy && !esMes ? 'text-slate-300' : '',
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
