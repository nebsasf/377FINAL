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

const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = supabaseClient.createClient(supabaseUrl, supabaseKey);

app.get('/', (req, res) => {
  res.sendFile('public/match.html', { root: __dirname });
});

app.get('/api/opportunities', async (req, res) => {
  console.log('Getting all volunteer opportunities');

  const { data, error } = await supabase.from('opportunities').select('*');

  if (error) {
    console.error('Full Supabase opportunities error:', error);
    res.status(500).json({ message: 'Could not load opportunities', error });
    return;
  }

  console.log('Received opportunities:', data.length);
  res.json(data);
});

app.post('/api/volunteer', async (req, res) => {
  console.log('Adding volunteer profile');
  console.log(`Request: ${JSON.stringify(req.body)}`);

  const { firstName, lastName, email, city, state, skills } = req.body;

  if (!firstName || !lastName || !email || !skills) {
    res.status(400).json({ message: 'First name, last name, email, and skills are required.' });
    return;
  }

  const { data, error } = await supabase
    .from('volunteer')
    .insert({
      first_name: firstName,
      last_name: lastName,
      email,
      city,
      state,
      skills,
    })
    .select();

  if (error) {
    console.error('Full Supabase volunteer insert error:', error);
    res.status(500).json({
      message: 'Could not save volunteer profile. Check that your Supabase table is named volunteer and that its column names match first_name, last_name, email, city, state, and skills.',
      error,
    });
    return;
  }

  res.json(data);
});

app.get('/api/weather', async (req, res) => {
  console.log('Getting weather from Open-Meteo');

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
    console.log(`Error: ${error}`);
    res.status(500).json({ message: 'Could not load weather data', error: String(error) });
  }
});

app.listen(port, () => {
  console.log(`SkillServe is available on port: ${port}`);
});
