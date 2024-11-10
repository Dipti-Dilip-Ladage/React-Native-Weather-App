import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ActivityIndicator,
  Image,
  ImageBackground,
  FlatList,
  Dimensions,
  ScrollView,
} from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import TableRowItem from '../components/TableRowItem';

interface PollutionData {
  main: {aqi: number};
  components: {
    co: number;
    no: number;
    no2: number;
    o3: number;
    so2: number;
    pm2_5: number;
    pm10: number;
    nh3: number;
  };
}

interface WeatherData {
  main: {
    temp: number;
    humidity: number;
    pressure: number;
  };
  wind: {
    speed: number;
  };
  weather: [
    {
      description: string;
      icon: string;
    },
  ];
  coord: {
    lon: number;
    lat: number;
  };
}

interface ForecastData {
  dt: number;
  main: {temp: number};
  weather: [{description: string; icon: string}];
}

interface HourlyData {
  dt: number;
  temp: number;
  weather: [{description: string; icon: string}];
}
const Weather = () => {
  const [city, setCity] = useState('');
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(false);
  const [debouncedCity, setDebouncedCity] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [forecastData, setForecastData] = useState<ForecastData[]>([]);
  const [pollutionData, setPollutionData] = useState<PollutionData | null>(
    null,
  );
  const API_KEY = '28e4cbcead0927451934e752d46ea677';
  useEffect(() => {
    getData();
  }, []);

  // Update debouncedCity after 500ms when city changes
  useEffect(() => {
    const timerId = setTimeout(() => {
      setDebouncedCity(city);
      storeData(city);
    }, 500);

    return () => clearTimeout(timerId);
  }, [city]);

  // Fetch weather data when debouncedCity changes
  useEffect(() => {
    if (debouncedCity) {
      fetchWeather(debouncedCity);
    }
  }, [debouncedCity]);

  const fetchAirPollution = async (responseLocal: any) => {
    setLoading(true);
    setError(null);
    try {
      const latitude = responseLocal?.coord?.lat; // Example latitude for New York
      const longitude = responseLocal?.coord?.lon; //-74.006; // Example longitude for New York
      const response = await axios.get(
        `https://api.openweathermap.org/data/2.5/air_pollution?lat=${latitude}&lon=${longitude}&appid=${API_KEY}`,
      );
      setPollutionData(response.data.list[0]);
    } catch (error) {
      setError('Failed to fetch air pollution data. Please try again later.');
      console.error(error);
    }
    setLoading(false);
  };

  const getAQIDescription = (aqi: number) => {
    switch (aqi) {
      case 1:
        return 'Good';
      case 2:
        return 'Fair';
      case 3:
        return 'Moderate';
      case 4:
        return 'Poor';
      case 5:
        return 'Very Poor';
      default:
        return 'Unknown';
    }
  };

  const getData = async () => {
    try {
      const value = await AsyncStorage.getItem('city');
      if (value !== null) {
        // value previously stored
        setDebouncedCity(value);
        storeData(value);
        setCity(value);
        console.log('value', value);
      }
    } catch (e) {
      // error reading value
    }
  };

  const storeData = async (value: string) => {
    try {
      await AsyncStorage.setItem('city', value);
    } catch (e) {
      // saving error
    }
  };

  const fetch3HourForecast = async (responseLocal: any) => {
    setLoading(true);
    setError(null);
    console.log('responseLocal', responseLocal);

    try {
      const latitude: any = responseLocal?.coord?.lat; //40.7128; // Example latitude for New York
      const longitude: any = responseLocal?.coord?.lon; //-74.006; // Example longitude for New York
      const response = await axios.get(
        `https://api.openweathermap.org/data/2.5/forecast?lat=${latitude}&lon=${longitude}&units=metric&appid=${API_KEY}`,
      );
      // Fetch the first 8 intervals for the next 24 hours (3-hour forecast intervals)
      setForecastData(response.data.list.slice(0, 8));
    } catch (error) {
      setError(
        'Failed to fetch 3-hour weather forecast data. Please try again later.',
      );
      console.error(error);
    }
    setLoading(false);
  };

  const fetchWeather = async (cityName: string) => {
    setLoading(true);
    setError(null); // Reset error before fetching new data
    try {
      const response = await axios.get(
        `https://api.openweathermap.org/data/2.5/weather?q=${cityName}&units=metric&appid=${API_KEY}`,
      );
      await setWeather(response.data);
      await fetch3HourForecast(response.data);
      await fetchAirPollution(response.data);
    } catch (error) {
      console.error('Error fetching the weather data:', error);
      console.error('Error fetching the weather data:', error);
      if (axios.isAxiosError(error)) {
        // Handle known axios errors
        setError(
          error.response?.data?.message ||
            'Error fetching weather data. Please try again.',
        );
      } else {
        // Handle unexpected errors
        setError('An unexpected error occurred. Please try again.');
      }
    }
    setLoading(false);
  };

  const renderItem = ({item}: {item: ForecastData}) => {
    const date = new Date(item.dt * 1000);
    const hours = date.getHours();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const formattedHours = hours % 12 || 12;

    return (
      <View style={styles.forecastItem}>
        <Text style={styles.hourText}>
          {formattedHours} {ampm}
        </Text>
        <Image
          style={styles.icon}
          source={{
            uri: `https://openweathermap.org/img/wn/${item.weather[0].icon}@2x.png`,
          }}
        />
        <Text style={styles.tempText}>{item.main.temp.toFixed(1)}°C</Text>
        <Text style={styles.descText}>{item.weather[0].description}</Text>
      </View>
    );
  };

  return (
    <ImageBackground
      source={require('../images/img_bg_cloud.png')}
      style={styles.container}>
      <ScrollView
        style={styles.scrollViewContainer}
        contentContainerStyle={styles.paddingBottomStyle}>
        <Text style={styles.titleStyle}>Weather App</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter city name"
          value={city}
          onChangeText={setCity}
        />
        {loading && <ActivityIndicator size="large" color="#48484A" />}
        {error && <Text style={styles.errorText}>{error}</Text>}
        {weather && !error && (
          <View style={styles.table}>
            {/* Display Weather Icon */}
            <Text style={styles.titleStyle}>Now</Text>
            <View style={styles.iconContainer}>
              <View style={styles.flexView}>
                <Text style={styles.title}>{weather.main.temp} °C</Text>
              </View>
              <View style={styles.flexView}>
                <Image
                  style={styles.weatherIcon}
                  source={{
                    uri: `https://openweathermap.org/img/wn/${weather.weather[0].icon}@2x.png`,
                  }}
                />
              </View>
              <View style={styles.flexView}>
                <Text
                  style={[
                    styles.title,
                    {textTransform: 'capitalize', textAlign: 'center'},
                  ]}>
                  {weather.weather[0].description}
                </Text>
              </View>
            </View>

            <TableRowItem
              title={'Humidity'}
              value={weather.main.humidity + ' %'}
            />

            <TableRowItem
              title={'Pressure'}
              value={weather.main.pressure + ' hPa'}
            />

            <TableRowItem
              title={'Wind Speed'}
              value={weather.wind.speed + ' m/s'}
            />
          </View>
        )}
        <View style={styles.viewHeight} />
        <Text style={styles.titleStyle}>Air Pollution Data</Text>
        {loading ? (
          <ActivityIndicator size="large" color="#48484A" />
        ) : error ? (
          <Text style={styles.errorText}>{error}</Text>
        ) : pollutionData ? (
          <View style={styles.pollutionData}>
            <Text style={styles.aqiText}>
              AQI: {pollutionData.main.aqi} (
              {getAQIDescription(pollutionData.main.aqi)})
            </Text>

            <TableRowItem
              title={'CO'}
              value={pollutionData.components.co + ' μg/m³'}
            />
            <TableRowItem
              title={'O₃'}
              value={pollutionData.components.o3 + ' μg/m³'}
            />
          </View>
        ) : (
          <Text style={styles.errorText}>No data available</Text>
        )}
        <Text style={styles.titleStyle}>3-Hour Forecast (Next 24 Hours)</Text>
        {loading ? (
          <ActivityIndicator size="large" color="#48484A" />
        ) : error ? (
          <Text style={styles.errorText}>{error}</Text>
        ) : (
          <View>
            <FlatList
              data={forecastData}
              keyExtractor={item => item.dt.toString()}
              renderItem={renderItem}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.listContainer}
            />
          </View>
        )}
      </ScrollView>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
    color: '#000',
  },
  input: {
    height: 40,
    borderColor: '#000',
    borderBottomWidth: 0.5,
    marginBottom: 10,
    paddingHorizontal: 10,
    color: '#000',
    marginHorizontal: 20,
  },
  table: {
    marginTop: 20,
    borderRadius: 5,
    overflow: 'hidden',
  },
  iconContainer: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    flex: 1,
    margin: 10,
  },
  weatherIcon: {
    width: 80,
    height: 80,
    alignSelf: 'center',
  },
  errorText: {
    color: '#000',
    textAlign: 'center',
    marginTop: 50,
    textTransform: 'capitalize',
    fontWeight: 'bold',
  },
  hourText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
  },
  icon: {
    width: 80,
    height: 80,
    marginVertical: 5,
  },
  tempText: {
    fontSize: 18,
    color: '#000',
  },
  descText: {
    fontSize: 14,
    color: '#000',
    textAlign: 'center',
  },
  listContainer: {
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  forecastItem: {
    alignItems: 'center',
    padding: 10,
    backgroundColor: '#c5c8cd',
    borderRadius: 10,
    marginHorizontal: 5,
    elevation: 2,
    width: Dimensions.get('window').width / 4,
    justifyContent: 'center',
  },
  scrollViewContainer: {
    paddingTop: 80,
  },
  flexView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  aqiText: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  pollutantText: {
    fontSize: 16,
    color: '#333',
    marginVertical: 2,
  },
  pollutionData: {
    alignItems: 'center',
    padding: 10,
    borderRadius: 10,
    elevation: 2,
  },
  paddingBottomStyle: {paddingBottom: 200},
  titleStyle: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#000',
  },
  viewHeight: {
    marginTop: 20,
  },
});

export default Weather;
