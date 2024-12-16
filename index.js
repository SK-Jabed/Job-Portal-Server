const express = require("express");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const cookieParser = require('cookie-parser');
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(cookieParser());


const uri =
  `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.baizo.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();
    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );

    // Auth Related API
    app.post("/jwt", async (req, res) => {
      const user = req.body;
      const token = jwt.sign(user, process.env.JWT_SECRET, { expiresIn: "2h" });
      res
        .cookie("token", token, {
          httpOnly: true,
          secure: false, // http://localhost:5173/auth/login
        })
        .send({ success: true });
    })

    // Jobs Related API
    const jobsCollection = client.db("jobPortal").collection("jobs");
    const jobApplicationCollection = client.db("jobPortal").collection("job_applications");

    app.get("/allJobs", async (req, res) => {
      const email = req.query.email;
      let query = {};

      if (email) {
        query = { hr_email: email }
      }

      const cursor = jobsCollection.find(query);
      const result = await cursor.toArray();
      res.send(result);
    })

    app.get("/allJobs/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await jobsCollection.findOne(query);
      res.send(result);
    })

    app.post("/allJobs", async (req, res) => {
      const newJob = req.body;
      const result = await jobsCollection.insertOne(newJob);
      res.send(result);
    })

    // Job application API
    app.get("/job-application", async (req, res) => {
      const email = req.query.email;
      const query = { applicant_email: email };
      const result = await jobApplicationCollection.find(query).toArray();

      for (const application of result) {
        const query1 = { _id: new ObjectId(application.job_id) }
        const job = await jobsCollection.findOne(query1);

        if (job) {
          application.title = job.title;
          application.location = job.location;
          application.company = job.company;
          application.company_logo = job.company_logo;
        }
      }
      res.send(result);
    })

    app.get("/job-applications/jobs/:job_id", async (req, res) => {
      const jobId = req.params.job_id;
      const query = { job_id: jobId };
      const result = await jobApplicationCollection.find(query).toArray();
      res.send(result);
    })

    app.post("/job-applications", async (req, res) => {
      const application = req.body;
      const result = await jobApplicationCollection.insertOne(application);

      // Use aggregate (Not the best way)
      const id = application.job_id;
      const query = { _id: new ObjectId(id) }
      const job = await jobsCollection.findOne(query);
      
      let newCount = 0;
      if (job.applicationCount) {
        newCount = job.applicationCount + 1;
      }
      else {
        newCount = 1;
      }

      // Now Update The Job Info
      const filter = { _id: new ObjectId(id) };
      const updatedDoc = {
        $set: {
          applicationCount: newCount
        }
      }

      const updatedResult = await jobsCollection.updateOne(filter, updatedDoc);

      res.send(result);
    })

    app.patch("/job-applications/:id", async (req, res) => {
      const id = req.params.id;
      const data = req.body;
      const filter = {_id: new ObjectId(id)};
      const updatedDoc = {
        $set: {
          status: data.status
        }
      }

      const result = await jobApplicationCollection.updateOne(filter, updatedDoc);
      res.send(result);
    });

  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);


app.get("/", (req, res) => {
  res.send("Job Portal Server is Running");
});

app.listen(port, () => {
  console.log(`Job Portal Server is Running on Port: ${port}`);
});