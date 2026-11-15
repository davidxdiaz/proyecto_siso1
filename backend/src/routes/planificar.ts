import { Router } from 'express';
import { Server } from 'socket.io';

// Si Edin ya definió una interfaz Proceso, impórtala en vez de esta
export interface Proceso {
  pid: number | string;
  prioridad: number;
  rafaga: number;
  estado: string;
}

interface BloqueGantt {
  pid: Proceso['pid'];
  inicio: number;
  fin: number;
}

function roundRobin(lista: Proceso[], quantum: number) {
  const restante = new Map<Proceso['pid'], number>();
  lista.forEach(p => restante.set(p.pid, p.rafaga));

  const cola: Proceso['pid'][] = lista.map(p => p.pid);
  const gantt: BloqueGantt[] = [];
  const fin = new Map<Proceso['pid'], number>();
  let tiempo = 0;

  while (cola.length > 0) {
    const pid = cola.shift()!;
    const rest = restante.get(pid)!;
    const ejecutado = Math.min(quantum, rest);

    gantt.push({ pid, inicio: tiempo, fin: tiempo + ejecutado });
    tiempo += ejecutado;
    restante.set(pid, rest - ejecutado);

    if (rest - ejecutado > 0) cola.push(pid);
    else fin.set(pid, tiempo);
  }

  // llegada = 0 para todos
  const detalle = lista.map(p => ({
    pid: p.pid,
    rafaga: p.rafaga,
    tiempo_retorno: fin.get(p.pid)!,
    tiempo_espera: fin.get(p.pid)! - p.rafaga,
  }));

  const prom = (campo: 'tiempo_espera' | 'tiempo_retorno') =>
    +(detalle.reduce((s, d) => s + d[campo], 0) / detalle.length).toFixed(2);

  return {
    gantt,
    orden_finalizacion: [...detalle]
      .sort((a, b) => fin.get(a.pid)! - fin.get(b.pid)!)
      .map(d => d.pid),
    procesos: detalle,
    promedio_espera: prom('tiempo_espera'),
    promedio_retorno: prom('tiempo_retorno'),
  };
}

export function crearRouterPlanificar(procesos: Proceso[], io: Server): Router {
  const router = Router();

  router.post('/planificar', (req, res) => {
    const { algoritmo = 'RR', quantum = 2 } = req.body;

    if (algoritmo !== 'RR') {
      return res.status(400).json({ error: 'Algoritmo no soportado (usa "RR")' });
    }
    if (!Number.isInteger(quantum) || quantum <= 0) {
      return res.status(400).json({ error: 'El quantum debe ser un entero mayor a 0' });
    }

    const candidatos = procesos.filter(p => p.estado === 'Nuevo' || p.estado === 'Listo');
    if (candidatos.length === 0) {
      return res.status(400).json({ error: 'No hay procesos para planificar' });
    }

    const resultado = roundRobin(candidatos, quantum);
    candidatos.forEach(p => (p.estado = 'Terminado'));

    const respuesta = { algoritmo: 'Round Robin', quantum, ...resultado };

    io.emit('planificacion', respuesta);
    io.emit('procesos', procesos);

    return res.json(respuesta);
  });

  return router;
}