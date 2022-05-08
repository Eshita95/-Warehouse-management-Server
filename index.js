const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config();
const app = express();
const port = process.env.PORT || 5000;
// middle ware
app.use(cors());
app.use(express.json());



const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.absg5.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run() {
    try {
        await client.connect();
        const warehouseConnection = client.db("warehouse").collection("services")
        app.get('/service', async(req, res) =>{
            console.log('query',req.body)
            const page = parseInt(req.query.page);
            const size = parseInt(req.query.size)
      
            const query = {};
            const cursor = warehouseConnection.find(query);
            let services;
            if(page || size){
              services = await cursor.skip(page * size).limit(size).toArray();
            }
            else{
              services = await cursor.toArray()
            }
            
            res.send(services);
          })
      
      
          app.get('/productCount', async (req, res) => {
            const count = await warehouseConnection.estimatedDocumentCount();
            res.send({ count });
          });
          app.get('/service/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) }
            const result = await warehouseConnection.findOne(query)
            res.send(result)
          })
          // update
          app.put('/service/:id', async (req, res) => {
            const id = req.params.id;
            const update = req.body;
            const filter = { _id: ObjectId(id) };
            const option = { upsert: true };
            const updateService = {
              $set: {
                name: update.name,
                price: update.price,
                quantity: update.quantity,
                description: update.description,
              }
            }
            const result = await warehouseConnection.updateOne(filter,updateService,option);
            res.send(result);
          })
    }
    finally {

    }
};

run().catch(console.dir)


app.get("/", (req, res) => {
    res.send("warehouse managment running")
});

app.listen(port, () => {
    console.log("warehouse managment running", port)
});