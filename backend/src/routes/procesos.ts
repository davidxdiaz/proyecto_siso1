import { Router } from 'express';
import { Server } from 'socket.io';
import { Proceso } from '../models/proceso';

export function crearRouterProcesos(procesos: Proceso[], io: Server): Router {
  const router = Router();

  // GET /procesos -> Listar todos los procesos y sus estados
  router.get('/procesos', (req, res) => {
    const { estado } = req.query;

    if (estado && typeof estado === 'string') {
      const filtrados = procesos.filter(
        p => p.estado.toLowerCase() === estado.toLowerCase()
      );
      return res.json(filtrados);
    }

    // Devuelve todos los procesos en memoria cuando no hay filtro
    return res.json(procesos);
  });

  // POST /procesos -> Crear un nuevo proceso en estado 'Nuevo'
  router.post('/procesos', (req, res) => {
    const { pid, prioridad, rafaga } = req.body;

    // 1. Validar que prioridad y ráfaga vengan y sean números válidos
    if (
      prioridad === undefined ||
      rafaga === undefined ||
      isNaN(Number(prioridad)) ||
      isNaN(Number(rafaga)) ||
      Number(rafaga) <= 0
    ) {
      return res.status(400).json({
        error: 'Datos inválidos: prioridad y rafaga (mayor a 0) son obligatorios.',
      });
    }

    // 2. Asignar PID automático si no lo envían, o verificar que no esté repetido
    let nuevoPid: number | string = pid;
    if (nuevoPid === undefined || nuevoPid === null || nuevoPid === '') {
      const pidsNumericos = procesos
        .map(p => Number(p.pid))
        .filter(n => !isNaN(n));
      nuevoPid = pidsNumericos.length > 0 ? Math.max(...pidsNumericos) + 1 : 101;
    } else {
      const existe = procesos.some(p => String(p.pid) === String(nuevoPid));
      if (existe) {
        return res.status(409).json({
          error: `Ya existe un proceso con el PID ${nuevoPid}.`,
        });
      }
    }

    // 3. Crear el proceso con estado inicial 'Nuevo' y guardarlo en memoria
    const nuevoProceso: Proceso = {
      pid: nuevoPid,
      prioridad: Number(prioridad),
      rafaga: Number(rafaga),
      estado: 'Nuevo',
    };

    procesos.push(nuevoProceso);

    // 4. Notificar por Socket.io en tiempo real
    io.emit('proceso:creado', nuevoProceso);
    io.emit('procesos:actualizados', procesos);

    return res.status(201).json(nuevoProceso);
  });

  return router;
}