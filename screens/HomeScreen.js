import {
  View,
  Text,
  SafeAreaView,
  StyleSheet,
  ImageBackground,
  TextInput,
  TouchableOpacity,
  Image,
  ScrollView,
} from "react-native";

import React, { useCallback, useEffect, useState } from "react";
import { StatusBar } from "expo-status-bar";
import { Avatar } from "react-native-paper";
import { debounce } from "lodash";
import { fetchLocations, fetchWeatherForecast } from "../api/Weather";
import { weatherImages } from "../constants";

export default function HomeScreen() {
  const [showSearch, toggleSearch] = useState(false);
  const [locations, setLocations] = useState([]);
  const [weather, setWeather] = useState({});
  const [loading, setLoading] = useState(true);

  const handleLocation = (loc) => {
    console.log("location: ", loc);
    setLocations([]);
    toggleSearch(false);
    setLoading(true);
    fetchWeatherForecast({
      cityName: loc.name,
      days: "7",
    }).then((data) => {
      setWeather(data);
      setLoading(false);
      console.log("got forecast: ", data);
    });
  };

  const handleSearch = (loc) => {
    if (loc.length > 2) {
      fetchLocations({ cityName: loc }).then((data) => {
        setLocations(data);
      });
    }
  };

  useEffect(() => {
    fetchMyWeatherData();
  }, []);

  const fetchMyWeatherData = async () => {
    fetchWeatherForecast({
      cityName: "Jalna",
      days: "7",
    }).then((data) => {
      setWeather(data);
      setLoading(false);
    });
  };

  const handleTextDebounce = useCallback(debounce(handleSearch, 1200), []);

  const { current, location } = weather;

  return (
    <ImageBackground
      style={styles.backgroundImage}
      source={require("../assets/background.jpg")}
    >
      {loading ? (
        <View style={styles.loading}>
          <Text style={styles.text}>Loading...</Text>
        </View>
      ) : (
        <SafeAreaView style={styles.container}>
          <View style={styles.main}>
            <View
              style={StyleSheet.flatten([
                styles.search,
                showSearch ? styles.searchActive : styles.searchInactive,
              ])}
            >
              {showSearch ? (
                <TextInput
                  onChangeText={handleSearch}
                  style={styles.input}
                  placeholder="Search City"
                  placeholderTextColor={"#c2c2c2"}
                />
              ) : null}

              <TouchableOpacity
                onPress={() => toggleSearch(!showSearch)}
                style={styles.icon}
              >
                <Avatar.Icon
                  style={styles.iconimg}
                  icon="magnify"
                  color="#fff"
                  size={30}
                />
              </TouchableOpacity>
            </View>
            {locations.length > 0 && showSearch ? (
              <View style={styles.searchtxt}>
                {locations.map((loc, index) => {
                  return (
                    <TouchableOpacity
                      key={index}
                      style={styles.city}
                      onPress={() => handleLocation(loc)}
                    >
                      <Avatar.Icon
                        style={styles.iconimg1}
                        icon="map-marker"
                        color="white"
                        size={30}
                      />
                      <Text style={styles.cityname}>
                        {loc?.name}, {loc?.country}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            ) : null}
            <View style={styles.forecastContainer}>
              <View style={styles.forecast}>
                {/* City Name */}
                <Text style={styles.name}>
                  {location?.name}
                  <Text style={styles.subname}>{", " + location?.country}</Text>
                </Text>
                {/* Weather Image */}
                <View style={styles.weatherContainer}>
                  <Image
                    style={styles.weatherimg}
                    source={weatherImages[current?.condition?.text]}
                  />
                  {/* degree celcius */}
                  <View style={styles.degcelcius}>
                    <Text style={styles.degree}>{current?.temp_c}&#176;</Text>
                    <Text style={styles.detail}>
                      {current?.condition?.text}
                    </Text>
                  </View>
                  {/* other details */}
                  <View style={styles.more}>
                    <View style={styles.moredetail}>
                      <Image
                        style={styles.weathericon}
                        source={require("../assets/wind.png")}
                      />
                      <Text style={styles.detail1}>{current?.wind_kph}km</Text>
                    </View>
                    <View style={styles.moredetail}>
                      <Image
                        style={styles.weathericon}
                        source={require("../assets/drop.png")}
                      />
                      <Text style={styles.detail1}>{current?.humidity}%</Text>
                    </View>
                    <View style={styles.moredetail}>
                      <Image
                        style={styles.weathericon}
                        source={require("../assets/sun(1).png")}
                      />
                      <Text style={styles.detail1}>
                        {weather?.forecast?.forecastday[0]?.astro?.sunrise}
                      </Text>
                    </View>
                  </View>
                </View>
              </View>
            </View>
            <View style={styles.weekdetail}>
              {/* <View style={styles.moredetail1}>
                                            <Avatar.Icon style={styles.iconimg1} icon="calendar-month" color='white' size={40}/>
                                            <Text style={styles.detail1}>Daily Forecast</Text>
                                    </View> */}
              <ScrollView
                horizontal
                contentContainerStyle={{ paddingHorizontal: 5 }}
                showsHorizontalScrollIndicator={false}
                style={styles.scroll}
              >
                {weather?.forecast?.forecastday?.map((item, index) => {
                  let date = new Date(item.date);
                  let options = { weekday: "short" };
                  let dayName = date.toLocaleDateString("en-US", options);
                  dayName = dayName.split(",")[0];
                  return (
                    <View key={index} style={styles.daily}>
                      <Image
                        style={styles.dailyimg}
                        source={weatherImages[item?.day?.condition?.text]}
                      />
                      <Text style={styles.detail1}>{dayName}</Text>
                      <Text style={styles.subhead}>
                        {item?.day?.avgtemp_c}&#176;
                      </Text>
                    </View>
                  );
                })}
              </ScrollView>
            </View>
            <StatusBar style="light" />
          </View>
        </SafeAreaView>
      )}
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  loading: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
    height: "100%",
  },
  text: {
    color: "#fff",
    fontSize: 30,
  },
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    color: "#fff",
  },
  main: {
    width: "100%",
    height: "100%",
    padding: 10,
    paddingTop: 40,
    alignItems: "center",
  },
  backgroundImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  subhead: {
    fontSize: 20,
    fontWeight: 600,
    color: "#fff",
  },
  search: {
    width: "90%",
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 60,
    borderRadius: 100,
    padding: 5,
    marginTop: 20,
    paddingRight: 5,
  },
  input: {
    color: "white",
    paddingLeft: 10,
    outline: "transparent",
    justifyContent: "flex-start",
  },
  icon: {
    color: "#fff",
    justifyContent: "flex-end",
  },
  iconimg: {
    color: "#fff",
    backgroundColor: "rgba(255, 255, 255, 0.4)",
  },
  searchActive: {
    backgroundColor: "rgba(255, 255, 255, 0.2)",
  },
  searchInactive: {
    backgroundColor: "transparent",
  },
  searchtxt: {
    paddingTop: 5,
    paddingBottom: 5,
    paddingLeft: 10,
    width: "88%",
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    marginTop: 10,
    borderRadius: 20,
  },
  city: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "flex-start",
    alignItems: "center",
    gap: 10,
  },
  iconimg1: {
    color: "#c2c2c2",
    backgroundColor: "transparent",
  },
  cityname: {
    color: "white",
    fontSize: 17,
  },
  forecastContainer: {
    flex: 1,
    width: "100%",
    alignItems: "center",
    flexDirection: "column",
    justifyContent: "space-around",
    alignItems: "center",
    gap: 10,
  },
  weatherContainer: {
    flex: 2,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 20,
  },
  forecast: {
    width: "100%",
    height: "100%",
    alignItems: "center",
    display: "flex",
    flexDirection: "column",
    gap: 10,
  },
  name: {
    fontSize: 24,
    color: "#fff",
    fontWeight: 500,
    marginTop: 20,
  },
  subname: {
    fontSize: 21,
  },
  weatherimg: {
    width: 145,
    height: 145,
    marginTop: 10,
  },
  degcelcius: {
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
  },
  degree: {
    color: "#fff",
    fontSize: 40,
    fontWeight: 700,
  },
  detail: {
    fontSize: 18,
    color: "#fff",
  },
  more: {
    display: "flex",
    flexDirection: "row",
  },
  moredetail: {
    display: "flex",
    flexDirection: "row",
    gap: 8,
    justifyContent: "flex-start",
    alignItems: "center",
    padding: 10,
  },
  moredetail1: {
    display: "flex",
    flexDirection: "row",
    gap: 10,
    justifyContent: "center",
    alignItems: "center",
  },

  weathericon: {
    width: 25,
    height: 25,
  },
  detail1: {
    fontSize: 15,
    color: "#fff",
  },
  dailyimg: {
    width: 50,
    height: 50,
  },
  weekdetail: {
    width: "95%",
    marginBottom: 20,
  },
  daily: {
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    borderColor: "rgba(255, 255, 255, 0.4)",
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    padding: 10,
    marginTop:10,
    borderRadius: 20,
    marginRight: 10,
    gap: 5,
  },
});
