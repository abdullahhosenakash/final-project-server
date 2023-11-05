const express = require('express');
const cors = require('cors');
const crypto = require('crypto');
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

const sendEmailToAuthor = (authorsEmail, manuscriptId) => {
  mailTransporter.sendMail(
    {
      from: 'abdullahhosenakash@gmail.com',
      to: authorsEmail, // An array if you have multiple recipients.
      // cc: 'second@domain.com',
      // bcc: 'secretagent@company.gov',
      subject: 'Your manuscript has been submitted',
      // replyTo: 'reply2this@company.com',
      //You can use "html:" to send HTML email content. It's magic!
      html: `
      <p>Your manuscript has been submitted successfully</p>
      <p>You can see your manuscripts by <a href='http://localhost:3000/manuscriptsAsCoAuthor'>clicking here</a></p>
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

const sendEmailToEditor = (editorEmail, authorName, authorsEmail) => {
  mailTransporter.sendMail(
    {
      from: 'abdullahhosenakash@gmail.com',
      to: editorEmail, // An array if you have multiple recipients.
      // cc: 'second@domain.com',
      // bcc: 'secretagent@company.gov',
      subject: 'A new manuscript submitted',
      // replyTo: 'reply2this@company.com',
      //You can use "html:" to send HTML email content. It's magic!
      html: `
      <p>A new manuscript is submitted from ${authorName} where authors emails are (${authorsEmail})</p>
      <p><a href='http://localhost:3000/manuscriptsAsCoAuthor'>Click here</a> to see available manuscripts now</p>
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

const sendEmailToAuthorAfterForward = (
  selectedManuscript,
  forwardingDateTime
) => {
  const authorsEmail = [
    selectedManuscript?.authorEmail,
    selectedManuscript?.authorSequence?.map((author) => author.authorEmail)
  ];
  mailTransporter.sendMail(
    {
      from: 'abdullahhosenakash@gmail.com',
      to: authorsEmail, // An array if you have multiple recipients.
      // cc: 'second@domain.com',
      // bcc: 'secretagent@company.gov',
      subject: 'Your manuscript is forwarded for review',
      // replyTo: 'reply2this@company.com',
      //You can use "html:" to send HTML email content. It's magic!
      html: `
      <p>Your manuscript submitted on ${selectedManuscript?.dateTime} is forwarded at ${forwardingDateTime} to reviewers</p>
      <p>You can check the status of the manuscript at your dashboard by <a href='http://localhost:3000/manuscriptsAsCoAuthor'>clicking here</a></p>
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

const sendEmailToEditorAfterForward = (
  editorEmail,
  dateTime,
  authorName,
  authorEmail,
  reviewersInfo,
  forwardingDateTime,
  revised
) => {
  mailTransporter.sendMail(
    {
      from: 'abdullahhosenakash@gmail.com',
      to: editorEmail, // An array if you have multiple recipients.
      // cc: 'second@domain.com',
      // bcc: 'secretagent@company.gov',
      subject: `The manuscript is ${revised ? 're' : ''}forwarded for review`,
      // replyTo: 'reply2this@company.com',
      //You can use "html:" to send HTML email content. It's magic!
      html: `
      <p style='padding: 0'>The manuscript ${
        revised
          ? 'that was need revised told by the reviewers and again after revised and'
          : ''
      } submitted on ${dateTime} from <b>${authorName}</b> (${authorEmail}) is ${
        revised ? 're' : ''
      }forwarded at ${forwardingDateTime} to the reviewers successfully.</p>:
      <p style='padding: 0'>The reviewer${
        reviewersInfo?.length > 1 ? 's' : ''
      } info:<p>
      <table style='border: 1px solid black; border-collapse: collapse'>
        <thead>
          <tr>
            <th style='border: 1px solid black; padding: 3px'>Name</th>
            <th style='border: 1px solid black; padding: 3px'>Email</th>
          </tr>
        </thead>
        <tbody>
        ${
          reviewersInfo?.length === 1
            ? `<tr>
          <td style='border: 1px solid black; padding: 3px'>${reviewersInfo[0].reviewerName}</td>
            <td style='border: 1px solid black; padding: 3px'>${reviewersInfo[0].reviewerEmail}</td>
          </tr>`
            : reviewersInfo?.length === 2
            ? `<tr>
                <td style='border: 1px solid black; padding: 3px'>${reviewersInfo[0].reviewerName}</td>
                <td style='border: 1px solid black; padding: 3px'>${reviewersInfo[0].reviewerEmail}</td>
              </tr>
              <tr>
                <td style='border: 1px solid black; padding: 3px'>${reviewersInfo[1].reviewerName}</td>
                <td style='border: 1px solid black; padding: 3px'>${reviewersInfo[1].reviewerEmail}</td>
              </tr>`
            : reviewersInfo?.length === 3
            ? `<tr>
              <td style='border: 1px solid black; padding: 3px'>${reviewersInfo[0].reviewerName}</td>
              <td style='border: 1px solid black; padding: 3px'>${reviewersInfo[0].reviewerEmail}</td>
            </tr>
            <tr>
              <td style='border: 1px solid black; padding: 3px'>${reviewersInfo[1].reviewerName}</td>
              <td style='border: 1px solid black; padding: 3px'>${reviewersInfo[1].reviewerEmail}</td>
            </tr>
            <tr>
              <td style='border: 1px solid black; padding: 3px'>${reviewersInfo[2].reviewerName}</td>
              <td style='border: 1px solid black; padding: 3px'>${reviewersInfo[2].reviewerEmail}</td>
            </tr>`
            : reviewersInfo.length === 4
            ? `<tr>
              <td style='border: 1px solid black; padding: 3px'>${reviewersInfo[0].reviewerName}</td>
              <td style='border: 1px solid black; padding: 3px'>${reviewersInfo[0].reviewerEmail}</td>
            </tr>
            <tr>
              <td style='border: 1px solid black; padding: 3px'>${reviewersInfo[1].reviewerName}</td>
              <td style='border: 1px solid black; padding: 3px'>${reviewersInfo[1].reviewerEmail}</td>
            </tr>
            <tr>
              <td style='border: 1px solid black; padding: 3px'>${reviewersInfo[2].reviewerName}</td>
              <td style='border: 1px solid black; padding: 3px'>${reviewersInfo[2].reviewerEmail}</td>
            </tr>
            <tr>
              <td style='border: 1px solid black; padding: 3px'>${reviewersInfo[3].reviewerName}</td>
              <td style='border: 1px solid black; padding: 3px'>${reviewersInfo[3].reviewerEmail}</td>
            </tr>`
            : `<tr>
              <td style='border: 1px solid black; padding: 3px'>${reviewersInfo[0].reviewerName}</td>
              <td style='border: 1px solid black; padding: 3px'>${reviewersInfo[0].reviewerEmail}</td>
            </tr>
            <tr>
              <td style='border: 1px solid black; padding: 3px'>${reviewersInfo[1].reviewerName}</td>
              <td style='border: 1px solid black; padding: 3px'>${reviewersInfo[1].reviewerEmail}</td>
            </tr>
            <tr>
              <td style='border: 1px solid black; padding: 3px'>${reviewersInfo[2].reviewerName}</td>
              <td style='border: 1px solid black; padding: 3px'>${reviewersInfo[2].reviewerEmail}</td>
            </tr>
            <tr>
              <td style='border: 1px solid black; padding: 3px'>${reviewersInfo[3].reviewerName}</td>
              <td style='border: 1px solid black; padding: 3px'>${reviewersInfo[3].reviewerEmail}</td>
            </tr>
            <tr>
              <td style='border: 1px solid black; padding: 3px'>${reviewersInfo[4].reviewerName}</td>
              <td style='border: 1px solid black; padding: 3px'>${reviewersInfo[4].reviewerEmail}</td>
            </tr>`
        }
        </tbody>
      </table>
      <p style='padding: 0'>You can check the status of the manuscripts by <a href='http://localhost:3000/manuscriptsAsCoAuthor'>clicking here</a></p>
      <p style='padding: 0'>Thank you!</p>
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

const sendEmailToAuthorAfterRevise = (selectedManuscript, manuscriptId) => {
  const authorsEmail = [
    selectedManuscript?.authorEmail,
    selectedManuscript?.authorSequence?.map((author) => author.authorEmail)
  ];
  mailTransporter.sendMail(
    {
      from: 'abdullahhosenakash@gmail.com',
      to: authorsEmail, // An array if you have multiple recipients.
      // cc: 'second@domain.com',
      // bcc: 'secretagent@company.gov',
      subject: 'Your manuscript is resubmitted',
      // replyTo: 'reply2this@company.com',
      //You can use "html:" to send HTML email content. It's magic!
      html: `
      <p>Your manuscript ${manuscriptId} that was need revised told by the reviewers is resubmitted successfully at ${selectedManuscript?.dateTime}</p>
      <p>You can check the status of the manuscript at your dashboard by <a href='http://localhost:3000/manuscriptsAsCoAuthor'>clicking here</a></p>
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

const sendEmailToEditorAfterRevise = (editorEmail, manuscriptId, dateTime) => {
  mailTransporter.sendMail(
    {
      from: 'abdullahhosenakash@gmail.com',
      to: editorEmail, // An array if you have multiple recipients.
      // cc: 'second@domain.com',
      // bcc: 'secretagent@company.gov',
      subject: 'A manuscript is resubmitted',
      // replyTo: 'reply2this@company.com',
      //You can use "html:" to send HTML email content. It's magic!
      html: `
      <p style='padding: 0'>The manuscript ${manuscriptId} that was need revised told by the reviewers is resubmitted at ${dateTime}.</p>
      <p style='padding: 0'>You can check the status of the manuscripts by <a href='http://localhost:3000/manuscriptsAsCoAuthor'>clicking here</a></p>
      <p style='padding: 0'>Thank you!</p>
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

const sendEmailToReviewer = (
  selectedManuscript,
  reviewersEmail,
  forwardingDateTime
) => {
  mailTransporter.sendMail(
    {
      from: 'abdullahhosenakash@gmail.com',
      to: reviewersEmail, // An array if you have multiple recipients.
      // cc: 'second@domain.com',
      // bcc: 'secretagent@company.gov',
      subject: `A ${selectedManuscript?.revised ? '' : 'new'} manuscript ${
        selectedManuscript?.revised ? 're' : ''
      }submitted for review`,
      // replyTo: 'reply2this@company.com',
      //You can use "html:" to send HTML email content. It's magic!
      html: `
        <p style='padding: 0'>Dear sir,</p>
        <p style='padding: 0'>A ${
          selectedManuscript?.revised
            ? "manuscript that you previously reviewed and decided 'Need Revised'"
            : 'new manuscript'
        } has been ${
          selectedManuscript?.revised ? 're' : ''
        }submitted on ${forwardingDateTime} from our journal named <i><b>Journal of Science and Technology, HSTU</b></i> for your review.</p>
        <p style='padding: 0'>You can review the manuscripts from your dashboard by <a href='http://localhost:3000/manuscriptsAsReviewer'>clicking here</a></p>
        <p style='padding-top: 2px; padding-bottom: 0'>Thanking you</p>
        <p style='padding: 0'>Journal of Science and Technology,</p>
        <p style='padding: 0'>HSTU</p>
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

const sendEmailToEditorAfterReview = (selectedManuscript, editorEmail) => {
  mailTransporter.sendMail(
    {
      from: 'abdullahhosenakash@gmail.com',
      to: editorEmail, // An array if you have multiple recipients.
      // cc: 'second@domain.com',
      // bcc: 'secretagent@company.gov',
      subject: 'The manuscript has been reviewed',
      // replyTo: 'reply2this@company.com',
      //You can use "html:" to send HTML email content. It's magic!
      html: `
      <p>The manuscript that was submitted to the reviewers for review at ${selectedManuscript?.forwardingDateTime} has been reviewed successfully</p>
      <p>You can see the manuscripts status from your dashboard by <a href='http://localhost:3000/manuscriptsAsCoAuthor'>clicking here</a></p>
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

const sendEmailToAuthorAfterDecision = (selectedManuscript) => {
  const authorsEmail = [
    selectedManuscript?.authorEmail,
    selectedManuscript?.authorSequence?.map((author) => author.authorEmail)
  ];
  mailTransporter.sendMail(
    {
      from: 'abdullahhosenakash@gmail.com',
      to: authorsEmail, // An array if you have multiple recipients.
      // cc: 'second@domain.com',
      // bcc: 'secretagent@company.gov',
      subject: 'Your manuscript has been reviewed',
      // replyTo: 'reply2this@company.com',
      //You can use "html:" to send HTML email content. It's magic!
      html: `
      <p>Your manuscript that was submitted at ${selectedManuscript?.dateTime} has been reviewed successfully</p>
      <p>You can see the manuscripts status from your dashboard by <a href='http://localhost:3000/manuscriptsAsCoAuthor'>clicking here</a></p>
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

const sendEmailToEditorAfterDecision = (selectedManuscript, editorEmail) => {
  mailTransporter.sendMail(
    {
      from: 'abdullahhosenakash@gmail.com',
      to: editorEmail, // An array if you have multiple recipients.
      // cc: 'second@domain.com',
      // bcc: 'secretagent@company.gov',
      subject: 'The manuscript has been reviewed',
      // replyTo: 'reply2this@company.com',
      //You can use "html:" to send HTML email content. It's magic!
      html: `
      <p>The manuscript that was submitted at ${selectedManuscript?.dateTime} by the authors has been reviewed successfully</p>
      <p>You can see the manuscripts status from your dashboard by <a href='http://localhost:3000/manuscriptsAsCoAuthor'>clicking here</a></p>
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
// -----------------------verify email----------------------
// const DOMAIN = 'YOUR_DOMAIN_NAME';
// const formData = require('form-data');
// const Mailgun = require('mailgun.js');

// const mailgun = new Mailgun(formData);

// const mailgunClient = mailgun.client({
//   username: 'api',
//   key: process.env.SEND_MAIL_KEY || ''
// });
// const validateUser = async () => {
//   try {
//     const validationRes = await mailgunClient.validate.get(
//       'akashbatas460@gmail.com'
//     );
//     console.log('validationRes', validationRes);
//   } catch (error) {
//     console.error(error);
//   }
// };

async function run() {
  try {
    await client.connect();
    console.log('connected');
    const userCollection = client
      .db('finalProjectDatabase')
      .collection('userCollection');

    const manuscriptCollection = client
      .db('finalProjectDatabase')
      .collection('manuscriptCollection');

    const draftCollection = client
      .db('finalProjectDatabase')
      .collection('draftCollection');

    app.get('/manuscriptsAsCoAuthor', async (req, res) => {
      const result = await manuscriptCollection.find()?.toArray();
      res.send(result);
    });

    app.get('/manuscriptsAsReviewer', async (req, res) => {
      const { reviewerEmail } = req.query;
      const manuscripts = await manuscriptCollection.find()?.toArray();
      const reviewerManuscripts = manuscripts?.filter((manuscript) => {
        if (manuscript.reviewers) {
          return manuscript?.reviewers?.find(
            (reviewer) => reviewer.reviewerEmail === reviewerEmail
          );
        }
      });
      res.send(reviewerManuscripts);
    });

    app.get('/authorManuscripts', async (req, res) => {
      const { authorEmail } = req.query;
      const resultFromDirectEmailQuery = await manuscriptCollection
        .find({ authorEmail })
        ?.toArray();
      const allManuscript = await manuscriptCollection.find()?.toArray();
      const resultFromAuthorSequenceQuery = allManuscript?.filter(
        (manuscript) =>
          manuscript.authorEmail !== authorEmail &&
          manuscript.authorSequence?.find(
            (author) => author.authorEmail === authorEmail
          )
      );
      const authorManuscripts = [
        ...resultFromDirectEmailQuery,
        ...resultFromAuthorSequenceQuery
      ];
      const replicaManuscripts = [...authorManuscripts];
      const sortedAuthorManuscripts = replicaManuscripts?.sort(
        (manuscript1, manuscript2) =>
          manuscript1?.manuscriptId?.split('_')[1] >
          manuscript2?.manuscriptId?.split('_')[1]
            ? 1
            : manuscript1?.manuscriptId?.split('_')[1] <
              manuscript2?.manuscriptId?.split('_')[1]
            ? -1
            : 0
      );

      res.send(sortedAuthorManuscripts);
    });

    app.get('/authorDrafts', async (req, res) => {
      const { authorEmail } = req.query;
      const result = await draftCollection.find({ authorEmail })?.toArray();
      return res.send(result);
    });

    app.get('/userRole', async (req, res) => {
      const { userEmail } = req.query;
      const result = await userCollection.findOne({ userEmail });
      res.send({ userRole: result?.userRole });
    });

    app.get('/userInfo', async (req, res) => {
      const { userEmail } = req.query;
      const result = await userCollection.findOne({ userEmail });
      res.send(result);
    });

    app.get('/manuscriptMessages', async (req, res) => {
      const { manuscriptId, userRole } = req.query;
      if (!manuscriptId && !userRole)
        return res.send({ errorMessage: 'UnAuthorized Promise' });
      const selectedManuscript = await manuscriptCollection.findOne({
        manuscriptId
      });
      const messages = selectedManuscript.messages;
      if (userRole === 'author') {
        const editorAndAuthorMessage = messages.editorAndAuthor;
        res.send(editorAndAuthorMessage);
      } else {
        const editorAndReviewerMessages = messages.editorAndReviewer;
        res.send(editorAndReviewerMessages);
      }
    });

    // POST methods
    app.post('/addUser', async (req, res) => {
      const newUser = req.body;
      const availableUser = await userCollection.findOne({
        userEmail: newUser?.userEmail
      });
      if (availableUser) {
        res.send({ message: 'User already exists' });
      } else {
        const result = await userCollection.insertOne(newUser);
        res.send(result);
      }
    });

    app.put('/updateDraftManuscript/:id', async (req, res) => {
      const id = req.params?.id;
      const { _id, ...updatedDraftManuscript } = req.body || {};
      const filter = { _id: new ObjectId(id) };
      const options = { upsert: true };
      const updatedDoc = {
        $set: {
          ...updatedDraftManuscript
        }
      };
      const result = await draftCollection.updateOne(
        filter,
        updatedDoc,
        options
      );
      if (result) {
        const oldFilter = {
          manuscriptId: updatedDraftManuscript?.manuscriptId
        };
        const oldUpdatedDoc = {
          $set: {
            revising: true
          }
        };
        const updateOldManuscript = await manuscriptCollection.updateOne(
          oldFilter,
          oldUpdatedDoc
        );
        if (updateOldManuscript) {
          res.send(result);
        }
      }
    });

    app.put('/updateRevisedManuscript', async (req, res) => {
      const { _id, manuscriptId, ...updatedManuscript } = req.body;
      const filter = { manuscriptId };
      const updatedDoc = {
        $set: {
          ...updatedManuscript
        }
      };
      const result = await manuscriptCollection.updateOne(filter, updatedDoc);
      if (result) {
        const editor = await userCollection.findOne({ userRole: 'editor' });
        const editorEmail = editor?.userEmail;
        sendEmailToAuthorAfterRevise(updatedManuscript, manuscriptId);
        sendEmailToEditorAfterRevise(
          editorEmail,
          manuscriptId,
          updatedManuscript?.dateTime
        );
      }
      res.send(result);
    });

    app.put('/updateManuscript', async (req, res) => {
      const { objectId } = req.query;
      const { decision, editorEmail } = req.body;
      const filter = { _id: new ObjectId(objectId) };
      const updatedDoc = { $set: { decision } };
      const result = await manuscriptCollection.updateOne(filter, updatedDoc);
      if (result) {
        const selectedManuscript = await manuscriptCollection.findOne(filter);
        sendEmailToAuthorAfterDecision(selectedManuscript);
        sendEmailToEditorAfterDecision(selectedManuscript, editorEmail);
      }
      res.send(result);
    });

    app.put('/finalUpdateManuscript', async (req, res) => {
      const { objectId } = req.query;
      const { decision, editorEmail } = req.body;
      const filter = { _id: new ObjectId(objectId) };
      const updatedDoc = { $set: { decision } };
      const result = await manuscriptCollection.updateOne(filter, updatedDoc);
      if (result) {
        const selectedManuscript = await manuscriptCollection.findOne(filter);
        sendEmailToAuthorAfterDecision(selectedManuscript);
        sendEmailToEditorAfterDecision(selectedManuscript, editorEmail);
      }
      res.send(result);
    });

    app.put('/forwardManuscript', async (req, res) => {
      const { objectId } = req.query;
      if (!objectId) return;
      const { reviewers, dateTime } = req.body;
      const filter = {
        _id: new ObjectId(objectId)
      };
      const selectedManuscript = await manuscriptCollection.findOne(filter);
      const updatedManuscript = {
        $set: {
          ...selectedManuscript,
          paperStatus: 'Forwarded',
          reviewers,
          forwardingDateTime: dateTime
        }
      };
      const result = await manuscriptCollection.updateOne(
        filter,
        updatedManuscript
      );
      const editor = await userCollection.findOne({ userRole: 'editor' });
      const editorEmail = editor?.userEmail;
      const authorName =
        selectedManuscript?.authorInfo?.firstName +
        ' ' +
        selectedManuscript?.authorInfo?.lastName;
      if (result.acknowledged) {
        const reviewersInfo = (await manuscriptCollection.findOne(filter))
          ?.reviewers;
        sendEmailToAuthorAfterForward(selectedManuscript, dateTime);
        sendEmailToEditorAfterForward(
          editorEmail,
          selectedManuscript?.dateTime,
          authorName,
          selectedManuscript?.authorEmail,
          reviewersInfo,
          dateTime,
          selectedManuscript?.revised
        );
        sendEmailToReviewer(
          selectedManuscript,
          reviewersInfo?.map((reviewer) => reviewer.reviewerEmail),
          dateTime
        );
        res.send(result);
      }
    });

    app.put('/declineManuscript', async (req, res) => {
      const { objectId } = req.query;
      if (!objectId) return;
      const { declinationMessage } = req.body;
      const filter = {
        _id: new ObjectId(objectId)
      };
      const updatedManuscript = {
        $set: {
          paperStatus: 'Declined',
          declinationMessage
        }
      };
      const result = await manuscriptCollection.updateOne(
        filter,
        updatedManuscript
      );
      res.send(result);
    });

    app.put('/reviewerDecision', async (req, res) => {
      const { objectId } = req.query;
      if (!objectId) return;
      const { reviewerDecision, reviewerComment, reviewerEmail } =
        req.body || {};
      // reviewer email is still unused here
      const filter = {
        _id: new ObjectId(objectId)
      };
      const selectedManuscript = await manuscriptCollection.findOne(filter);
      const reviewerList = selectedManuscript?.reviewers;
      const selectedReviewer = reviewerList.find(
        (reviewer) => reviewer.reviewerEmail === reviewerEmail
      );
      const restReviewers = reviewerList.filter(
        (reviewer) => reviewer.reviewerEmail !== reviewerEmail
      );
      const updatedReviewer = {
        ...selectedReviewer,
        reviewerDecision,
        reviewerComment
      };
      const updatedReviewers = [...restReviewers, updatedReviewer];
      const updatedManuscript = {
        $set: {
          reviewers: updatedReviewers
        }
      };
      const result = await manuscriptCollection.updateOne(
        filter,
        updatedManuscript
      );
      if (result) {
        const updatedSelectedManuscript =
          await manuscriptCollection.findOne(filter);
        const editor = await userCollection.findOne({ userRole: 'editor' });
        const editorEmail = editor?.userEmail;
        sendEmailToEditorAfterReview(updatedSelectedManuscript, editorEmail);
        res.send(result);
      }
    });

    app.put('/updateUser', async (req, res) => {
      const { userEmail } = req.query;
      if (!userEmail) return;
      const updatedProfile = req.body;
      const filter = { userEmail };
      const updatedUserInfo = {
        $set: {
          ...updatedProfile
        }
      };
      const result = await userCollection.updateOne(filter, updatedUserInfo);
      res.send(result);
    });

    app.put('/manuscriptChatBox', async (req, res) => {
      const { manuscriptId } = req.query;
      const newMassage = req.body;
      const filter = { manuscriptId };
      let senderName;
      if (newMassage.sender === 'reviewer') {
        senderName = newMassage.senderName;
      } else if (newMassage.sender === 'editor') {
        const editor = await userCollection.findOne({ userRole: 'editor' });
        senderName = editor?.userName;
      }
      const selectedManuscript = await manuscriptCollection.findOne(filter);
      const messages = selectedManuscript?.messages?.editorAndReviewer;
      const newMassageList = {
        editorAndReviewer: [
          ...messages,
          {
            ...newMassage,
            senderName
          }
        ]
      };

      const updatedMassages = {
        $set: { messages: newMassageList }
      };
      const result = await manuscriptCollection.updateOne(
        filter,
        updatedMassages
      );
      res.send(result);
    });

    app.put('/payment', async (req, res) => {
      const { manuscriptId } = req.query;
      if (!manuscriptId) return;
      const { payableAmount, mobileNumber, dateTime } = req.body || {};
      const paidManuscripts = await manuscriptCollection
        .find({
          payment: { $exists: true }
        })
        .toArray();

      let transactionId;
      while (1) {
        transactionId = crypto.randomBytes(5).toString('hex').toUpperCase();
        if (transactionId.slice(0, 1) === '0') {
          continue;
        }
        const isHexStringAvailable = paidManuscripts?.find(
          (manuscript) => manuscript.payment?.transactionId === transactionId
        );
        if (!isHexStringAvailable) {
          break;
        }
      }
      const filter = { manuscriptId };
      const updatedManuscript = {
        $set: {
          payment: {
            paymentStatus: 'Paid',
            paidAmount: payableAmount,
            mobileNumber,
            transactionId,
            paymentTime: dateTime
          }
        }
      };
      const result = await manuscriptCollection.updateOne(
        filter,
        updatedManuscript
      );
      res.send(result);
    });

    app.post('/newDraftManuscript', async (req, res) => {
      const newDraft = req.body;
      const result = await draftCollection.insertOne(newDraft);
      res.send(result);
    });

    app.post('/newManuscript', async (req, res) => {
      // validateUser();
      const newManuscript = req.body;
      const authorName =
        newManuscript?.authorInfo?.firstName +
        ' ' +
        newManuscript?.authorInfo?.lastName;
      const lastManuscript = await manuscriptCollection
        .find()
        ?.sort({ _id: -1 })
        ?.limit(1)
        ?.toArray();
      const lastManuscriptId =
        parseInt(lastManuscript[0]?.manuscriptId?.split('_')[1]) || 1000;
      const manuscriptId = 'HSTU_' + (lastManuscriptId + 1);
      const modifiedManuscript = { ...newManuscript, manuscriptId };
      const result = await manuscriptCollection.insertOne(modifiedManuscript);
      const editor = await userCollection.findOne({ userRole: 'editor' });
      const editorEmail = editor?.userEmail;
      const newManuscriptId = result?.insertedId?.toString()?.split('"')[0];
      const authorsEmail = [
        newManuscript?.authorEmail,
        ...newManuscript?.authorSequence?.map((a) => a.authorEmail)
      ];
      sendEmailToAuthor(authorsEmail, newManuscriptId);
      sendEmailToEditor(editorEmail, authorName, authorsEmail);
      res.send(result);
    });

    // delete methods
    app.delete('/deleteDraft/:id', async (req, res) => {
      const id = req.params?.id;
      const query = { _id: new ObjectId(id) };
      const result = await draftCollection.deleteOne(query);
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

// ,
//   "engines": {
//     "node": ">=14 <15"
//   }
//
