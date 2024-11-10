/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import React from 'react';
import {SafeAreaView, ScrollView, StyleSheet, View} from 'react-native';
import Weather from './src/screens/Weather';
import 'react-native-devsettings';

const App = () => {
  return (
    <View style={styles.container}>
      {/* <ScrollView style={styles.scrollViewStyle}> */}
      <Weather />
      {/* </ScrollView> */}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
  },
  scrollViewStyle: {
    paddingVertical: 100,
  },
});

export default App;
