// backend/server.js
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
require('dotenv').config();
const twilio = require('twilio');

const app = express();
app.use(cors());
app.use(bodyParser.json());

const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

// Step 1: Initiate call to agent
app.post('/make-call', async (req, res) => {
  const { agentNumber, customerNumber } = req.body;

  try {
    const call = await client.calls.create({
      to: agentNumber,
      from: process.env.TWILIO_CALLER_ID,
      url: `${process.env.SERVER_URL}/voice?customerNumber=${encodeURIComponent(customerNumber)}`
    });

    res.status(200).json({ sid: call.sid });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Step 2: When agent answers, Twilio requests this
app.post('/voice', (req, res) => {
  const VoiceResponse = twilio.twiml.VoiceResponse;
  const twiml = new VoiceResponse();

  const customerNumber = req.query.customerNumber;

  const dial = twiml.dial();
  dial.number(customerNumber);

  res.type('text/xml');
  res.send(twiml.toString());
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ Voice server running at http://localhost:${PORT}`);
});
