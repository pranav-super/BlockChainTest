import React, { Component } from 'react';
import { Text, StyleSheet, View, TextInput, Alert, TouchableOpacity } from 'react-native';
import murmurHash3 from 'murmurhash3js';


export default class NewUser extends Component {
  constructor(props) {
    super(props);

    this.navigation = props.navigation;

    this.state = {
      username: "",
      password: "",
      usernameValid: false,
      passwordValid: false
    }

    this.submit = this.submit.bind(this);
    this.verifyUsername = this.verifyUsername.bind(this);
    this.verifyPassword = this.verifyPassword.bind(this);
  }





  submit() {
    //check validity, if they are valid, send a post request and reroute to the login page

    if (this.state.usernameValid && this.state.passwordValid) {
      const murmurHash = murmurHash3.x64.hash128(this.state.username + "&&" + this.state.password);

      fetch('http://10.74.50.170:3000/', {
        method: 'POST',
        mode: 'cors',
        cache: 'no-cache',
        headers: {
          'Content-Type': 'application/json',
        },
        redirect: 'follow',
        referrer: 'no-referrer',
        body: JSON.stringify({
          reason: 'submitUser',
          username: this.state.username,
          password: this.state.password,
          hash: murmurHash
        }),
      })
      .then(response => response.json())
      .then(json => {
        if (json.status == 'failed') {
          Alert.alert("The SQL reqeust failed^*!"); //should NEVER hit this!
        }
        else if (json.status == 'false') {
          Alert.alert("The user is already in use^*!");
        }
        else if (json.status == 'true') {
          this.navigation.navigate('login');
        }
      });
    }
    //if invalid, alert
    else if (!this.state.usernameValid) {
      Alert.alert('This username is already in use!');
    }
    else {
      Alert.alert('This password lacks the requirements: 8 characters long and at least 1 special character!')
    }
  }





  verifyUsername(user) {
    //change state
    this.setState({
      username: user
    });
    //check w database, see if username is ok!

    //send a POST request to the server rest API
    fetch('http://10.74.50.170:3000/', {
      method: 'POST', // *GET, POST, PUT, DELETE, etc.
      mode: 'cors', // no-cors, cors, *same-origin
      cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
      //credentials: 'same-origin', // include, *same-origin, omit
      headers: {
          'Content-Type': 'application/json',
          // 'Content-Type': 'application/x-www-form-urlencoded',
      },
      redirect: 'follow', // manual, *follow, error
      referrer: 'no-referrer', // no-referrer, *client
      body: JSON.stringify({
        reason: 'verifyUser',
        username: user
      }), // body data type must match "Content-Type" header
    })
    .then(response => response.json())
    .then(json => {
      console.log(json);
      console.log(json.status);
      console.log(json.status == 'false');
      console.log(json.status == "false");
      console.log(json.status == 'true');
      console.log(json.status == "true");
      if (json.status == 'false' || json.status == 'failed') {
        //console.log(json.status);
        this.setState({
          usernameValid: false
        });
      }
      else {
        this.setState({
          usernameValid: true
        });
      }
    });
  }





  verifyPassword(pass) {
    //check if password is 8 characters long and if it has at least one capital and one unique character
    this.setState({
      password: pass
    });



    var index = -1;
    const specialCharacters = ["!", "*", "+", "^"];

    for (let i = 0; i < specialCharacters.length; i++) {
      if (pass.indexOf(specialCharacters[i]) != -1) {
        index = pass.indexOf(specialCharacters[i]);
        break;
      }
    }


    if (pass.length < 8) {
      this.setState({
        passwordValid: false
      });
    }

    else if (index == -1) {
      this.setState({
        passwordValid: false
      });
    }

    else {
      this.setState({
        passwordValid: true
      })
    }
  }



  render() {
    return(
      <View>

        <TextInput placeholder={'Username'} onChangeText={(text) => this.verifyUsername(text)} />

        <TextInput placeholder={'Password'} onChangeText={(text) => this.verifyPassword(text)} />

        <TouchableOpacity onPress={() => this.submit()}>
          <Text> Submit! </Text>
        </TouchableOpacity>

      </View>
    );
  }
}

const styles = StyleSheet.create({

});
