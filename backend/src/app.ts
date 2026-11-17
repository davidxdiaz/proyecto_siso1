import express from 'express';
import http from 'http';
import cors from 'cors';
import { Server } from 'socket.io';
import { crearRouterPlanificar } from './routes/planificar';
import { crearRouterProcesos } from './routes/procesos';
import { Proceso, procesosIniciales } from './models/proceso';

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
});

app.use(cors());
app.use(express.json());

// Cargamos los procesos iniciales en memoria
const procesos: Proceso[] = [...procesosIniciales];

// Rutas de la API (Edin y Gerardo)
app.use('/', crearRouterProcesos(procesos, io));
app.use('/', crearRouterPlanificar(procesos, io));

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Servidor SentinelOS corriendo en http://localhost:${PORT}`);
});