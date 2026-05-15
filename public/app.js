let opportunityMap;
let categoryChart;

const opportunityList = document.querySelector('#opportunityList');
const categoryFilter = document.querySelector('#categoryFilter');
const volunteerForm = document.querySelector('#volunteerForm');
const formMessage = document.querySelector('#formMessage');

function setupMap() {
  opportunityMap = L.map('map').setView([38.9897, -76.9378], 10);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap contributors',
  }).addTo(opportunityMap);
}

async function loadOpportunities() {
  const response = await fetch('/api/opportunities');

  if (!response.ok) {
    opportunityList.innerHTML = '<p>Could not load opportunities. Check your Supabase connection.</p>';
    return;
  }

  const opportunities = await response.json();
  const selectedCategory = categoryFilter.value;
  const filteredOpportunities = selectedCategory === 'all'
    ? opportunities
    : opportunities.filter((item) => item.category === selectedCategory);

  renderOpportunities(filteredOpportunities);
  renderMarkers(filteredOpportunities);
  updateCategoryChart(opportunities);
}

function renderOpportunities(opportunities) {
  opportunityList.innerHTML = '';

  if (!opportunities.length) {
    opportunityList.innerHTML = '<p>No opportunities found for this category.</p>';
    return;
  }

  opportunities.forEach((opportunity) => {
    const card = document.createElement('article');
    card.className = 'opportunity-card';
    card.innerHTML = `
      <h3>${opportunity.title}</h3>
      <p class="meta">${opportunity.organization} | ${opportunity.category}</p>
      <button class="button weather-button" data-latitude="${opportunity.latitude}" data-longitude="${opportunity.longitude}">Check Weather</button>
      <div class="weather" hidden></div>
    `;

    opportunityList.appendChild(card);
  });

  document.querySelectorAll('.weather-button').forEach((button) => {
    button.addEventListener('click', loadWeather);
  });
}

function renderMarkers(opportunities) {
  opportunityMap.eachLayer((layer) => {
    if (layer instanceof L.Marker) {
      opportunityMap.removeLayer(layer);
    }
  });

  opportunities.forEach((item) => {
    const latitude = Number(item.latitude);
    const longitude = Number(item.longitude);

    if (!Number.isNaN(latitude) && !Number.isNaN(longitude)) {
      L.marker([latitude, longitude])
        .addTo(opportunityMap)
        .bindPopup(`<strong>${item.title}</strong><br>${item.organization}`);
    }
  });
}

function updateCategoryChart(opportunities) {
  const chartCanvas = document.querySelector('#categoryChart');

  if (!chartCanvas || typeof Chart === 'undefined') {
    return;
  }

  const counts = opportunities.reduce((totals, item) => {
    const category = item.category || 'Other';
    totals[category] = (totals[category] || 0) + 1;
    return totals;
  }, {});

  if (categoryChart) {
    categoryChart.destroy();
  }

  categoryChart = new Chart(chartCanvas, {
    type: 'bar',
    data: {
      labels: Object.keys(counts),
      datasets: [
        {
          label: 'Opportunities by Category',
          data: Object.values(counts),
          backgroundColor: ['#2f7d59', '#4f7cac', '#f3c969', '#c75d4d', '#7a5c99'],
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false,
        },
      },
    },
  });
}

async function loadWeather(event) {
  const button = event.target;
  const latitude = button.dataset.latitude;
  const longitude = button.dataset.longitude;
  const weatherBox = button.nextElementSibling;

  if (!latitude || !longitude || latitude === 'null' || longitude === 'null') {
    weatherBox.hidden = false;
    weatherBox.textContent = 'Weather is unavailable because this opportunity does not have coordinates.';
    return;
  }

  const response = await fetch(`/api/weather?latitude=${latitude}&longitude=${longitude}`);

  if (!response.ok) {
    weatherBox.hidden = false;
    weatherBox.textContent = 'Weather could not be loaded.';
    return;
  }

  const weather = await response.json();
  const current = weather.current;

  weatherBox.hidden = false;
  weatherBox.textContent = `Current weather: ${current.temperature_2m} F, wind ${current.wind_speed_10m} mph, precipitation ${current.precipitation} in.`;
}

async function submitVolunteer(event) {
  event.preventDefault();

  const formData = new FormData(volunteerForm);
  const volunteer = Object.fromEntries(formData.entries());

  const response = await fetch('/api/volunteer', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(volunteer),
  });

  if (response.ok) {
    volunteerForm.reset();
    formMessage.textContent = 'Your volunteer profile was submitted successfully.';
  } else {
    const error = await response.json();
    formMessage.textContent = error.message || 'Something went wrong. Please try again.';
  }
}

categoryFilter.addEventListener('change', loadOpportunities);
volunteerForm.addEventListener('submit', submitVolunteer);

setupMap();
loadOpportunities();
