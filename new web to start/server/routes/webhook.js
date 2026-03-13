import express from 'express';

const router = express.Router();

router.get('/webhook', (req, res) => {
  const VERIFY_TOKEN = "chamunda123";

  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];

  if (mode === "subscribe" && token === VERIFY_TOKEN) {
    res.status(200).send(challenge);
  } else {
    res.sendStatus(403);
  }
});

router.post('/webhook', (req, res) => {
  const body = req.body;

  console.log("Incoming WhatsApp webhook:", body);

  res.sendStatus(200);
});

export default router;
