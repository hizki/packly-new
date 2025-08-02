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
 * Handles date ranges for multi-day trips
 */
const fetchOpenWeatherData = async (lat, lng, daysUntil, startDate, endDate, tripDuration) => {
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

  // Find relevant forecast for the trip period
  let relevantForecast = forecastData.list[0];
  let minTemp = forecastData.list[0].main.temp_min;
  let maxTemp = forecastData.list[0].main.temp_max;
  let totalPrecipProb = 0;
  let precipCount = 0;
  let primaryCondition = forecastData.list[0].weather[0];
  
  if (daysUntil >= 0 && daysUntil < 5) {
    const startTime = new Date(startDate).getTime();
    const endTime = new Date(endDate).getTime();
    
    // Collect all forecasts within the trip period
    const tripForecasts = forecastData.list.filter(forecast => {
      const forecastTime = forecast.dt * 1000;
      return forecastTime >= startTime && forecastTime <= endTime + (24 * 60 * 60 * 1000);
    });
    
    if (tripForecasts.length > 0) {
      // Calculate min/max temps across the trip period
      minTemp = Math.min(...tripForecasts.map(f => f.main.temp_min));
      maxTemp = Math.max(...tripForecasts.map(f => f.main.temp_max));
      
      // Calculate average precipitation probability
      totalPrecipProb = tripForecasts.reduce((sum, f) => sum + (f.pop || 0), 0);
      precipCount = tripForecasts.length;
      
      // Use the first forecast for primary conditions, or find most common condition
      relevantForecast = tripForecasts[0];
      primaryCondition = tripForecasts[0].weather[0];
    } else {
      // Fallback to closest forecast if no exact matches
      const targetTime = new Date(startDate).getTime();
      let closestIndex = 0;
      let smallestDiff = Math.abs(forecastData.list[0].dt * 1000 - targetTime);
      
      for (let i = 1; i < forecastData.list.length; i++) {
        const forecastTime = forecastData.list[i].dt * 1000;
        const timeDiff = Math.abs(forecastTime - targetTime);
        
        if (timeDiff < smallestDiff) {
          smallestDiff = timeDiff;
          closestIndex = i;
        }
      }
      
      relevantForecast = forecastData.list[closestIndex];
      minTemp = relevantForecast.main.temp_min;
      maxTemp = relevantForecast.main.temp_max;
      totalPrecipProb = relevantForecast.pop || 0;
      precipCount = 1;
    }
  }
  
  // Calculate final precipitation probability
  const avgPrecipProb = precipCount > 0 ? totalPrecipProb / precipCount : 0;

  // Create description based on trip duration
  let description = primaryCondition?.description || currentData.weather[0]?.description;
  if (tripDuration > 1) {
    description = `${description} (${tripDuration}-day range)`;
  }

  return {
    min_temp: Math.round(minTemp || currentData.main.temp_min),
    max_temp: Math.round(maxTemp || currentData.main.temp_max),
    conditions: primaryCondition?.main || currentData.weather[0]?.main || 'Unknown',
    description,
    precipitation_probability: Math.round(avgPrecipProb * 100),
    rain_chance: getRainChanceCategory(avgPrecipProb),
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
  return 'strong';
};

/**
 * Main weather fetching function
 * Automatically selects the appropriate API based on forecast timeframe
 * Handles date ranges for trip planning
 */
export const fetchWeatherForDate = async (lat, lng, startDate, endDate = null) => {
  try {
    const tripEndDate = endDate || startDate;
    
    const daysUntilStart = getDaysUntilDate(startDate);
    const daysUntilEnd = getDaysUntilDate(tripEndDate);
    
    if (daysUntilStart < 0) {
      // Past date - return null or handle as needed
      return null;
    }

    // Calculate trip duration in days
    const tripDuration = Math.ceil(
      (new Date(tripEndDate) - new Date(startDate)) / (1000 * 60 * 60 * 24),
    ) + 1;
    
    if (daysUntilEnd <= 5) {
      // Use OpenWeatherMap for near-term forecasts
      return await fetchOpenWeatherData(
        lat, lng, daysUntilStart, startDate, tripEndDate, tripDuration,
      );
    } else if (daysUntilEnd <= 14) {
      // Use WeatherAPI for medium-term forecasts - use middle of trip for single forecast
      const middleDate = new Date(
        startDate.getTime() + (tripEndDate.getTime() - startDate.getTime()) / 2,
      );
      const result = await fetchWeatherApiData(lat, lng, middleDate);
      if (result && tripDuration > 1) {
        result.description = `${result.description} (${tripDuration}-day average)`;
      }
      return result;
    } else {
      // Use climate averages for long-term approximations - use middle of trip
      const middleDate = new Date(
        startDate.getTime() + (tripEndDate.getTime() - startDate.getTime()) / 2,
      );
      const result = await fetchClimateAverages(lat, lng, middleDate);
      if (result && tripDuration > 1) {
        result.description = `${result.description} (${tripDuration}-day estimate)`;
      }
      return result;
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