require('dotenv').config();
const cors = require('cors');
const express = require('express');
const morgan = require('morgan');
const { MongoClient, ObjectId, ServerApiVersion } = require('mongodb');

const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(morgan('dev'));
app.use(cors());
app.use(express.json());

// MongoDB Connection
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.kbg9j.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;
const client = new MongoClient(uri, {
   serverApi: { version: ServerApiVersion.v1, strict: true, deprecationErrors: true }
});

async function run() {
   try {
      await client.connect();
      console.log(" Connected to MongoDB");

      const db = client.db('tasks_management');
      const tasksCollection = db.collection('tasks');
      const usersCollection = db.collection('users');

      //Real-time MongoDB Change Stream
      app.get('/tasks/stream', async (req, res) => {
         res.setHeader('Content-Type', 'text/event-stream');
         res.setHeader('Cache-Control', 'no-cache');
         res.setHeader('Connection', 'keep-alive');
         res.flushHeaders();

         const changeStream = tasksCollection.watch();
         changeStream.on('change', async () => {
            const updatedTasks = await tasksCollection.find().sort({ order: 1 }).toArray();
            res.write(`data: ${JSON.stringify(updatedTasks)}\n\n`);
         });

         req.on('close', () => {
            changeStream.close();
            res.end();
         });
      });

      //Save user details on first login
      app.post('/users', async (req, res) => {
         const { email, displayName } = req.body;
         if (!email || !displayName) return res.status(400).send({ error: "Missing user details" });

         const existingUser = await usersCollection.findOne({ email });
         if (!existingUser) {
            const result = await usersCollection.insertOne({ email, displayName });
            res.send(result)
         } else {
            res.send({ message: "User Already exists" });
         }
      });

      //Create a new task
      app.post('/tasks', async (req, res) => {
         const { title, description, category, userEmail, order } = req.body;
         if (!title || !category || !userEmail) return res.status(400).send({ error: "Missing required fields" });

         // Get userId from users collection
         const user = await usersCollection.findOne({ email: userEmail });
         if (!user) return res.status(404).send({ error: "User not found" });

         const newTask = { title, description, category, userId: user._id, order, createdAt: new Date() };
         const result = await tasksCollection.insertOne(newTask);
         res.send(result);
      });


      //Fetch tasks for a specific user
      app.get('/tasks', async (req, res) => {
         const { userEmail } = req.query;
         if (!userEmail) return res.status(400).send({ error: "User email required" });

         // Get userId from users collection
         const user = await usersCollection.findOne({ email: userEmail });
         if (!user) return res.status(404).send({ error: "User not found" });

         const tasks = await tasksCollection.find({ userId: user._id }).sort({ order: 1 }).toArray();
         res.send(tasks);
      });

      //Update a task (edit title, description, category, or order)
      app.put('/tasks/:id', async (req, res) => {
         const { id } = req.params;
         const { title, description, category, order } = req.body;

         const result = await tasksCollection.updateOne(
            { _id: new ObjectId(id) },
            { $set: { title, description, category, order } }
         );
         res.send(result);
      });


      //Delete a task
      app.delete('/tasks/:id', async (req, res) => {
         const { id } = req.params;
         const result = await tasksCollection.deleteOne({ _id: new ObjectId(id) });
         res.send(result);
      });

   } catch (error) {
      console.error("❌ Error during initialization:", error);
   }
}

run().catch(console.dir);

// ✅ Health Check Endpoint
app.get('/', (req, res) => {
   res.send('🚀 Do-Work Task Management API is running!');
});

// ✅ Start the Server
app.listen(port, () => {
   console.log(`🚀 Server running on port ${port}`);
});
