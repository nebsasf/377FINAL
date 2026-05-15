const express = require('express');
const bodyParser = require('body-parser');
const dotenv = require('dotenv');
const supabaseClient = require('@supabase/supabase-js');

dotenv.config();
console.log('Connecting to Supabase at:', process.env.SUPABASE_URL);

const app = express();
const port = process.env.PORT || 3000;

app.use(bodyParser.json());
app.use(express.static(__dirname + '/public'));

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;
const supabase = supabaseClient.createClient(supabaseUrl, supabaseKey);

app.get('/', (req, res) => {
  res.sendFile('public/index.html', { root: __dirname });
});

app.get('/api/opportunities', async (req, res) => {
  const { data, error } = await supabase.from('opportunities').select('*');
  if (error) {
    res.status(500).json({ message: 'Could not load opportunities', error });
  } else {
    res.json(data);
  }
});

app.post('/api/volunteer', async (req, res) => {
  const { firstName, lastName, email, city, state, skills } = req.body;
  if (!firstName || !lastName || !email || !skills) {
    res.status(400).json({ message: 'First name, last name, email, and skills are required.' });
    return;
  }
  const { data, error } = await supabase
    .from('volunteers')
    .insert({
      first_name: firstName,
      last_name: lastName,
      email,
      skills,
    })
    .select();
  if (error) {
    res.status(500).json({ message: 'Could not save volunteer profile.', error });
  } else {
    res.json(data);
  }
});

app.get('/api/weather', async (req, res) => {
  const { latitude, longitude } = req.query;
  if (!latitude || !longitude) {
    res.status(400).json({ message: 'Latitude and longitude are required.' });
    return;
  }
  try {
    const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,precipitation,wind_speed_10m&temperature_unit=fahrenheit&wind_speed_unit=mph`;
    const response = await fetch(weatherUrl);
    const data = await response.json();
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: 'Could not load weather data', error: String(error) });
  }
});

app.listen(port, () => {
  console.log(`SkillServe is available on port: ${port}`);
});
