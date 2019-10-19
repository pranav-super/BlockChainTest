import React, { Component } from 'react';
import { Text, View, TouchableOpacity, TextInput, StyleSheet, Alert, Image } from 'react-native';

export default class Transaction extends Component {



  constructor(props) {
    super(props);

    this.navigation = props.navigation;

    this.state = {
      username: this.navigation.state.params.username,
      password: this.navigation.state.params.password,
      total: this.navigation.state.params.total,
      transactions: this.navigation.state.params.transactions,
      my_address: this.navigation.state.params.my_address,
      toRender: '',
      recipient_address: '',
      amount_validity: false,
      recipient_validity: false,
      sent_amount: 0
    }

    this.searchForName = this.searchForName.bind(this);
    this.verifyAmount = this.verifyAmount.bind(this);
    this.handlePress = this.handlePress.bind(this);
    this.submit = this.submit.bind(this);

  }




  searchForName(username) {
    //setState accordingly
    /*this.setState({
      recipient_username: username,
      recipient_validity: true
    });*/

    if(username == this.state.username) {
      this.setState({
        recipient_validity: false,
        recipient_address: ''
      });
      return;
    }

    var hash = '';

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
        reason: 'verifyUser',
        username: username
      })
    }).then(response => response.json())
    .then(json => {
      if (json.status == 'failed' || json.status == 'true') {
        this.setState({
          recipient_validity: false,
          recipient_address: ''
        });
      }
      else {
        hash = json.hash;
        this.setState({
          recipient_validity: true,
          recipient_address: hash
        });
      }
    });

    //set validity accordingly (if totally invalid, alert pops up saying either amount or recipient username is wrong)
    //if name is valid dont do anything, maybe have a little happy image, and set recipient_address to the corresponding address
    //if name is invalid, have a sad image
  }




  verifyAmount(amount) {
    //set state accordingly
    this.setState({
      sent_amount: amount
    });
    //if amount is greater than total, sad face and set valid to false
    if (amount == '') {
      this.setState({
        amount_validity: false
      });
      return;
    }
    if (amount <= this.state.total) {
      this.setState({
        amount_validity: true
      });
      return;
      //image/icon?????
    }
    //if amount is less, happy face, validity = true
    else {
      this.setState({
        amount_validity: false
      });
      //image/icon?????
    }
  }




  handlePress() { //handled by the header? so work with that, and navigating the stack, such that you can have a custom return button that pops off the stack?
    return this.navigation.navigate('landing', this.state);
  }




  submit() {
    //if amount is invalid, recipient is invalid, address is empty, or amount is <= 0 or greater than
    if(this.state.amount_validity && this.state.recipient_validity && this.state.recipient_address != '' && this.state.sent_amount > 0) {
      //send an alert, saying something is wrong
      fetch('http://10.74.50.170:5000/txion', {
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
          from: this.state.my_address,
          amount: this.state.sent_amount,
          to: this.state.recipient_address
        }), // body data type must match "Content-Type" header
      })
      .then(response => response.json())
      .then(json => console.log(json));

      this.setState({
        total: this.state.total - this.state.sent_amount,
        sent_amount: 0
      });

      this.verifyAmount(this.state.sent_amount); //this prevents someone mashing the button
    }
    //else:
    else {
      //POST REQUEST BABEY
      Alert.alert('Check your addresses and amounts!');
    }
  }




  render() {

    var happySad = (<View />);
    if (this.state.amount_validity) {
      happySad = <Image source={require('../../assets/happy.png')} style={{width: 50, height: 50}}/>
    }
    else {
      happySad = <Image source={require('../../assets/sad.png')} style={{width: 50, height: 50}}/>
    }


    var toRender = (<View />);
    switch (this.state.toRender) {
      case '':
        toRender = (<View />);
        break;
      case 'userOfOurService':
        toRender =
          (<View>
            <TextInput placeholder={'Recipient Username'} onChangeText={(username) => this.searchForName(username)}/>
            <TextInput placeholder={'Amount'} onChangeText={(amount) => this.verifyAmount(amount)}/>
            {happySad}
            <TouchableOpacity onPress={() => this.submit()}>
              <Text>Submit!</Text>
            </TouchableOpacity>
          </View>);
        break;
      case 'notAUserOfOurService':
        toRender =
          (<View>
            <TextInput placeholder={'Recipient Address (be careful typing this!)'} onChangeText={(addy) => this.setState({recipient_address: addy, recipient_validity: true})}/>
            <TextInput placeholder={'Amount'} onChangeText={(amount) => this.verifyAmount(amount)} />
            {happySad}
            <TouchableOpacity onPress={() => this.submit()}>
              <Text>Submit!</Text>
            </TouchableOpacity>
          </View>);
        break;
      default:
        break;
    }



    return(
      <View style={styles.container}>
        <Text>The recipient of your payment is a user of our service:</Text>
        <TouchableOpacity onPress={() => this.setState({toRender: 'userOfOurService'})}>
          <Text>Yes.</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => this.setState({toRender: 'notAUserOfOurService'})}>
          <Text>No.</Text>
        </TouchableOpacity>

        {toRender}

      </View>
    );
  }
}



const styles = StyleSheet.create({

  container: {
    backgroundColor: "#ddd2ce",
    justifyContent: 'flex-start',
    flex: 1
  },

  title: {
    alignItems: "center",
    justifyContent: "center",
    flex: .8
  },

  titleText: {
    fontFamily: "sans-serif-light",
    backgroundColor: "#3f3f37",
    color: "#dd977c",
    fontSize: 35
  },


  loginContainer: {
    //salignItems: 'center',

  },

  loginField: {
    margin: 10
  },

  textField: {
    margin: 10
  },

  button: {
    alignItems: 'center',
    backgroundColor: "#dd977c",
    padding: 10,
    margin: 10,
    borderRadius: 3
  }
});
