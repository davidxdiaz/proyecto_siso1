import express from 'express';
import http from 'http';
import cors from 'cors';
import { Server } from 'socket.io';
import { crearRouterPlanificar } from './routes/planificar';
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

const procesos: Proceso[] = [...procesosIniciales];

app.use('/', crearRouterPlanificar(procesos, io));

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Servidor SentinelOS corriendo en http://localhost:${PORT}`);
  console.log('Procesos cargados en memoria:', procesos);
});