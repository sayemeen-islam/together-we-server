import express from 'express' 
import { MongoClient, ObjectId } from 'mongodb';
import 'dotenv/config'
import cors from 'cors'

const app= express()
const PORT=process.env.PORT || 5000
app.use(cors())
app.use(express.json())

const client = new MongoClient(process.env.MONGODB_URL);

export async function connectToMongoDB() {
  try {
    await client.connect();
    console.log("You successfully connected to MongoDB!");
    return client;
  } catch (err) {
    console.dir(err);
  }
}

const connectedClient=await connectToMongoDB()
const db=connectedClient.db('together-we')
const eventsCollection=db.collection('events')



app.get("/", (req, res) => {
  res.send({ message: "Server is running Successfully!" });
});

app.post('/events/create',async(req,res)=>{
  console.log('from client', req.body);
  const event=req.body
    const result=await eventsCollection.insertOne(event)
    res.send(result)
})

app.get("/events", async (req, res) => {
  try {
    const today = new Date().toISOString().split("T")[0];

    const events = await eventsCollection
      .find({
        eventDate: { $gte: today },
      })
      .sort({ eventDate: 1 })
      .toArray();

    res.send(events);
  } catch (error) {
    res.status(500).send({
      message: "Failed to fetch events",
    });
  }
});

app.listen(PORT,()=>{
  console.log(`server is running in port ${PORT}`);
  
})

export default app