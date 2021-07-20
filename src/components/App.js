import { Tabs, Tab } from 'react-bootstrap'
import dBank from '../abis/dBank.json'
import React, { Component } from 'react';
import Token from '../abis/Token.json'
import strava from '../strava.png';
import Web3 from 'web3';
import './App.css';
import {link_list} from '../components/api_link.js';
import swal from 'sweetalert';


//truffle migrate --reset to resend code to blockchain
//npm run start to start web server
//Where are the private keys stored for bank account?

class App extends Component {
  
  

  async componentWillMount() {
    await this.loadBlockchainData(this.props.dispatch)
    //console.log(link_list[0])

          fetch(link_list[0])
            .then(res => res.json())
            .then((activities) => {
              const dist_list = [];
              const activity_list =[];
              var myStringArray = activities;
              var arrayLength = myStringArray.length;

              function getMiles(i) {
                return i*0.000621371;
           }
              
              for (var i = 0; i < arrayLength; i++) {
                  const to_miles = (getMiles(myStringArray[i].distance))
                  activity_list.push({act_name: myStringArray[i].name, act_dist: to_miles.toFixed(1)})
                  dist_list.push(to_miles.toFixed(1));
              }
              const check_marathon = dist_list.includes('26.2')
              const true_or_false = check_marathon
              //console.log(true_or_false)
              this.setState({activity_list: activity_list, true_or_false: true_or_false})
            })
            .catch(console.log)

            
    
      }
    
  async loadBlockchainData(dispatch) {
    

    if(typeof window.ethereum!=='undefined'){
      const web3 = new Web3(window.ethereum)
      const netId = await web3.eth.net.getId()
      //console.log(netId)
      const accounts = await web3.eth.getAccounts()

      //load balance
      if(typeof accounts[0] !=='undefined'){
        const balance = await web3.eth.getBalance(accounts[0])
        const wallet_eth_balance = web3.utils.fromWei(balance)
        this.setState({account: accounts[0], balance: balance, web3: web3, wallet_eth_balance: wallet_eth_balance})
      } else {
        window.alert('Please login with MetaMask')
      }
      
      //load contracts
      try {
        const token = new web3.eth.Contract(Token.abi, Token.networks[netId].address)
        const dbank = new web3.eth.Contract(dBank.abi, dBank.networks[netId].address)
        const dBankAddress = dBank.networks[netId].address
        const BankBalance = await web3.eth.getBalance(dBankAddress)
        const bank_eth_balance = web3.utils.fromWei(BankBalance)
        
        this.setState({token: token, dbank: dbank, dBankAddress: dBankAddress, bank_eth_balance: bank_eth_balance})
      } catch (e) {
        console.log('Error', e)
        window.alert('Contracts not deployed to the current network')
      }

    } else {
      window.alert('Please install MetaMask')
    }
  }

  async deposit(amount) {
    if(this.state.dbank!=='undefined'){
      try{
        await this.state.dbank.methods.deposit().send({value: amount.toString(), from: this.state.account})
      } catch (e) {
        console.log('Error, deposit: ', e)
      }
    }
  }

  async withdraw(e) {
    e.preventDefault()
    if(this.state.dbank!=='undefined'){
      //add alert if trying to withdrawl nothing?
      if (this.state.true_or_false === false){
        swal({
          title: "You Havent ran a Marathon Yet",
          icon: "error",
          text: "Keep working to get your collateral back!" 
      });
        
      } else{
        try{
          await this.state.dbank.methods.withdraw().send({from: this.state.account})
          
        } catch(e) {
          console.log('Error, withdraw: ', e)
          
        }
      }
    }
  }
  

  constructor(props) {
    super(props)
    this.state = {
      web3: 'undefined',
      account: '',
      token: null,
      dbank: null,
      balance: 0,
      bank_eth_balance: 0,
      wallet_eth_balance: 0,
      dBankAddress: null,
      activity_list: [],

    }
  }


  render() {
    return (
      <div className='text-monospace'>
        <nav id="top" className="navbar navbar-light fixed-top bg-orange flex-md-nowrap p-0 shadow">
          <a
            className="navbar-brand col-sm-3 col-md-2 mr-0"
            href=""
            target="_blank"
            rel="noopener noreferrer"
          >
        <img src={strava} className="App-logo" alt="logo" height="32"/>
          <b> Strava Activity Tracking</b>
        </a>
        </nav>
        <div className="container-fluid mt-5 text-center">
        <br></br>
          <h1>Welcome to your Marathon Trainer</h1>
          <br></br>
          {/* 
          <h3>Bank Address:</h3>
          <h2>{this.state.dBankAddress}</h2>
          A JSX comment */}
          {/*  
          <h3>Your meta MetaMask address:</h3>
          <h2>{this.state.account}</h2>
          */}
          <br></br>
          <h3>Your MetaMask Balance:</h3>
          <h2>{this.state.wallet_eth_balance} ETH</h2>
          <br></br>
          <h3>Bank Balance:</h3>
          <h2>{this.state.bank_eth_balance} ETH</h2>
          <br></br>
          
          <h3>Your recent Strava activities</h3>
                  <div>
                    {this.state.activity_list.map(person => (
                      <p>{person.act_name},  {person.act_dist} mi</p>
                    ))}
                  </div>
          <br></br>
          <br></br>
          <div className="row">
            <main role="main" className="col-lg-12 d-flex text-center">
              <div className="content mr-auto ml-auto">
              <Tabs defaultActiveKey="profile" id="uncontrolled-tab-example">
                <Tab eventKey= "deposit" title="Deposit"> 
                <div>
                  <br></br>
                    How much ETH do you want to lock up? 
                    <br></br>
                    <br></br>
                    (You will only get your collateral back 
                    <br></br>
                    after you complete a marathon.)
                    <form onSubmit={(e) => {
                      e.preventDefault()
                      let amount = this.depositAmount.value
                      amount = amount * 10**18 //convert to wei
                      this.deposit(amount)
                    }}>
                      <div className='form-group mr-sm-2'>
                      <br></br>
                        <input
                          id='depositAmount'
                          step="0.01"
                          type='number'
                          ref={(input) => { this.depositAmount = input }}
                          className="form-control form-control-md"
                          placeholder='amount...'
                          required />
                      </div>
                      <button  type='submit' className='btn'>DEPOSIT</button>
                    </form>
                  </div>
                </Tab>
                <Tab eventKey= "withdraw" title="Withdraw"> 
                  <div>
                    <br></br>
                    Do you want to withdraw
                    <br></br>
                    <br></br>
                    <button type='submit' className='btn' onClick={(e) => this.withdraw(e)}>WITHDRAW</button>
                  </div>
                </Tab>
              </Tabs>
              <br></br>
              <button type='submit' className='btn' onClick={(e) => window.location.reload()(e)}>Refresh Balances</button>
              <br></br>

              </div>
              
            </main>
            
        </div>
          </div>
        </div>
      
    );
  }
}

export default App;