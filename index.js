const express = require('express');
const cors = require('cors');
require('dotenv').config()
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const app = express();
const port = process.env.PORT || 3000;

// middleware 

app.use(cors())
app.use(express.json());


const verifyFireBaseToken = (req, res, next) => {

  const authorization = req.headers.authorization;
  if (!authorization) {
     return res.status(401).send({ message: 'unauthorized access' });
  }

  const token = authorization.split(' ')[1];
  if (!token) {
    return res.status(401).send({ message: 'unauthorized access' });
    
  }
  
  next();
}




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




    app.get('/partners', async (req, res) => {
      const cursor = partnersCollection.find();
      const result = await cursor.toArray();
      res.send(result);
    })
    app.get('/topPartners', async (req, res) => {
      const cursor = partnersCollection.find().sort({ rating: -1 }).limit(6);
      const result = await cursor.toArray();
      res.send(result);
    })
    app.get('/reviewPartner', async (req, res) => {
      const cursor = partnersCollection.find().limit(3);
      const result = await cursor.toArray();
      res.send(result);

    })
    // sorting data
    app.get('/search', async (req, res) => {
      const searchText = req.query.search;
      const sortedOrder = req.query.sort;
      const query = { subject: { $regex: searchText, $options: 'i' } }
      
      const order = [
        {$match: query},
        {
          $addFields: {
            sortValue: {
              $cond: [
                {$eq: ['$experienceLevel', 'Beginner']}, 1,
                {$cond: [
                   {$eq: ['$experienceLevel', 'Intermediate']}, 2,
                   {$cond: [
                     {$eq: ['$experienceLevel', 'Advanced']}, 3,
                     0
                   ]}
                ]}
              ]
            }
          }
        }
      ];

      if (sortedOrder === 'asc') {
        order.push({$sort: {sortValue: 1}});
      } else if (sortedOrder === 'desc') {
        order.push({$sort: {sortValue: -1}})
      }

      const result = await partnersCollection.aggregate(order).toArray();
      res.send(result);
    })

    app.get('/partners/:id',verifyFireBaseToken, async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await partnersCollection.findOne(query);
      res.send(result);
    })

    app.patch('/partners/:id',verifyFireBaseToken, async (req, res) => {
      const id = req.params.id;
      const { requesterEmail, email } = req.body;
      const filter = { email: email, requesterEmail: requesterEmail };
      const existingpartner = await partnerCountCollection.findOne(filter);
      const query = { _id: new ObjectId(id) };
    
      if (existingpartner) {
        return res.status(400).json({ message: "You have already sent a request to this partner." });

      } else {
          const update = {
        $inc: {
          patnerCount: 1

        }
      }
         const partnerCount = await partnersCollection.updateOne(query, update)
      res.send(partnerCount);
      }

     


    })

    app.post('/partners', verifyFireBaseToken, async (req, res) => {
      
      const data = req.body;
      const result = await partnersCollection.insertOne(data);
      res.send(result);
    })

    // partner count apis 

    app.get('/partnerCount', verifyFireBaseToken, async (req, res) => {
      const email = req.query.email;
      const query = { requesterEmail: email };
      const cursor = partnerCountCollection.find(query);
      const result = await cursor.toArray();
      res.send(result);


    })

    app.post('/partnerCount',verifyFireBaseToken, async (req, res) => {
      const data = req.body;
      const query = { email: req.body.email, requesterEmail: req.body.requesterEmail };
      const existingpartner = await partnerCountCollection.findOne(query);
      if (existingpartner) {
        return res.status(400).json({ message: "You have already sent a request to this partner." });
      } else {
        const result = await partnerCountCollection.insertOne(data);
        res.send(result);
      }

    })

    app.patch('/partnerCount/:id',verifyFireBaseToken, async (req, res) => {
      const data = req.body;
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const update = {
        $set: {
          subject: data.subject,
          studyMode: data.studyMode
        }
      }

      const result = await partnerCountCollection.updateOne(query, update)
      res.send(result);

    })

    app.delete('/partnerCount/:id',verifyFireBaseToken, async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
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