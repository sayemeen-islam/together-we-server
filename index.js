
import express from 'express'
import { MongoClient, ObjectId } from 'mongodb';
import { createRemoteJWKSet, jwtVerify } from 'jose';
import 'dotenv/config'
import cors from 'cors'

const app= express()
const PORT=process.env.PORT || 5000
app.use(cors())
app.use(express.json())

//db connection
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
const joinedEventsCollection=db.collection('joinedEvents')

//verify token
const verifyToken = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  console.log(authHeader);
  
  if (!authHeader) {
    return res.status(401).send({ msg: "Unauthorized!" });
  }

  const token = authHeader.split("Bearer ")[1];

  if (!token) {
    return res.status(401).send({ msg: "Unauthorized!" });
  }

  const JWKS=createRemoteJWKSet(new URL(`${process.env.CLIENT_URL}/api/auth/jwks`))

  try {
    const {payload}=await jwtVerify(token,JWKS);
    req.user = payload;
    next()
  }
  catch(error) {
    return res.status(401).send({msg:"Unauthorized!"})
  }
}

app.get("/", (req, res) => {
  res.send({ message: "Server is running Successfully!" });
});

// Create Event (Private)
app.post('/events/create',verifyToken,async(req,res)=>{
  const event = {
    ...req.body,
    userName: req.user.name,
    email: req.user.email
  }

  const result=await eventsCollection.insertOne(event)
  res.send(result)
})

// Get Upcoming Events (Public)
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

// Get Event Details (Public)
app.get('/event/:id',async(req,res)=>{
  const id=req.params.id

  const event=await eventsCollection.findOne({_id:new ObjectId(id)})

  const participantCount=await joinedEventsCollection.countDocuments({
    eventId:new ObjectId(id)
  })

  res.send({
    ...event,
    participantCount
  })
})

// Join Event (Private)
app.post('/join', verifyToken, async (req, res) => {
  const { eventId } = req.body;

  const alreadyJoined = await joinedEventsCollection.findOne({
    eventId: new ObjectId(eventId),
    userEmail: req.user.email
  });

  if (alreadyJoined) {
    return res.status(409).send({
      message: "You have already joined this event."
    });
  }

  const joinedEvent = {
    eventId: new ObjectId(eventId),
    userEmail: req.user.email,
    userName: req.user.name,
    joinedAt: new Date()
  };

  const result = await joinedEventsCollection.insertOne(joinedEvent);

  res.send(result);
});

// Get Joined Events (Private)
app.get('/joined-events', verifyToken, async (req, res) => {
  const joinedEvents = await joinedEventsCollection.aggregate([
    {
      $match: {
        userEmail: req.user.email
      }
    },
    {
      $lookup: {
        from: 'events',
        localField: 'eventId',
        foreignField: '_id',
        as: 'event'
      }
    },
    {
      $unwind: '$event'
    },
    {
      $sort: {
        'event.eventDate': 1
      }
    }
  ]).toArray();

  res.send(joinedEvents);
});

app.get('/manage-events', verifyToken, async (req, res) => {
  const events = await eventsCollection
    .find({ email: req.user.email })
    .toArray();

  res.send(events);
});



app.listen(PORT,()=>{
  console.log(`server is running in port ${PORT}`);
})

export default app
