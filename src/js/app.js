App = {
  web3Provider: null,
  contracts: {},

  init: async function ()
  {
    return await App.initWeb3();
  },

  initWeb3: async function ()
  {
    // Modern dapp browsers...
    if (window.ethereum)
    {
      App.web3Provider = window.ethereum;
      try
      {
        // Request account access
        await window.ethereum.enable();
      } catch (error)
      {
        // User denied account access...
        console.error("User denied account access")
      }
    }
    // Legacy dapp browsers...
    else if (window.web3)
    {
      App.web3Provider = window.web3.currentProvider;
    }
    // If no injected web3 instance is detected, fall back to Ganache
    else
    {
      App.web3Provider = new Web3.providers.HttpProvider('http://localhost:7545');
    }
    web3 = new Web3(App.web3Provider);

    return App.initContract();
  },

  initContract: function ()
  {
    $.getJSON('Fortune.json', function (data)
    {
      // Get the necessary contract artifact file and instantiate it with truffle-contract
      var FortuneArtifact = data;
      App.contracts.Fortune = TruffleContract(FortuneArtifact);

      // Set the provider for our contract
      App.contracts.Fortune.setProvider(App.web3Provider);

      // Use our contract to retrieve and mark the adopted pets
      return App.markFortune();
    });

    return App.bindEvents();
  },

  bindEvents: function ()
  {
    $(document).on('click', '.btn-fortune', App.handleFortune);
  },

  markFortune: function ()
  {
    var fortuneInstance;

    App.contracts.Fortune.deployed().then(function (instance)
    {
      fortuneInstance = instance;

      return fortuneInstance.getRandom();
    }).then(function (address)
    {
      var hex = address.slice(2, -1);
      let num = parseInt(hex, 16) % 4;
      var result = '';

      switch (num)
      {
        case 0:
          result = '大吉';
          break;
        case 1:
          result = '吉';
          break;
        case 2:
          result = '小吉';
          break;
        case 3:
          result = '大凶';
          break;
        default:
          result = '';
      }

      $('.result').text(`あなたの運勢は ${result} です`);
    }).catch(function (err)
    {
      console.log(err.message);
    });
  },

  handleFortune: function (event)
  {
    event.preventDefault();

    var fortuneInstance;

    web3.eth.getAccounts(function (error, accounts)
    {
      if (error)
      {
        console.log(error);
      }

      var account = accounts[0];

      App.contracts.Fortune.deployed().then(function (instance)
      {
        fortuneInstance = instance;
        var str = web3.sha3((new Date()).getTime().toString());

        // Execute adopt as a transaction by sending account
        return fortuneInstance.rand(str, { from: account });
      }).then(function (result)
      {
        return App.markFortune();
      }).catch(function (err)
      {
        console.log(err.message);
      });
    });
  }
};

$(function ()
{
  $(window).load(function ()
  {
    App.init();
  });
});
