const express = require('express');
const cors = require('cors');
require('dotenv').config()
const { MongoClient, ServerApiVersion } = require('mongodb');
const app = express();
const port = process.env.PORT || 3000;

app.use(cors())
app.use(express.json());

app.get('/', (req, res) => {
    res.send('server is running')
})

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.v0yodsg.mongodb.net/?appName=Cluster0`;


const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});
async function run() {
  try {
   
    await client.connect();


    const db = client.db('studymate-partner');
    const partnersCollection = db.collection('partners')




    app.get('/partners', async(req, res) => {
        const cursor = partnersCollection.find();
        const result = await cursor.toArray();
        res.send(result);
    })

    app.post('/partners', async(req, res) => {
        const data = req.body;
        const result = await partnersCollection.insertOne(data);
        res.send(result);
    })





    
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
   
  }
}
run().catch(console.dir);



app.listen(port, () => {
    console.log(`Server is running ${port}`);
    
})