import { Router } from 'express';
import { Server } from 'socket.io';
import { Proceso } from '../models/proceso';

export function crearRouterProcesos(procesos: Proceso[], io: Server): Router {
  const router = Router();

  router.get('/procesos', (req, res) => {
    const { estado } = req.query;

    if (estado && typeof estado === 'string') {
      const filtrados = procesos.filter(
        p => p.estado.toLowerCase() === estado.toLowerCase()
      );
      return res.json(filtrados);
    }

    //Este es un filtro para que no devuelva todos los procesos.
    return res.json(procesos);
  });

  return router;
}