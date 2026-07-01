import { useState, useRef, useEffect } from 'react'
import { ChevronDown, Check } from 'lucide-react'
import type { EstatusEvento } from '../../../../../domain/entities/db/local/evento'

interface EstatusInfo {
  key: EstatusEvento
  label: string
}

export const ESTATUS_INFO: EstatusInfo[] = [
  { key: 'pendiente', label: 'Pendiente' },
  { key: 'confirmado', label: 'Confirmado' },
  { key: 'cancelado', label: 'Cancelado' },
]

export function FiltrosYLeyenda({
  activos,
  onToggle,
}: {
  activos: Set<EstatusEvento>
  onToggle: (e: EstatusEvento) => void
}) {
  const [abierto, setAbierto] = useState(false)
  const contenedorRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    function onClickFuera(e: MouseEvent) {
      if (contenedorRef.current && !contenedorRef.current.contains(e.target as Node)) {
        setAbierto(false)
      }
    }
    document.addEventListener('mousedown', onClickFuera)
    return () => document.removeEventListener('mousedown', onClickFuera)
  }, [])

  const todosActivos = ESTATUS_INFO.every((e) => activos.has(e.key))
  const resumen = todosActivos
    ? 'Todos'
    : activos.size === 0
      ? 'Ninguno'
      : ESTATUS_INFO.filter((e) => activos.has(e.key)).map((e) => e.label).join(', ')

  return (
    <div ref={contenedorRef} className="relative flex flex-col gap-1">
      <p className="px-1 text-[10px] font-semibold uppercase tracking-widest text-slate-400">Filtrar</p>

      <button
        onClick={() => setAbierto((v) => !v)}
        className="flex items-center justify-between gap-2 rounded-lg border border-slate-200 px-2.5 py-2 text-left hover:bg-slate-50 transition-colors"
      >
        <span className="truncate text-[11px] font-medium text-slate-700">{resumen}</span>
        <ChevronDown size={12} className={`flex-shrink-0 text-slate-400 transition-transform ${abierto ? 'rotate-180' : ''}`} />
      </button>

      {abierto && (
        <div className="absolute left-0 right-0 top-full z-20 mt-1 rounded-lg border border-slate-200 bg-white py-1 shadow-lg">
          {ESTATUS_INFO.map((info) => {
            const activo = activos.has(info.key)
            return (
              <button
                key={info.key}
                onClick={() => onToggle(info.key)}
                className="flex w-full items-center gap-2 px-3 py-1.5 text-left hover:bg-slate-50 transition-colors"
              >
                <span className={`flex h-3.5 w-3.5 flex-shrink-0 items-center justify-center rounded-sm border ${
                  activo ? 'border-slate-700 bg-slate-700' : 'border-slate-300'
                }`}>
                  {activo && <Check size={10} className="text-white" />}
                </span>
                <span className="text-[11px] font-medium text-slate-700">{info.label}</span>
              </button>
            )
          })}

          <div className="mt-1 border-t border-slate-100 pt-1">
            <button
              onClick={() => {
                ESTATUS_INFO.forEach((e) => {
                  const estaActivo = activos.has(e.key)
                  if (todosActivos ? estaActivo : !estaActivo) onToggle(e.key)
                })
              }}
              className="w-full px-3 py-1 text-left text-[10px] text-slate-400 hover:text-slate-600 transition-colors"
            >
              {todosActivos ? 'Limpiar' : 'Seleccionar todos'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
