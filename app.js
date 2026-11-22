import express from 'express';
import { fileURLToPath } from 'node:url';
import router from './routes/index.js';

const app = express();

app.use(express.json());
app.use(express.static(fileURLToPath(new URL('./public/', import.meta.url))));
app.use(router);

export default app;
