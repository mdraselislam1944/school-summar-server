const express = require('express');
const cors = require('cors');
const app = express();
require('dotenv').config();
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const stripe = require('stripe')(process.env.Stripe_secret)
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.SECRET_User}:${process.env.SECRET_PASS}@cluster11.cpm08j1.mongodb.net/?retryWrites=true&w=majority`;

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
    // await client.connect();
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
    app.get('/instructors/:id', async (req, res) => {
      const id = req.params.id;
      const result = await instructors.findOne({ _id:new ObjectId(id) });
      res.send(result);
  })

    app.get('/instructor/:email', async (req, res) => {
      const email = req.params.email;
      console.log(email);
      const query = { email: email };
      const result = await instructors.find(query).toArray();
      res.send(result);
    })

    app.get('/popularInstructor',async(req,res)=>{
      const popularInstructor = await instructors.find( { seat: { $lte: "20" } } ).toArray();
      console.log(popularInstructor)
      res.send(popularInstructor);
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

    // Feedback
    app.patch('/feedback/:id',async(req,res)=>{
      const id=req.params.id;
      const instructor=req.body;
      const filter={_id:new ObjectId(id)}
      const option={upsert:true}
      const updateInstructor={
        $set:{
          feedback:instructor.feedback,
        }
      }
      const result=await instructors.updateOne(filter,updateInstructor,option);
      res.send(result);
    })
    app.patch('/instructor/:id',async(req,res)=>{
      const id=req.params.id;
      const instructor=req.body;
      const filter={_id:new ObjectId(id)}
      const option={upsert:true}
      const updateInstructor={
        $set:{
          status:instructor.status,
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


    app.patch('/students/:id',async(req,res)=>{
      const id=req.params.id;
      const student=req.body;

      console.log(id,student)
      const filter={_id: new ObjectId(id)}
      const option={upsert:true}
      const updateStudent={
        $set:{
          role:student.role,
        }
      }
      const result=await students.updateOne(filter,updateStudent,option);
      res.send(result);
    })


    app.get('/students/:email', async (req, res) => {
      const email = req.params.email;
      const query = { email: email };
      const result = await students.find(query).toArray();
      res.send(result);
    })


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

    const studentPayment = client.db('languageLearningDB').collection('studentPayment')

    app.post('/studentPayment',async(req,res)=>{
      const Payment=req.body;
      console.log(Payment)
      const result=await studentPayment.insertOne(Payment);
      res.send(result);
    })
    app.get('/studentPayment/:email',async(req,res)=>{
      const email = req.params.email;
      const query = { email: email };
      const result = await studentPayment.find(query).toArray();
      res.send(result);
    })
    

    app.delete('/studentPayment/:id', async (req, res) => {
      const id = req.params.id;
      const query={_id:new ObjectId(id)}
      const result=await studentPayment.deleteOne(query);
      res.send(result);
    });

    app.get('/paymentStatus/:id', async (req, res) => {
      const id = req.params.id;
      const query={_id: id}
      const result=await studentPayment.findOne(query);
      res.send(result);
  })
    

    app.patch('/studentPayment/:id', async (req, res) => {
      const id = req.params.id;
      const payment = req.body;
      console.log(id, payment.paymentId);
      const filter = { _id: id };
      const option = { upsert: true };
      const updatePayment = {
        $set: {
          paymentId: payment.paymentId,
        },
      };
      const result = await studentPayment.updateOne(filter, updatePayment, option);
      res.send(result);
    });
    








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