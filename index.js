const express = require('express');
const bodyParser = require('body-parser');
const supabaseClient = require('@supabase/supabase-js');
const { isValidStateAbbreviation } = require('usa-state-validator');
const dotenv = require('dotenv');

const app = express();
const port = process.env.PORT || 3000;
dotenv.config();

app.use(bodyParser.json());
app.use(express.static(__dirname + '/public'));

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;
const supabase = supabaseClient.createClient(supabaseUrl, supabaseKey);

// Route to serve your HTML
app.get('/', (req, res) => {
  res.sendFile('public/index.html', { root: __dirname });
});

// GET Data from 'opportunities' table
app.get('/customers', async (req, res) => {
  const { data, error } = await supabase.from('opportunities').select();
  if (error) {
    res.status(500).json(error);
  } else {
    res.json(data);
  }
});

// POST Data to 'opportunities' table
app.post('/customer', async (req, res) => {
  const { firstName, lastName, state } = req.body;

  if (!isValidStateAbbreviation(state)) {
    return res.status(400).json({ message: "Invalid State" });
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
    res.status(500).json(error);
  } else {
    res.json(data);
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
