const express = require('express');
const cors = require('cors');
const app = express();
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const stripe = require('stripe')('sk_test_51NEmG3IxzytApYUlezdVCVvSiGKYTMPRcizhPcJbk70FNEUHtQQ4Zo6Oypdn7Jmpir3PLHlhMOx0zLRuvL0dzqhA00ZSSQyNYP')
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
    const schoolClass = client.db('languageLearningDB').collection('languageLearning');


    app.get('/classes', async (req, res) => {
      const result = await schoolClass.find().toArray();
      res.send(result);
    })

    const instructors = client.db('languageLearningDB').collection('Instructors')
    app.post('/instructors', async (req, res) => {
      const instructor = req.body;
      const result = await instructors.insertOne(instructor);
      res.send(result);
    })

    app.get('/instructors', async (req, res) => {
      const result = await instructors.find().toArray();
      res.send(result);
    })
    app.get('/instructors/:email', async (req, res) => {
      const email = req.params.email;
      const query = { email: email };
      const result = await instructors.find(query).toArray();
      res.send(result);
    })
    app.delete('/instructors/:id',async(req,res)=>{
      const id=req.params.id;
      const query={_id:new ObjectId(id)}
      const result=await instructors.deleteOne(query);
      res.send(result);
    })
    app.get('/instructor/:id', async (req, res) => {
      const id = req.params.id;
      const result = await instructors.findOne({ _id:new ObjectId(id) });
      res.send(result);
  })

    app.patch('/instructors/:id',async(req,res)=>{
      const id=req.params.id;
      const instructor=req.body;
      const filter={_id:new ObjectId(id)}
      const option={upsert:true}
      const updateInstructor={
        $set:{
          className:instructor.className,
          seat:instructor.seat,
          price:instructor.price,
          image:instructor.image,
        }
      }
      const result=await instructors.updateOne(filter,updateInstructor,option);
      res.send(result);
    })



    const discountClasses = client.db('languageLearningDB').collection('discounts');
    app.get('/discountClasses', async (req, res) => {
      const result = await discountClasses.find().toArray();
      res.send(result);
    })

    app.get('/discountClasses/:id', async (req, res) => {
      const id = req.params.id;
      const result = await discountClasses.findOne({ _id:new ObjectId(id) });
      res.send(result);
  })





    const students = client.db('languageLearningDB').collection('students');
    app.post('/students', async (req, res) => {
      const student = req.body;
      const result = await students.insertOne(student);
      res.send(result);
    })

    app.get('/students', async (req, res) => {
      const result = await students.find().toArray();
      res.send(result);
    })

    app.get('/students/:email', async (req, res) => {
      const email = req.params.email;
      const query = { email: email };
      const result = await students.find(query).toArray();
      res.send(result);
    })

    // app.patch('/students/:email',async(req,res)=>{
    //   const email = req.params.email;
    //   const query = { email: email };
    //   const selectedId=req.body.id;
    //   const option={upsert:true}
    //   const updateUser={
    //     $set:{
    //       id:selectedId,
    //     }
    //   }
    //   const result=await students.updateOne(query,updateUser,option);
    //   res.send(result);
    // })

    // --------------student payment system --------------------

    app.post('/create-payment-intent', async (req, res) => {
      const { price } = req.body;
      const amount = price * 100;
      const paymentIntent = await stripe.paymentIntents.create({
        amount: amount,
        currency: 'usd',
        payment_method_types: ['card']
      })
      res.send({
        clientSecret: paymentIntent.client_secret
      })
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