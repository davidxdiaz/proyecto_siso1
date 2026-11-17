export type EstadoProceso =
  | 'Nuevo'
  | 'Listo'
  | 'Ejecución'
  | 'Bloqueado'
  | 'Terminado'
  | 'Sospechoso';

export interface Proceso {
  pid: number | string;
  prioridad: number;
  rafaga: number;
  estado: EstadoProceso | string;
}

//estos son procesos de prueba para que no arranque vacio el sistema
export const procesosIniciales: Proceso[] = [
  { pid: 101, prioridad: 1, rafaga: 7, estado: 'Nuevo' },
  { pid: 102, prioridad: 2, rafaga: 3, estado: 'Listo' },
  { pid: 103, prioridad: 3, rafaga: 8, estado: 'Bloqueado' },
];