const express=require('express');
const cors=require('cors');
const app=express();
const { MongoClient, ServerApiVersion } = require('mongodb');
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const uri = "mongodb+srv://summer-school-site:8zCDlFYQCcluSQ7M@cluster11.cpm08j1.mongodb.net/?retryWrites=true&w=majority";

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();
    const schoolClass=client.db('languageLearningDB').collection('languageLearning');


    app.get('/classes',async(req,res)=>{
      const result=await schoolClass.find().toArray();
      res.send(result);
    })

    const instructors=client.db('languageLearningDB').collection('Instructors')
    app.get('/instructors',async(req,res)=>{
      const result=await instructors.find().toArray();
      res.send(result);
    })


    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);



app.get('/', (req, res) => {
    res.send("server is running")
})

app.listen(port, () => {
    console.log(`the server port number is running ${port}`);
})