const express = require('express');
const axios = require('axios'); // Use axios for HTTP requests

const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(express.json());

// Webhook for Dialogflow
app.post('/webhook', async (req, res) => {
  const intentName = req.body.queryResult.intent.displayName;

  switch (intentName) {
    case 'Register Intent':
      const registerParams = req.body.queryResult.parameters;
      const { username, email, phoneNumber, password, address, pincode } = registerParams;

      try {
        // Call the backend register API
        const response = await axios.post('https://chatbot-for-food-delivery-system.onrender.com/users', {
          username,
          email,
          phoneNumber,
          password, // Send plain password (ensure backend handles hashing)
          address,
          pincode,
        });

        if (response.status === 201) { // Assuming a 201 status indicates successful registration
          res.json({
            fulfillmentText: `Registration successful! Welcome, ${username}.`,
          });
        }
      } catch (err) {
        console.error(err);
        res.json({
          fulfillmentText: `Registration failed. ${err.response?.data?.message || 'Please try again later.'}`,
        });
      }
      break;

    case 'Login Intent':
      const loginParams = req.body.queryResult.parameters;
      const { loginEmail, loginPassword } = loginParams;

      try {
        // Call the backend login API (assuming it's a GET or POST request)
        const response = await axios.post('https://chatbot-for-food-delivery-system.onrender.com/users/login', {
          email: loginEmail,
          password: loginPassword,
        });

        if (response.status === 200) { // Assuming 200 status indicates successful login
          const user = response.data; // Backend should return user details
          res.json({
            fulfillmentText: `Welcome back, ${user.username}! You have successfully logged in.`,
          });
        }
      } catch (err) {
        console.error(err);
        res.json({
          fulfillmentText: `Login failed. ${err.response?.data?.message || 'Please try again later.'}`,
        });
      }
      break;

    default:
      res.json({
        fulfillmentText: 'Sorry, I did not understand that. Can you try again?',
      });
      break;
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Dialogflow webhook server running at http://localhost:${port}`);
});
