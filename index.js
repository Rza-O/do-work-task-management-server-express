require('dotenv').config();
const cors = require('cors');
const express = require('express');
const morgan = require('morgan');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const app = express();
const port = process.env.PORT || 5000;

// middleware
app.use(morgan('dev'))
app.use(cors());
app.use(express.json());



const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.kbg9j.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

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

      const tasksCollection = client.db('tasks_management').collection('tasks');

      // adding task to the db
      app.post('/tasks', async (req, res) => {
         const { title, description, dueDate, status, order } = req.body
         const newTask = { title, description, dueDate: new Date(dueDate), status, order };
         const result = await tasksCollection.insertOne(newTask);
         res.send(result);
      })

      // getting all the tasks from the collection
      app.get('/tasks', async (req, res) => {
         const tasks = await tasksCollection.find().sort({ order: 1 }).toArray();
         res.send(tasks);
      })

      // updating a task
      app.put('/tasks/:id', async (req, res) => {
         const { id } = req.params
         const updatedTask = { title, description, dueDate: new Date(dueDate), status, order }
         const result = await tasksCollection.updateOne(
            { _id: new ObjectId(id) },
            { $set: updatedTask }
         )
         res.send(result);
      })



      console.log("Pinged your deployment. You successfully connected to MongoDB!");
   } finally {
      // Ensures that the client will close when you finish/error
      // await client.close();
   }
}
run().catch(console.dir);


app.get('/', async (req, res) => {
   res.send('Hello, Welcome to Do-Work')
})

app.listen(port, () => {
   console.log(`Do-Work server is running at ${port}`)
})