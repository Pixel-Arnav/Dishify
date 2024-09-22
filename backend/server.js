const express = require('express');
const axios = require('axios');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

app.post('/generate-recipe', async (req, res) => {
  const { ingredients, preferences, cuisine, cookingTime, servings, difficulty } = req.body;
  const prompt = `Generate a ${difficulty} recipe with the following ingredients: ${ingredients}. Make sure it is ${preferences} and in ${cuisine} style. It should take ${cookingTime} minutes to cook and serve ${servings} people.`;

  try {
    const response = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'system', content: prompt }],
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );
    res.json({ recipe: response.data.choices[0].message.content });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to generate recipe' });
  }
});

app.post('/fetch-nutrition', async (req, res) => {
  const { ingredient } = req.body;
  try {
    const response = await axios.get(
      `https://trackapi.nutritionix.com/v2/search/instant?query=${ingredient}`,
      {
        headers: {
          'x-app-id': process.env.NUTRITIONIX_APP_ID,
          'x-app-key': process.env.NUTRITIONIX_APP_KEY,
        },
      }
    );
    res.json(response.data);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch nutrition data' });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
