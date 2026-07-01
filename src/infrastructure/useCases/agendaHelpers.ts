import type { EstatusEvento } from '../../domain/entities/db/local/evento'

export function isoFecha(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

export function lunesDe(d: Date): Date {
  const r = new Date(d)
  r.setHours(0, 0, 0, 0)
  const dow = r.getDay() === 0 ? 6 : r.getDay() - 1
  r.setDate(r.getDate() - dow)
  return r
}

export function addDias(d: Date, n: number): Date {
  const r = new Date(d)
  r.setDate(r.getDate() + n)
  return r
}

export function minLocal(iso: string): number {
  const d = new Date(iso)
  return d.getHours() * 60 + d.getMinutes()
}

export function hmToMin(hm: string): number {
  const [h, m] = hm.split(':').map(Number)
  return h! * 60 + m!
}

export function fmtHoraMin(min: number): string {
  return `${String(Math.floor(min / 60)).padStart(2, '0')}:${String(min % 60).padStart(2, '0')}`
}

export function fmtHoraISO(iso: string): string {
  const d = new Date(iso)
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
}

export function fmtFechaLarga(iso: string): string {
  return new Date(iso).toLocaleDateString('es-MX', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  })
}

export function primerDiaMes(y: number, m: number): Date {
  return new Date(y, m, 1)
}

export const DIAS_SEMANA_CORTO = ['L', 'M', 'M', 'J', 'V', 'S', 'D']
export const DIAS_GRILLA = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo']
export const MESES_ES = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre']

export function colorEstatus(estatus: EstatusEvento): { pill: string; text: string; border: string } {
  switch (estatus) {
    case 'pendiente':
      return { pill: 'bg-blue-50', text: 'text-blue-800', border: 'border-l-blue-400' }
    case 'confirmado':
      return { pill: 'bg-emerald-100', text: 'text-emerald-800', border: 'border-l-emerald-500' }
    case 'cancelado':
      return { pill: 'bg-red-50', text: 'text-red-700', border: 'border-l-red-500' }
  }
}
