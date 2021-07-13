const express = require('express');
const axios = require('axios').default;
const bodyParser = require('body-parser');
const path = require('path');
const TronWeb = require("tronweb");
const TronGrid = require("trongrid");
const walletAddressValidator = require("multicoin-address-validator").validate;
const momentJalaali = require('moment-jalaali');
momentJalaali.loadPersian({ usePersianDigits: true });

const HttpProvider = TronWeb.providers.HttpProvider;
const fullNode = new HttpProvider("https://api.trongrid.io");
const solidityNode = new HttpProvider("https://api.trongrid.io");
const eventServer = new HttpProvider("https://api.trongrid.io");

const app = express();

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "./views"));

app.use(express.static(path.join(__dirname, "./public")));
app.use(bodyParser.json());
app.use(express.urlencoded({ extended: true }));

app.get('/', (req, res) => {
  return res.render('index');
});

app.post('/getData', async (req, res) => {
  const { walletAddress } = req.body;

  if(! walletAddress)
    return res.status(400).send('No Wallet address.');

  if(! walletAddressValidator(walletAddress, 'trx'))
    return res.status(400).send('Invalid Wallet address.');

  const { data: usdtTransactions } = await axios.get(`
    https://api.trongrid.io/v1/accounts/${walletAddress}/transactions/trc20?limit=200&contract_address=TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t`
  );

  const { data: allTransactions } = await axios.get(`
    https://api.trongrid.io/v1/accounts/${walletAddress}/transactions?limit=200`
  );

  let convertedTransactions = [];
  allTransactions.data.forEach(item => {
    const transData = item.raw_data.contract[0].parameter.value;

    if(item.raw_data.contract[0].type === 'TransferContract') {
      item['date'] = `${momentJalaali(item['block_timestamp']).format('jYYYY/jMM/jDD')} (${momentJalaali(item['block_timestamp']).fromNow()})`;
      item['from'] = TronWeb.address.fromHex(transData.owner_address);
      item['to'] = TronWeb.address.fromHex(transData.to_address);
  
      convertedTransactions.push(item);
    }
  });

  usdtTransactions.data.forEach(item => {
    item['date'] = `${momentJalaali(item['block_timestamp']).format('jYYYY/jMM/jDD')} (${momentJalaali(item['block_timestamp']).fromNow()})`;
    convertedTransactions.push(item);
  });

  return res.status(200).send(convertedTransactions);
});

app.listen(process.env.PORT || 5000, () => {
  console.log('Listening ...');
})