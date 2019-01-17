const express = require('express');

const cf = require('./index');

const app = express();
const port = 9000;

app.use(express.json());
app.use('/embed_rocks_proxy', cf.embed_rocks_proxy);

app.listen(port, () =>
  console.log(`Local testing app listening on port ${port}!`)
);
