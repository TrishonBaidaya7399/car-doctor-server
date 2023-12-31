const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const app = express();
const port = process.env.PORT || 5000;
require('dotenv').config()
// middleware
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.c2jrci5.mongodb.net/?retryWrites=true&w=majority`;

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
    await client.connect();

    // Get the database and collection on which to run the operation
    const serviceCollection = client.db("CarDoctor").collection("services");
    const bookingCollection = client.db("CarDoctor").collection("bookings");
    const testimonialsCollection = client.db("CarDoctor").collection("testimonials");
    const teamCollection = client.db("CarDoctor").collection("team");

//<------------------------------------Auth--------------------------------------------->
    app.post('/jwt', async(req, res)=>{
      const user = req.body;
      console.log(user);
      const token = jwt.sign(user, 'secret', {expiresIn: '1h'})
      res.send(token);
    })


//<------------------------------------Team--------------------------------------------->
    // Get all services data
    app.get('/team', async(req, res)=>{
        const cursor = teamCollection.find();
        const result = await cursor.toArray();
        res.send(result);    
    })
//<------------------------------------Testimonials--------------------------------------------->
    // Get all services data
    app.get('/testimonials', async(req, res)=>{
        const cursor = testimonialsCollection.find();
        const result = await cursor.toArray();
        res.send(result);    
    })
//<------------------------------------Services--------------------------------------------->
    // Get all services data
    app.get('/services', async(req, res)=>{
        const cursor = serviceCollection.find();
        const result = await cursor.toArray();
        res.send(result);    
    })

    app.get('/services/:id', async(req, res)=>{
        const id = req.params.id;
        const query= { _id: new ObjectId(id) }
        const options = {
          projection: {title: 1, price: 1, service_id: 1, img: 1}
        }
        const result = await serviceCollection.findOne(query, options);
        res.send(result);
    })

//<------------------------------------Booking--------------------------------------------->
    //set booking data
    app.post('/bookings', async(req, res)=>{
      const booking = req.body;
     const result = await bookingCollection.insertOne(booking);
     res.send(result);
    } )

    //get some booking data 

    app.get('/bookings', async(req, res)=>{
      let query = {};
      if(req.query?.email){
        query = {email: req.query.email}
      }
      const result = await bookingCollection.find(query).toArray();
      res.send(result);
    })

    //update bookings
    app.patch('/bookings/:id', async(req, res)=>{
      const id = req.params.id;
      const filter = {_id: new ObjectId(id)}
      const updatedBooking = req.body;
      console.log(updatedBooking);
      const updatedDoc = {
        $set: {
          status: updatedBooking.status
        }
      }
      const result = await bookingCollection.updateOne(filter, updatedDoc);
      res.send(result);
    })
    
    //remove bookings
    app.delete('/bookings/:id', async(req, res)=>{
      const id = req.params.id;
      const query = {_id : new ObjectId(id)}
      const result = await bookingCollection.deleteOne(query);
      res.send(result);
    })

   // remove all bookings
    app.delete('/bookings', async(req, res)=>{
      let query = {};
      if(req.query?.email){
        query = {email: req.query.email}

      }
      const result = await bookingCollection.deleteMany(query);
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







app.get('/', (req, res)=>{
    res.send("Server is running!!!")
})
app.listen(port, ()=> {
   console.log(`Server is running on port: ${port}`);
})