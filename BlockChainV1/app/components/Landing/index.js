import React, { Component } from 'react';
import { Text, View, TouchableOpacity, TextInput, StyleSheet, Image } from 'react-native';
//import murmur from 'murmur-hash-js'

export default class Landing extends Component {
  constructor(props) {
    super(props);

    this.navigation = props.navigation;


    //getParam didnt work, but looking through the object passed that is navigation, this is how you do it.
    this.usernameProp = this.navigation.state.params.username;//.getParam('username', 'fail'); //second value is a fallback value....it shouldn't ever hit that value
    this.passwordProp = this.navigation.state.params.password;//.getParam('password', 'fail');


/*    if (usernameProp == 'fail' && passwordProp == 'fail') {
      this.props.navigation.navigate('login');
    } //not sure if its bad practice to leave logic like this in the constructor, but i wanna abort asap if we have bad data :*/

    this.state = {
      username: this.usernameProp,
      password: this.passwordProp,
      total: 0,
      transactions: [],
      my_address: this.navigation.state.params.hash,
      loading: true
    }

    this.handlePress = this.handlePress.bind(this);
    //do you need to bind componentDidMount????
    this.refresh = this.refresh.bind(this);
  }


  /*computeAddress() {
    this.setState({
      my_address: murmur.murmur3(this.state.username, this.state.password);
    })
  }*/


  async componentDidMount() { //I thinkmaking this async is safe...https://stackoverflow.com/questions/47970276/is-using-async-componentdidmount-good, maybe find a way to do a loading screen while it mounts?
    //TRY THIS FOR LOADING SCREEN: https://stackoverflow.com/questions/46766169/react-native-screen-load-function

    /*this.setState({
      my_address: this.state.username
    });*/
    /*await this.setState({
      my_address: computeAddress()
    })*/

    if (this.usernameProp == 'fail' && this.passwordProp == 'fail') {
          this.navigation.navigate('login');
    }

    //get blockchain (note: should i leave this logic in the constructor???)
    var total = 0;
    var myTransactions = [];
    //NOT SURE WHY I HAVE TO MAKE THIS A RETURN, INSTEAD OF JUST LEAVING IT AS A NORMAL STATEMENT, BECAUSE IT EXITS THIS METHOD ANYWAYS...
    /*const fet = fetch('http://10.74.50.170:5000/blocks') //lol its http
    console.log(fet);*/

    var finalTransactions = [];

    await fetch('http://10.74.50.170:5000/blocks') //MOVE THIS TO RENDER?????
      .then(response => response.json()) //returns a promise, which is then interpreted below as responseJSON.
      .then((json) => {
        console.log(json);
        json.forEach((block) => {
          //each element is a block, with 4 transactions
          const transactions = block.data.transactions;
          //console.log(transactions);

          transactions.forEach((transaction) => {
            if (this.state.my_address == transaction.from) {
              total -= transaction.amount;
              myTransactions.push(transaction);
            }
            if (this.state.my_address == transaction.to) {
              total += transaction.amount;
              myTransactions.push(transaction);
            }
          });
          /*transactions.forEach((transaction) => {//this was problematic, no variable named username, only this.username!!!!!!!!!!!!!!!!!!
            if (username == transaction.from) { //implement a proper addressing scheme later.
              total -= transaction.amount;
              myTranscations.push(transaction);
            }
            else if (username == transaction.to) {
              total += transaction.amount;
              myTranscations.push(transaction);
            }
          }).then(() => { //this is problematic!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
            this.setState({total: total, transactions: myTranscations});
          });*/
        });
      }).then(() => {
        myTransactions.forEach((transaction, index) => {
          console.log(".")
          var toVar = '';
          var fromVar = '';
          this.findUserByHash(transaction.to).then(val => {
            //console.log(val);
            toVar = val;
            this.findUserByHash(transaction.from).then(value => {
              //console.log(value);
              fromVar = value;
              finalTransactions.push({
                to: toVar,
                from: fromVar,
                amount: transaction.amount
              });
              //console.log(finalTransactions);
            }).then(() => {
                    console.log(finalTransactions)
                    this.setState({
                      total: total,
                      transactions: finalTransactions, //works, BUT FIX THIS????????????????????????????????????????
                      loading: false
                    });
              });
          });
        }); //instead of an ugly hash, if the user is in our system, print out their username!
        //console.log(finalTransactions);
      })
    /*this.setState({
      total: total,
      transactions: myTranscations,
      loading: false
    });
    /*const options = {
      hostname: 'http://10.74.50.170',
      port: 5000,
      path: '/blocks',
      method: 'GET',
    };

    const req = http.request(options, (res) => {
      console.log(res);
    });
    /*
      .then(function(response) {
        return response.json();
      })
      .then((json) => {
        /*
          [{"index": "0", "data": "{'transactions': ['None.'], 'proof-of-work': 69}", "hash": "c5c733a40833c0776be9f8c46ec7d24b12325eee4317c24765633c62a9a38ae8", "timestamp": "2019-06-27 09:57:09.334000"}]
        */
        /*[{
          "index": 0,
          "data": {
                    "transactions": ["None."],
                    "proof-of-work": 69
                  },
          "hash": "c31fe792510c2b8a7a2fe3b05be370e3fb0313c57e7d27934f14e8dbaf85c6aa",
          "timestamp": "2019-06-27 10:00:26.527000"
        }]*/

        /*json.forEach((block) => {
          //each element is a block
          const transactions = block.data.transactions;
          transactions.forEach((transaction) => {
            if (username == transaction.from) { //implement a proper addressing scheme later.
              total -= transaction.amount;
              myTranscations.push(transaction);
            }
            else if (username == transaction.to) {
              total += transaction.amount;
              myTranscations.push(transaction);
            }
          }).then(() => {
            this.setState({total: total, transactions: myTranscations});
          });
        });
      })*/

    //filter through and find what pertains to the user

    //create a bunch of cards for the transactions, in a list

    //calculate how much i have rn as a result, this means that to get a 0 dollar amount in money i need to count taking USD to MonkeyCoin as a transaction
    //if the MonkeyCoin gets a transaction, it'll count it so we're good.

    //then return
  }

  handlePress() {
    return this.navigation.navigate('transaction', this.state);
  }

  async refresh() {
    this.setState({
      loading: true
    });

    var total = 0;
    var myTransactions = [];

    var finalTransactions = [];

    await fetch('http://10.74.50.170:5000/blocks')
      .then(response => response.json()) //returns a promise, which is then interpreted below as responseJSON.
      .then((json) => {
        console.log(json);
        json.forEach((block) => {
          //each element is a block, with 4 transactions
          const transactions = block.data.transactions;
          console.log(transactions);
          transactions.forEach((transaction) => {
            if (this.state.my_address == transaction.from) {
              total -= transaction.amount;
              myTransactions.push(transaction);
            }
            if (this.state.my_address == transaction.to) {
              total += transaction.amount;
              myTransactions.push(transaction);
            }
          });
        });
      })
      .then(() => {
        myTransactions.forEach((transaction, index) => {
          console.log(".")
          var toVar = '';
          var fromVar = '';
          this.findUserByHash(transaction.to).then(val => {
            //console.log(val);
            toVar = val;
            this.findUserByHash(transaction.from).then(value => {
              //console.log(value);
              fromVar = value;
              finalTransactions.push({
                to: toVar,
                from: fromVar,
                amount: transaction.amount
              });
              //console.log(finalTransactions);
            }).then(() => {
                    console.log(finalTransactions)
                    //sort finalTransactions by index
                    this.setState({
                      total: total,
                      transactions: finalTransactions, //works, BUT FIX THIS????????????????????????????????????????
                      loading: false
                    });
              });
          });
        }); //instead of an ugly hash, if the user is in our system, print out their username!
        //console.log(finalTransactions);
      })
//      .then(() => { //executes before the .then before is done, i guess.
//        console.log(finalTransactions)
//        this.setState({
//          total: total,
//          transactions: finalTransactions,
//          loading: false
//        });
//      });
  }






  async findUserByHash(hash) {
    //make a fetch to the API, and if the status is "no user", return the hash
    var returnValue = hash;
    await fetch('http://10.74.50.170:3000/', {
        method: 'POST',
        mode: 'cors',
        cache: 'no-cache',
        headers: {
          'Content-Type': 'application/json',
        },
        redirect: 'follow',
        referrer: 'no-referrer',
        body: JSON.stringify({
          reason: 'getUsernameFromHash',
          hash: hash
        })
    }).then(response => response.json()).then(json => {
      if (json.status == "no user") {
        returnValue = hash;
        //return hash;
      }
      else {
      //if the status is "user", return the username
        returnValue = json.username;
        //return json.username;
      }
    });
    //console.log(returnValue);
    return returnValue;
  }






  render() {
    //get blockchain (note: should i leave this logic in the constructor???)


    //filter through and find what pertains to the user

    //create a bunch of cards for the transactions, in a list

    //calculate how much i have rn as a result, this means that to get a 0 dollar amount in money i need to count taking USD to MonkeyCoin as a transaction
    //if the MonkeyCoin gets a transaction, it'll count it so we're good.

    //then return

    var transactions = this.state.transactions;
    var cards = [];
    transactions.forEach((transaction, index) => {
      cards.push(
        <View key={index}>
          <Text>To: {transaction.to}</Text>
          <Text>From: {transaction.from}</Text>
          <Text>Amount: {transaction.amount}</Text>
        </View>
      );
    });

    if (this.state.loading) {
      cards = [];
      cards.push(
        <Image source={require('../../assets/background-transparent-loading-4.gif')} key={-1} />
      );
    }

    //console.log(transactions)

    return(
      <View style={styles.container}>
        <View style={styles.loginField}>
          <Text>You have MC{this.state.total}</Text>
          {cards}
          <TouchableOpacity onPress={() => this.handlePress()}>
            <Text>Make a transaction!</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => this.refresh()}>
            <Text>Refresh.</Text>
          </TouchableOpacity>
        </View>
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
