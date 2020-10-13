import express from 'express';

import './database/connection';

const app = express();
app.use(express.json());

app.listen(3333);
