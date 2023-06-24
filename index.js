const express = require('express');
const cors = require('cors');
const nodemailer = require('nodemailer');
const mg = require('nodemailer-mailgun-transport');
require('dotenv').config();

const port = process.env.PORT || 5000;
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const app = express();

app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.dbUser}:${process.env.dbPass}@cluster0.jdzngze.mongodb.net/?retryWrites=true&w=majority`;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true
  }
});

const auth = {
  auth: {
    api_key: process.env.SEND_MAIL_KEY,
    domain: process.env.SEND_MAIL_DOMAIN
  }
};
const mailTransporter = nodemailer.createTransport(mg(auth));

const sendEmailToAuthor = (authorEmail, articleId) => {
  mailTransporter.sendMail(
    {
      from: 'abdullahhosenakash@gmail.com',
      to: authorEmail, // An array if you have multiple recipients.
      // cc: 'second@domain.com',
      // bcc: 'secretagent@company.gov',
      subject: 'Your article has been submitted',
      // replyTo: 'reply2this@company.com',
      //You can use "html:" to send HTML email content. It's magic!
      html: `
      <h3>Your article has been submitted successfully</h3>
      <p>You can see your available articles <a href='http://localhost:3000/availableArticles/${articleId}'>here</a></p>
      <p>Thank you!</p>
      `
    },
    (err, info) => {
      if (err) {
        // console.log(`Error: ${err}`);
      } else {
        // console.log(`Response: ${info}`);
      }
    }
  );
};

const sendEmailToEditor = (editorEmail, articleId, authorName) => {
  mailTransporter.sendMail(
    {
      from: 'abdullahhosenakash@gmail.com',
      to: editorEmail, // An array if you have multiple recipients.
      // cc: 'second@domain.com',
      // bcc: 'secretagent@company.gov',
      subject: 'A new article is submitted',
      // replyTo: 'reply2this@company.com',
      //You can use "html:" to send HTML email content. It's magic!
      html: `
      <h3>A new article is submitted from ${authorName}</h3>
      <p><a href='http://localhost:3000/availableArticles/${articleId}'>Click here</a> to see the article now</p>
      <p>Thank you!</p>
      `
    },
    (err, info) => {
      if (err) {
        // console.log(`Error: ${err}`);
      } else {
        // console.log(`Response: ${info}`);
      }
    }
  );
};

async function run() {
  try {
    await client.connect();
    const userCollection = client
      .db('finalProjectDatabase')
      .collection('userCollection');

    const articleCollection = client
      .db('finalProjectDatabase')
      .collection('articleCollection');

    // GET methods
    // app.get('/isUserAvailable', async (req, res) => {
    //   const { userEmail } = req.query;
    //   const result = await userCollection.findOne({ userEmail });
    //   console.log(result);
    // });

    app.get('/articles', async (req, res) => {
      const result = await articleCollection.find().toArray();
      // console.log(result);
      res.send(result);
    });

    app.get('/article', async (req, res) => {
      const { articleId } = req.query;
      const query = { _id: new ObjectId(articleId) };
      const result = await articleCollection.findOne(query);
      // console.log(result);
      res.send(result);
    });

    app.get('/authorArticles', async (req, res) => {
      const { authorEmail } = req.query;
      const result = await articleCollection.find({ authorEmail }).toArray();
      // console.log(result);
      res.send(result);
    });

    app.get('/userRole', async (req, res) => {
      const { userEmail } = req.query;
      const result = await userCollection.findOne({ userEmail });
      res.send({ userRole: result?.userRole });
    });

    // POST methods
    app.post('/addUser', async (req, res) => {
      // const {userRole}=req.query;
      const newUser = req.body;

      const availableUser = await userCollection.findOne({
        userEmail: newUser.userEmail
      });
      if (availableUser) {
        res.send({ message: 'User already exists' });
      } else {
        const result = await userCollection.insertOne(newUser);
        res.send(result);
      }
    });

    app.post('/addArticle', async (req, res) => {
      const newArticle = req.body;
      const result = await articleCollection.insertOne(newArticle);
      const editor = await userCollection.findOne({ userRole: 'editor' });
      const editorEmail = editor?.userEmail;
      const articleId = result?.insertedId?.toString()?.split('"')[0];
      sendEmailToAuthor(newArticle?.authorEmail, articleId);
      sendEmailToEditor(editorEmail, articleId, newArticle?.authorName);
      res.send(result);
    });
  } finally {
  }
}
run().catch(console.dir);

app.get('/', async (req, res) => {
  res.send('Project Server Running');
});

app.listen(port, () => {
  console.log('Project server running on port', port);
});
