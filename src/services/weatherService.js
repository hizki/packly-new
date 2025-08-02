/**
 * Weather Service Module
 * Handles weather forecasting using different APIs based on forecast timeframe:
 * - 0-5 days: OpenWeatherMap
 * - 5-14 days: WeatherAPI.com  
 * - 14+ days: Meteostat Climate Averages
 */

const WEATHER_API_KEYS = {
  openWeather: import.meta.env.VITE_WEATHER_API_KEY,
  weatherApi: '967cbeaa76734b2da40204707250208',
  rapidApi: '0ecd13731cmsh386cfad3c652cf9p15786fjsnbbf6cccb4ba9',
};

/**
 * Calculate days between two dates
 */
const getDaysUntilDate = (targetDate) => {
  const now = new Date();
  const target = new Date(targetDate);
  return Math.ceil((target.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
};

/**
 * Fetch weather from OpenWeatherMap (0-5 days)
 */
const fetchOpenWeatherData = async (lat, lng, daysUntil) => {
  const [currentResponse, forecastResponse] = await Promise.all([
    fetch(
      `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lng}&units=metric&appid=${WEATHER_API_KEYS.openWeather}`,
    ),
    fetch(
      `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lng}&units=metric&appid=${WEATHER_API_KEYS.openWeather}`,
    ),
  ]);

  const currentData = await currentResponse.json();
  const forecastData = await forecastResponse.json();

  if (!currentData || !forecastData?.list?.length) {
    throw new Error('Invalid OpenWeatherMap response');
  }

  // Find relevant forecast based on days until trip
  let relevantForecast = forecastData.list[0];
  if (daysUntil >= 0 && daysUntil < 5) {
    const forecastsPerDay = 8; // 8 forecasts per day (3-hour intervals)
    const targetIndex = Math.min(
      Math.floor(daysUntil * forecastsPerDay),
      forecastData.list.length - 1,
    );
    relevantForecast = forecastData.list[targetIndex] || forecastData.list[0];
  }

  return {
    min_temp: Math.round(relevantForecast.main.temp_min || currentData.main.temp_min),
    max_temp: Math.round(relevantForecast.main.temp_max || currentData.main.temp_max),
    conditions: relevantForecast.weather[0]?.main || currentData.weather[0]?.main || 'Unknown',
    description: relevantForecast.weather[0]?.description || currentData.weather[0]?.description,
    precipitation_probability: Math.round((relevantForecast.pop || 0) * 100),
    rain_chance: getRainChanceCategory(relevantForecast.pop || 0),
    isApproximate: false,
    source: 'OpenWeatherMap',
    poweredBy: 'Powered by OpenWeatherMap',
  };
};

/**
 * Fetch weather from WeatherAPI.com (5-14 days)
 */
const fetchWeatherApiData = async (lat, lng, targetDate) => {
  const dateStr = new Date(targetDate).toISOString().split('T')[0];
  
  const response = await fetch(
    `https://api.weatherapi.com/v1/forecast.json?key=${WEATHER_API_KEYS.weatherApi}&q=${lat},${lng}&days=14&date=${dateStr}`,
  );

  const data = await response.json();

  if (!data?.forecast?.forecastday?.length) {
    throw new Error('Invalid WeatherAPI response');
  }

  // Find the forecast for the target date
  const targetForecast = data.forecast.forecastday.find(
    day => day.date === dateStr,
  ) || data.forecast.forecastday[0];

  const dayData = targetForecast.day;

  return {
    min_temp: Math.round(dayData.mintemp_c),
    max_temp: Math.round(dayData.maxtemp_c),
    conditions: dayData.condition.text,
    description: dayData.condition.text,
    precipitation_probability: Math.round(dayData.daily_chance_of_rain || 0),
    rain_chance: getRainChanceCategory((dayData.daily_chance_of_rain || 0) / 100),
    isApproximate: false,
    source: 'WeatherAPI',
    poweredBy: 'Powered by WeatherAPI.com',
  };
};

/**
 * Fetch climate averages from Meteostat (14+ days)
 */
const fetchClimateAverages = async (lat, lng, targetDate) => {
  const target = new Date(targetDate);
  const currentYear = new Date().getFullYear();
  const targetMonth = target.getMonth() + 1; // getMonth() returns 0-11
  
  // Get historical data for the same month from previous years
  const startDate = `${currentYear - 5}-${targetMonth.toString().padStart(2, '0')}-01`;
  const endDate = `${currentYear - 1}-${targetMonth.toString().padStart(2, '0')}-28`;

  const response = await fetch(
    `https://meteostat.p.rapidapi.com/point/monthly?lat=${lat}&lon=${lng}&start=${startDate}&end=${endDate}`,
    {
      headers: {
        'x-rapidapi-host': 'meteostat.p.rapidapi.com',
        'x-rapidapi-key': WEATHER_API_KEYS.rapidApi,
      },
    },
  );

  const data = await response.json();

  if (!data?.data?.length) {
    throw new Error('Invalid Meteostat response');
  }

  // Calculate averages from available data
  const monthlyData = data.data.filter(item => item.tavg !== null);
  
  if (!monthlyData.length) {
    throw new Error('No climate data available');
  }

  const avgTemp = monthlyData.reduce((sum, item) => sum + item.tavg, 0) / monthlyData.length;
  const avgMinTemp = monthlyData.reduce(
    (sum, item) => sum + (item.tmin || avgTemp - 5), 0,
  ) / monthlyData.length;
  const avgMaxTemp = monthlyData.reduce(
    (sum, item) => sum + (item.tmax || avgTemp + 5), 0,
  ) / monthlyData.length;
  const avgPrecip = monthlyData.reduce(
    (sum, item) => sum + (item.prcp || 0), 0,
  ) / monthlyData.length;

  // Estimate precipitation probability based on historical precipitation
  const precipProbability = Math.min(Math.round(avgPrecip * 2), 80); // Rough estimation

  return {
    min_temp: Math.round(avgMinTemp),
    max_temp: Math.round(avgMaxTemp),
    conditions: getConditionsFromPrecip(precipProbability),
    description: `Historical average for ${target.toLocaleDateString('en-US', { month: 'long' })}`,
    precipitation_probability: precipProbability,
    rain_chance: getRainChanceCategory(precipProbability / 100),
    isApproximate: true,
    source: 'Climate Averages',
    poweredBy: 'Powered by Meteostat via RapidAPI',
    warning: 'These are approximations based on historical climate data and may not reflect actual conditions.',
  };
};

/**
 * Get weather conditions based on precipitation probability
 */
const getConditionsFromPrecip = (precipProb) => {
  if (precipProb > 60) return 'Rain';
  if (precipProb > 30) return 'Clouds';
  return 'Clear';
};

/**
 * Calculate rain chance category based on precipitation probability
 */
const getRainChanceCategory = (pop) => {
  if (pop === 0) return 'none';
  if (pop <= 0.3) return 'slight';
  if (pop <= 0.7) return 'chance';
  return 'certain';
};

/**
 * Main weather fetching function
 * Automatically selects the appropriate API based on forecast timeframe
 */
export const fetchWeatherForDate = async (lat, lng, targetDate) => {
  try {
    const daysUntil = getDaysUntilDate(targetDate);

    if (daysUntil < 0) {
      // Past date - return null or handle as needed
      return null;
    }

    if (daysUntil <= 5) {
      // Use OpenWeatherMap for near-term forecasts
      return await fetchOpenWeatherData(lat, lng, daysUntil);
    } else if (daysUntil <= 14) {
      // Use WeatherAPI for medium-term forecasts
      return await fetchWeatherApiData(lat, lng, targetDate);
    } else {
      // Use climate averages for long-term approximations
      return await fetchClimateAverages(lat, lng, targetDate);
    }
  } catch (error) {
    console.error('Error fetching weather data:', error);
    
    // Fallback to basic weather data
    return {
      min_temp: 15,
      max_temp: 25,
      conditions: 'Unknown',
      description: 'Weather data unavailable',
      precipitation_probability: 30,
      rain_chance: 'slight',
      isApproximate: true,
      source: 'Fallback',
      poweredBy: 'Weather service unavailable',
      error: 'Weather service unavailable',
    };
  }
};

/**
 * Batch fetch weather for multiple destinations
 */
export const fetchWeatherForDestinations = async (destinations) => {
  const weatherPromises = destinations.map(async (destination, index) => {
    if (!destination.coordinates || !destination.start_date) {
      return { index, weather: null };
    }

    const weather = await fetchWeatherForDate(
      destination.coordinates.lat,
      destination.coordinates.lng,
      destination.start_date,
    );

    return { index, weather };
  });

  const results = await Promise.allSettled(weatherPromises);
  
  return results.map((result, index) => {
    if (result.status === 'fulfilled') {
      return result.value;
    } else {
      console.error(`Weather fetch failed for destination ${index}:`, result.reason);
      return { index, weather: null };
    }
  });
}; 