import { useState, useRef, useEffect } from 'react'
import { ChevronDown, Check } from 'lucide-react'
import type { EstatusEvento } from '../../../../../domain/entities/db/local/evento'
import { ESTATUS_INFO } from './estatusInfo'

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
    <div ref={contenedorRef} className="relative flex w-full flex-col">
      <button
        onClick={() => setAbierto((v) => !v)}
        className="flex h-9 items-center justify-between gap-2 border border-white/15 bg-white/10 px-2.5 text-left text-zinc-100 transition-colors hover:bg-white/15"
      >
        <span className="truncate text-xs font-medium">{resumen}</span>
        <ChevronDown size={12} className={`flex-shrink-0 text-zinc-300 transition-transform ${abierto ? 'rotate-180' : ''}`} />
      </button>

      {abierto && (
        <div className="absolute left-0 right-0 top-full z-20 mt-1 border border-zinc-200 bg-white py-1">
          {ESTATUS_INFO.map((info) => {
            const activo = activos.has(info.key)
            return (
              <button
                key={info.key}
                onClick={() => onToggle(info.key)}
                className="flex w-full items-center gap-2 px-2.5 py-1.5 text-left hover:bg-zinc-100 transition-colors"
              >
                <span className={`flex h-3.5 w-3.5 flex-shrink-0 items-center justify-center border ${
                  activo ? 'border-violet-600 bg-violet-600' : 'border-zinc-300'
                }`}>
                  {activo && <Check size={10} className="text-white" />}
                </span>
                <span className="text-xs font-medium text-zinc-700">{info.label}</span>
              </button>
            )
          })}

          <div className="mt-1 border-t border-zinc-200 pt-1">
            <button
              onClick={() => {
                ESTATUS_INFO.forEach((e) => {
                  const estaActivo = activos.has(e.key)
                  if (todosActivos ? estaActivo : !estaActivo) onToggle(e.key)
                })
              }}
              className="w-full px-2.5 py-1 text-left text-2xs text-zinc-500 hover:text-zinc-700 transition-colors"
            >
              {todosActivos ? 'Limpiar' : 'Seleccionar todos'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
