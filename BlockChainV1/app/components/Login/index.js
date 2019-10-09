import React, { Component } from 'react';
import { Text, View, TouchableOpacity, TextInput, StyleSheet, Alert } from 'react-native';

export default class Login extends Component {
  constructor(props) {
    super(props);

    //console.log(props.navigation);

    //const navigation = this.props.navigation;
    this.navigation = props.navigation; //NOT this.props.navigation, lol


    this.state = {
      username: '',
      password: ''
    }

    this.logIn = this.logIn.bind(this);
  }




  logIn() { //VERIFY USERNAME!
    var valid = false;
    //verify username & password
    fetch ('http://10.74.50.170:3000/', {
      method: 'POST',
      mode: 'cors',
      cache: 'no-cache',
      headers: {
        'Content-Type': 'application/json'
      },
      redirect: 'follow',
      referrer: 'no-referrer',
      body: JSON.stringify({
        reason: 'login',
        username: this.state.username,
        password: this.state.password
      }),
    })
    .then(response => response.json())
    .then(json => {
      //console.log(json);
      if (json.status == 'true') {
        this.setState({
          hash: json.hash
        });
        return this.navigation.navigate("landing", this.state);
      }
      else {
        Alert.alert("The username or password you have entered is invalid.");
      }
    });
    //if valid:
      //send to landing
    //if not:
      //fuck you you are cringe


    /*//const username, password = this.state;
    username = this.state.username;
    password = this.state.password;
    if (username == 'admin' && password == 'admin') {
      return this.navigation.navigate("landing", this.state);


      //the below actually worked! it printed in console, which is weird, but since, logically speaking, it should fail (unless maybe that's how stacknavigator works, allowing stuff to just keep running), the navigation class said "no, oding navigate.then is not valid, dont try"
      //this.navigation.navigate("landing", this.state).then(console.log("bruh")); //navigation is passed as a prop to this class
                                                       //by App.js. Need to pass props about the user to the landing page
      //console.log("bruh"); bruh i think this ran synchronously lol, maybe stacknavigator keeps the classes below the stack as like still running/saved so that stuff like this can log, but it doesnt want you to do a .then after navigate! It still works, but discourages it.
    }*/

  }




  render() {
    return(
      <View style={styles.container}>
        <View style={styles.loginField}>
          <TextInput onChangeText={(text) => this.setState({username: text})} placeholder={"Username"} />
          <TextInput onChangeText={(text) => this.setState({password: text})} placeholder={"Password"} secureTextEntry={true} />
        </View>

        <TouchableOpacity onPress={() => this.logIn()}>
          <Text>Log in!</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => this.navigation.navigate("newUser")}>
          <Text>I don't have an account.</Text>
        </TouchableOpacity>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {

  },

  loginField: {

  },

  button: {

  }
});
