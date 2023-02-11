const express = require('express');
const app = express();
const fa = require("@glif/filecoin-address");
var _ethers = require("ethers");
var w3d = require("@web3yak/web3domain");
require('dotenv').config() //Remove this line if no environment variable is used


const settings = {
  matic_rpc_url: process.env.MATIC_RPC,
  eth_rpc_url: process.env.ETH_RPC
};

let resolve = new w3d.Web3Domain(settings);

/*
const test1 = "0x8d714b10b719c65b878f2ed1436a964e11fa3271";
const test2 = "t410frvyuwefxdhdfxb4pf3iug2uwjyi7umtrjdcf2ka";
const test3 = "t410frvyuwefxdhdfxb4pf3xxxxxxxxxxumtrjdcf2ka";
const test4 = "0x8d714b10b719c65b878f2ed1436a964e11fa327111111";

const f4ContractAddress = fa.newDelegatedEthAddress(test1).toString();
const f4ActorAddress = fa.newActorAddress(test1).toString();
const t4 = fa.delegatedFromEthAddress(test1).toString();
const eth = fa.ethAddressFromDelegated(test2).toString();
let boo = fa.validateAddressString(test2); //Only check t4 address
*/


//console.log(f4ContractAddress);
//console.log(f4ActorAddress);
//console.log(t4);
//console.log(eth);
//console.log(boo);




var intro = "This is live API script which you can host on your node webserver application to get wallet address from the Web3 Domain Name.<hr> Eg. <code>http://....../api/?name=brad.eth&#38;currency=ETH</code> ";

app.get('/', (req, res) => {
  res.send(intro);
});

//Change port number as to your server
app.listen(3000, () => {
  console.log('Server is up on port 3000');
});

app.get("/api", (req, res) => {
  let query = req.query
  console.log(query);


  if ((typeof query.address !== 'undefined')) {

    //Search for ETH address

    if (!_ethers.utils.isAddress(query.address)) {

      let fil = fa.validateAddressString(query.address); //Only check t4 address
      if (fil) {
        //This is FIL address and convert it ot ETH
        const convert_t4=fa.ethAddressFromDelegated(query.address).toString();
       addr_to_domain(convert_t4, res)

      }
      else {
        res.json({ error: 'Invalid address', code: 400 })
      }
    }
    else {
      //ETH address search
      addr_to_domain(query.address, res)
    }

  }
  else {
    if ((typeof query.name !== 'undefined')) {

      if ((typeof query.currency === 'undefined')) {

        domain_to_addr(query.name, 'ETH', res);
      }
      else {

        domain_to_addr(query.name, query.currency, res);
      }

    }
    else {
      res.json({ error: 'Must define [name] & [currency] parameters' })
    }
  }



})

//Domain to Address
function domain_to_addr(name, currency, res) {
  resolve.getAddress(name, currency).then(x => {
    console.log(x);
    if (x == null) {
      res.json({ address: x, code: 404 })
    }
    else {
      res.json({ address: x, code: 200 })
    }
  }).catch(console.error);

}

//Address to Domain

function addr_to_domain(address, res) {

 const convert_t4=fa.delegatedFromEthAddress(address).toString();

  resolve.getDomain(address,"W3D").then(x => {
    //EVM address to Web3Domain Name
    if (x == null || x == '') {

    addr_to_domain_ens(address, res);
    }
    else {
      res.json({ domain: x, code: 200, fvm: convert_t4, eth:address })
    }
  }).catch(console.error);
}

//Address to domain for ENS
function addr_to_domain_ens(address, res) {

  const convert_t4=fa.delegatedFromEthAddress(address).toString();
 
   resolve.getDomain(address,"ENS").then(x => {
    //ENS address to ETH Domain
     if (x == null) {
       res.json({ domain: x, code: 404 })
     }
     else {
       res.json({ domain: x, code: 200, fvm: convert_t4, eth:address })
     }
   }).catch(console.error);
 }