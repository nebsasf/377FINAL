const express = require('express');
const bodyParser = require('body-parser');
const supabaseClient = require('@supabase/supabase-js');
const { isValidStateAbbreviation } = require('usa-state-validator');
const dotenv = require('dotenv');

const app = express();
const port = process.env.PORT || 3000;
dotenv.config();

// Serves all files (CSS/JS) from your 'public' folder
app.use(bodyParser.json());
app.use(express.static(__dirname + '/public'));

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;
const supabase = supabaseClient.createClient(supabaseUrl, supabaseKey);

// 1. Home route - serves your index.html
app.get('/', (req, res) => {
  res.sendFile('public/index.html', { root: __dirname });
});

// 2. API route to GET data from your 'opportunities' table
app.get('/customers', async (req, res) => {
  console.log('Fetching opportunities from Supabase...');

  const { data, error } = await supabase
    .from('opportunities')
    .select();

  if (error) {
    console.log(`Error: ${error.message}`);
    res.status(500).send(error);
  } else {
    console.log('Success! Data retrieved:', data.length);
    res.json(data);
  }
});

// 3. API route to WRITE data to your 'opportunities' table
app.post('/customer', async (req, res) => {
  const { firstName, lastName, state } = req.body;

  // Validation check using the library
  if (!isValidStateAbbreviation(state)) {
    res.status(400).json({
      message: `${state} is not a valid 2 Letter Abbreviation for State`,
    });
    return;
  }

  const { data, error } = await supabase
    .from('opportunities')
    .insert({
      customer_first_name: firstName,
      customer_last_name: lastName,
      customer_state: state,
    })
    .select();

  if (error) {
    console.log(`Insert Error: ${error.message}`);
    res.status(500).send(error);
  } else {
    res.json(data);
  }
});

app.listen(port, () => {
  console.log(`App is running on port: ${port}`);
});
