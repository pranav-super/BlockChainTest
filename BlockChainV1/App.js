/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow
 */

import React, {Component} from 'react';
import {Platform, StyleSheet, Text, View} from 'react-native';
import { createStackNavigator, createAppContainer } from 'react-navigation';
import Login from './app/components/Login';
import Landing from './app/components/Landing';
import Transaction from './app/components/Transaction';
import NewUser from './app/components/New User';

/*export default class App extends Component<Props> {
  render() {
    return (
      <AppNavigator />
    );
  }
}*/

const AppNavigator = createStackNavigator({
  login: {
    screen: Login,
    navigationOptions: {
        header: null,
    }
  },

  landing: {
    screen: Landing,
    navigationOptions: {
        headerStyle: {{backgroundColor: "#ddd2ce"}},
    }
  },

  transaction: {
    screen: Transaction,
    navigationOptions: {
        headerStyle: {{backgroundColor: "#ddd2ce"}},
    }
  },

  newUser: {
    screen: NewUser,
    navigationOptions: {
        headerStyle: {{backgroundColor: "#ddd2ce"}},
    }
  }
});

const App = createAppContainer(AppNavigator);

export default App;
