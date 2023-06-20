const express = require('express');
const cors = require('cors');
require('dotenv').config();

const port = process.env.PORT || 5000;
const { MongoClient, ServerApiVersion } = require('mongodb');
const app = express();

app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.dbUser}:${process.env.dbPass}@cluster0.jdzngze.mongodb.net/?retryWrites=true&w=majority`;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    await client.connect();
    const userCollection = client
      .db('finalProjectDatabase')
      .collection('userCollection');
  } finally {
  }
}
run().catch(console.dir);

app.get('/', async (req, res) => {
  res.send('Project Server Running');
});

app.listen(port, () => {
  console.log('Project server running on port', port);
});
