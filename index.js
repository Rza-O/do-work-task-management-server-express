require('dotenv').config();
const cors = require('cors');
const express = require('express');
const morgan = require('morgan');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const app = express();
const port = process.env.PORT || 5000;
const { Server } = require('socket.io');
const http = require('http');

// middleware
app.use(morgan('dev'));
app.use(cors());
app.use(express.json());

const server = http.createServer(app);
const io = new Server(server, {
   cors: { origin: "*" },
});

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
      const changeStream = tasksCollection.watch();


      // Adding task to the db
      app.post('/tasks', async (req, res) => {
         const { title, description, dueDate, status, order } = req.body;
         const newTask = { title, description, dueDate: new Date(dueDate), status, order };
         const result = await tasksCollection.insertOne(newTask);
         res.send(result);
      });

      // Getting all the tasks from the collection
      app.get('/tasks', async (req, res) => {
         const tasks = await tasksCollection.find().sort({ order: 1 }).toArray();
         res.send(tasks);
      });

      // Updating a task
      app.put('/tasks/:id', async (req, res) => {
         const { id } = req.params;
         const { title, description, dueDate, status, order } = req.body;
         const updatedTask = { title, description, dueDate: new Date(dueDate), status, order };
         const result = await tasksCollection.updateOne(
            { _id: new ObjectId(id) },
            { $set: updatedTask }
         );
         res.send(result);
      });

      // Deleting a task
      app.delete('/tasks/:id', async (req, res) => {
         const { id } = req.params;
         const result = await tasksCollection.deleteOne({ _id: new ObjectId(id) });
         res.send(result);
      });

      // MongoDB Change Stream for real-time updates

      changeStream.on("change", async () => {
         const updatedTasks = await tasksCollection.find().sort({ order: 1 }).toArray();
         io.emit('tasksUpdated', updatedTasks);
      });

      
      io.on("connection", async (socket) => {
         console.log("User connected");

         // Send initial tasks to new connections
         socket.emit("tasksUpdated", await tasksCollection.find().toArray());

         socket.on("disconnect", () => {
            console.log("User disconnected");
         });
      });

      console.log("Pinged your deployment. You successfully connected to MongoDB!");
   } catch (error) {
      console.error('Error during initialization:', error);
   }
}

run().catch(console.dir);

app.get('/', (req, res) => {
   res.send('Hello, Welcome to Do-Work');
});

// Start the server
server.listen(port, () => {
   console.log(`Do-Work server is running at ${port}`);
});
