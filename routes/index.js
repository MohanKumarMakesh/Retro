var express = require('express');
var router = express.Router();
var axios = require('axios');

const transactions = []; // Store the last 10 transactions in memory

router.get('/', function (req, res, next) {
  res.render('index', { title: 'Web3 App' });
});

router.post('/send-transaction', async function (req, res) {
  const { platform, sender, address, amount, message, keyword } = req.body;

  try {
    // Simulate sending a transaction (replace with actual Web3 logic)
    console.log(`Sending ${amount} ${platform} from ${sender} to ${address} with message: ${message}`);

    // Generate an AI image using OpenAI's DALL·E API
    const openAiResponse = await axios.post(
      'https://api.openai.com/v1/images/generations',
      {
        prompt: keyword,
        n: 1,
        size: '256x256',
      },
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer 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`, // Replace with your OpenAI API key
        },
      }
    );

    const imageUrl = openAiResponse.data.data[0].url;

    // Store the transaction
    transactions.unshift({ platform, sender, amount, message, image: imageUrl });
    if (transactions.length > 10) transactions.pop(); // Keep only the last 10 transactions

    res.json({ success: true, image: imageUrl });
  } catch (error) {
    console.error(error);
    res.json({ success: false, error: 'Failed to process the transaction.' });
  }
});
router.post('/generate-image', async function (req, res) {
  const { keyword } = req.body;

  try {
    // Generate an AI image using OpenAI's DALL·E API
    const openAiResponse = await axios.post(
      'https://api.openai.com/v1/images/generations',
      {
        prompt: keyword,
        n: 1,
        size: '256x256',
      },
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer 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`, // Replace with your OpenAI API key
        },
      }
    );

    const imageUrl = openAiResponse.data.data[0].url;
    res.json({ success: true, image: imageUrl });
  } catch (error) {
    console.error(error);
    res.json({ success: false, error: 'Failed to generate image.' });
  }
});

module.exports = router;