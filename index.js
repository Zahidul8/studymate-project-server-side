const express = require('express');
const cors = require('cors');
require('dotenv').config()
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
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
   
    // await client.connect();


    const db = client.db('studymate-partner');
    const partnersCollection = db.collection('partners');
    const partnerCountCollection = db.collection('partnerCount')




    app.get('/partners', async(req, res) => {
      const cursor = partnersCollection.find();
      const result = await cursor.toArray();
      res.send(result);
    })
    app.get('/topPartners', async(req, res) => {
        const cursor = partnersCollection.find().sort({rating: -1}).limit(6);
        const result = await cursor.toArray();
        res.send(result);
    })
    app.get('/reviewPartner', async(req, res) => {
         const cursor = partnersCollection.find().limit(3);
        const result = await cursor.toArray();
        res.send(result);

    })
    app.get('/search', async(req, res) => {
       const searchText = req.query.search;
      const query = {subject: {$regex: searchText, $options: 'i'}}
      const cursor = partnersCollection.find(query);
      const result = await cursor.toArray();
      res.send(result);
    })

    app.get('/partners/:id', async(req, res) => {
        const id = req.params.id;
        const query = {_id: new ObjectId(id)};
        const result = await partnersCollection.findOne(query);
        res.send(result);
    })

    app.patch('/partners/:id', async (req, res) => {
      const id = req.params.id;
      const query = {_id: new ObjectId(id)};
      const update = {
        $inc: {  
        patnerCount : 1
            
        }
      }
      const partnerCount = await partnersCollection.updateOne(query, update)
      res.send(partnerCount);


    })

    app.post('/partners', async(req, res) => {
        const data = req.body;
        const result = await partnersCollection.insertOne(data);
        res.send(result);
    })

    // partner count apis 

    app.get('/partnerCount', async (req, res) => {
      const email = req.query.email;
      const query = {requesterEmail: email};
      const cursor =partnerCountCollection.find(query);
      const result = await cursor.toArray();
      res.send(result);


    })

    app.post('/partnerCount', async(req, res) => {
      const data = req.body;
      const result = await partnerCountCollection.insertOne(data);
      res.send(result);
    })

    app.patch('/partnerCount/:id', async(req, res) => {
      const data = req.body;
      const id = req.params.id;
      const query = {_id: new ObjectId(id)};
      const update = {
        $set: {
          subject: data.subject,
          studyMode: data.studyMode
        }
      }

      const result = await partnerCountCollection.updateOne(query, update)
      res.send(result);

    })

    app.delete('/partnerCount/:id', async(req, res) => {
      const id = req.params.id;
      const query = {_id: new ObjectId(id)};
      const result = await partnerCountCollection.deleteOne(query);
      res.send(result);

    })





    
    // await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
   
  }
}
run().catch(console.dir);



app.listen(port, () => {
    console.log(`Server is running ${port}`);
    
})