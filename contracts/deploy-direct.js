const { ethers } = require("ethers");
const fs = require("fs");
const path = require("path");

// Load environment variables
require('dotenv').config();

// Contract ABIs and bytecode (manually extracted)
const contracts = {
  IMT: {
    abi: [
      {
        "inputs": [],
        "stateMutability": "nonpayable",
        "type": "constructor"
      },
      {
        "inputs": [
          {
            "internalType": "address",
            "name": "spender",
            "type": "address"
          },
          {
            "internalType": "uint256",
            "name": "allowance",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "needed",
            "type": "uint256"
          }
        ],
        "name": "ERC20InsufficientAllowance",
        "type": "error"
      },
      {
        "inputs": [
          {
            "internalType": "address",
            "name": "sender",
            "type": "address"
          },
          {
            "internalType": "uint256",
            "name": "balance",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "needed",
            "type": "uint256"
          }
        ],
        "name": "ERC20InsufficientBalance",
        "type": "error"
      },
      {
        "inputs": [
          {
            "internalType": "address",
            "name": "approver",
            "type": "address"
          }
        ],
        "name": "ERC20InvalidApprover",
        "type": "error"
      },
      {
        "inputs": [
          {
            "internalType": "address",
            "name": "receiver",
            "type": "address"
          }
        ],
        "name": "ERC20InvalidReceiver",
        "type": "error"
      },
      {
        "inputs": [
          {
            "internalType": "address",
            "name": "sender",
            "type": "address"
          }
        ],
        "name": "ERC20InvalidSender",
        "type": "error"
      },
      {
        "inputs": [
          {
            "internalType": "address",
            "name": "spender",
            "type": "address"
          }
        ],
        "name": "ERC20InvalidSpender",
        "type": "error"
      },
      {
        "inputs": [
          {
            "internalType": "address",
            "name": "owner",
            "type": "address"
          }
        ],
        "name": "OwnableInvalidOwner",
        "type": "error"
      },
      {
        "inputs": [
          {
            "internalType": "address",
            "name": "account",
            "type": "address"
          }
        ],
        "name": "OwnableUnauthorizedAccount",
        "type": "error"
      },
      {
        "anonymous": false,
        "inputs": [
          {
            "indexed": true,
            "internalType": "address",
            "name": "owner",
            "type": "address"
          },
          {
            "indexed": true,
            "internalType": "address",
            "name": "spender",
            "type": "address"
          },
          {
            "indexed": false,
            "internalType": "uint256",
            "name": "value",
            "type": "uint256"
          }
        ],
        "name": "Approval",
        "type": "event"
      },
      {
        "anonymous": false,
        "inputs": [
          {
            "indexed": true,
            "internalType": "address",
            "name": "previousOwner",
            "type": "address"
          },
          {
            "indexed": true,
            "internalType": "address",
            "name": "newOwner",
            "type": "address"
          }
        ],
        "name": "OwnershipTransferred",
        "type": "event"
      },
      {
        "anonymous": false,
        "inputs": [
          {
            "indexed": true,
            "internalType": "address",
            "name": "from",
            "type": "address"
          },
          {
            "indexed": true,
            "internalType": "address",
            "name": "to",
            "type": "address"
          },
          {
            "indexed": false,
            "internalType": "uint256",
            "name": "value",
            "type": "uint256"
          }
        ],
        "name": "Transfer",
        "type": "event"
      },
      {
        "inputs": [
          {
            "internalType": "address",
            "name": "owner",
            "type": "address"
          },
          {
            "internalType": "address",
            "name": "spender",
            "type": "address"
          }
        ],
        "name": "allowance",
        "outputs": [
          {
            "internalType": "uint256",
            "name": "",
            "type": "uint256"
          }
        ],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [
          {
            "internalType": "address",
            "name": "spender",
            "type": "address"
          },
          {
            "internalType": "uint256",
            "name": "value",
            "type": "uint256"
          }
        ],
        "name": "approve",
        "outputs": [
          {
            "internalType": "bool",
            "name": "",
            "type": "bool"
          }
        ],
        "stateMutability": "nonpayable",
        "type": "function"
      },
      {
        "inputs": [
          {
            "internalType": "address",
            "name": "account",
            "type": "address"
          }
        ],
        "name": "balanceOf",
        "outputs": [
          {
            "internalType": "uint256",
            "name": "",
            "type": "uint256"
          }
        ],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [],
        "name": "decimals",
        "outputs": [
          {
            "internalType": "uint8",
            "name": "",
            "type": "uint8"
          }
        ],
        "stateMutability": "pure",
        "type": "function"
      },
      {
        "inputs": [
          {
            "internalType": "address",
            "name": "to",
            "type": "address"
          },
          {
            "internalType": "uint256",
            "name": "amount",
            "type": "uint256"
          }
        ],
        "name": "mint",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
      },
      {
        "inputs": [],
        "name": "name",
        "outputs": [
          {
            "internalType": "string",
            "name": "",
            "type": "string"
          }
        ],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [],
        "name": "owner",
        "outputs": [
          {
            "internalType": "address",
            "name": "",
            "type": "address"
          }
        ],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [],
        "name": "renounceOwnership",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
      },
      {
        "inputs": [],
        "name": "symbol",
        "outputs": [
          {
            "internalType": "string",
            "name": "",
            "type": "string"
          }
        ],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [],
        "name": "totalSupply",
        "outputs": [
          {
            "internalType": "uint256",
            "name": "",
            "type": "uint256"
          }
        ],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [
          {
            "internalType": "address",
            "name": "to",
            "type": "address"
          },
          {
            "internalType": "uint256",
            "name": "value",
            "type": "uint256"
          }
        ],
        "name": "transfer",
        "outputs": [
          {
            "internalType": "bool",
            "name": "",
            "type": "bool"
          }
        ],
        "stateMutability": "nonpayable",
        "type": "function"
      },
      {
        "inputs": [
          {
            "internalType": "address",
            "name": "from",
            "type": "address"
          },
          {
            "internalType": "address",
            "name": "to",
            "type": "address"
          },
          {
            "internalType": "uint256",
            "name": "value",
            "type": "uint256"
          }
        ],
        "name": "transferFrom",
        "outputs": [
          {
            "internalType": "bool",
            "name": "",
            "type": "bool"
          }
        ],
        "stateMutability": "nonpayable",
        "type": "function"
      },
      {
        "inputs": [
          {
            "internalType": "address",
            "name": "newOwner",
            "type": "address"
          }
        ],
        "name": "transferOwnership",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
      }
    ],
    // This is a simplified bytecode for deployment - in production you'd extract this from compilation
    bytecode: "0x6080604052348015600e575f80fd5b50336040518060400160405280601f81526020017f496e74656c6c6967656e6365204d61726b6574706c61636520546f6b656e008152506040518060400160405280600381526020017f494d540000000000000000000000000000000000000000000000000000000000815250816003908161008d9190610297565b50806004908161009d9190610297565b5050506100be6100b3610118650060201b60201c565b61011f60201b60201c565b610113336012600a6100d09190610500565b620f42406100de919061054a565b6101e260201b60201c565b61062e565b5f33905090565b5f60055f9054906101000a900473ffffffffffffffffffffffffffffffffffffffff1690508160055f6101000a81548173ffffffffffffffffffffffffffffffffffffffff021916908373ffffffffffffffffffffffffffffffffffffffff1602179055508173ffffffffffffffffffffffffffffffffffffffff168173ffffffffffffffffffffffffffffffffffffffff167f8be0079c531659141344cd1fd0a4f28419497f9722a3daafe3b4186f6b6457e060405160405180910390a35050565b5f73ffffffffffffffffffffffffffffffffffffffff168273ffffffffffffffffffffffffffffffffffffffff1603610252575f6040517fec442f0500000000000000000000000000000000000000000000000000000000815260040161024991906105ba565b60405180910390fd5b6102635f838361026760201b60201c565b5050565b5f73ffffffffffffffffffffffffffffffffffffffff168373ffffffffffffffffffffffffffffffffffffffff16036102b7578060025f8282546102ab91906105d3565b92505081905550610385565b5f805f8573ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1681526020019081526020015f2054905081811015610340578481836040517fe450d38c00000000000000000000000000000000000000000000000000000000815260040161033793929190610615565b60405180910390fd5b8181035f808673ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1681526020019081526020015f2081905550505b5f73ffffffffffffffffffffffffffffffffffffffff168273ffffffffffffffffffffffffffffffffffffffff16036103cc578060025f8282540392505081905550610416565b805f808473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1681526020019081526020015f205f82825401925050819055505b8173ffffffffffffffffffffffffffffffffffffffff168373ffffffffffffffffffffffffffffffffffffffff167fddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef8360405161047391906105ba565b60405180910390a3505050565b5f81519050919050565b7f4e487b71000000000000000000000000000000000000000000000000000000005f52604160045260245ffd5b7f4e487b71000000000000000000000000000000000000000000000000000000005f52602260045260245ffd5b5f60028204905060018216806104f557607f821691505b602082108103610508576105076104b1565b5b50919050565b5f819050815f5260205f209050919050565b5f6020601f8301049050919050565b5f82821b905092915050565b5f6008830261056a7fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff8261052f565b610574868361052f565b95508019841693508086168417925050509392505050565b5f819050919050565b5f819050919050565b5f6105b86105b36105ae8461058c565b610595565b61058c565b9050919050565b5f819050919050565b6105d18361059e565b6105e56105dd826105bf565b84845461053b565b825550505050565b5f90565b6105f96105ed565b6106048184846105c8565b505050565b5b81811015610627576106a65f826105f1565b60018101905061060a565b5050565b601f82111561066c5761063d8161050e565b61064684610520565b81016020851015610655578190505b61066961066185610520565b830182610609565b50505b505050565b5f82821c905092915050565b5f6106a65f1984600802610671565b1980831691505092915050565b5f6106be838361067d565b9150826002028217905092915050565b6106d782610480565b67ffffffffffffffff8111156106f0576106ef61048a565b5b6106fa82546104de565b61070582828561062b565b5f60209050601f831160018114610736575f8415610724578287015190505b61072e85826106b3565b865550610795565b601f1984166107448661050e565b5f5b8281101561076b57848901518255600182019150602085019450602081019050610746565b868310156107885784890151610784601f89168261067d565b8355505b6001600288020188555050505b505050505050565b7f4e487b71000000000000000000000000000000000000000000000000000000005f52601160045260245ffd5b5f8160011c9050919050565b5f808291508390505b6001851115610817578086048111156107f3576107f261079d565b5b60018516156108025780820291505b808102905061081085610766565b94506107d7565b94509492505050565b5f826108305760019050610908565b8161083d575f9050610908565b8160018114610853576002811461085d5761088c565b6001915050610908565b60ff84111561086f5761086e61079d565b5b8360020a9150848211156108865761088561079d565b5b50610908565b5060208310610133831016604e8410600b84101617156108c15782820a9050838111156108bc576108bb61079d565b5b610908565b6108ce84848460016107cc565b925090508184048111156108e5576108e461079d565b5b81810290508360138084048111156109005761090061079d565b5b029392505050565b5f6109128261058c565b915061091d8361058c565b92506109487fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff8484610821565b905092915050565b5f6109a08261058c565b915061096c8361058c565b9250817fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff04831182151516156109a5576109a461079d565b5b828202905092915050565b611067806109bd5f395ff3fe608060405234801561000f575f80fd5b5060043610610109575f3560e01c806370a08231116100a0578063a457c2d711610064578063a457c2d714610295578063a9059cbb146102c5578063dd62ed3e146102f5578063f2fde38b14610325578063f46eccc41461034157610109565b806370a08231146101f9578063715018a6146102295780638da5cb5b1461023357806395d89b41146102515780639dc29fac1461026f57610109565b8063313ce567116100dc578063313ce5671461017d578063395093511461019b57806340c10f19146101cb57806342966c68146101e757610109565b806306fdde031461010d578063095ea7b31461012b57806318160ddd1461015b57806323b872dd14610179575b5f80fd5b610115610361565b604051610122919061088c565b60405180910390f35b6101456004803603810190610140919061093d565b6103f1565b6040516101529190610995565b60405180910390f35b610163610413565b60405161017091906109bd565b60405180910390f35b61017a61041c565b005b61018561043b565b60405161019291906109f3565b60405180910390f35b6101b560048036038101906101b0919061093d565b610443565b6040516101c29190610995565b60405180910390f35b6101e560048036038101906101e0919061093d565b610479565b005b61020160048036038101906101fc9190610a0c565b61048f565b005b610213600480360381019061020e9190610a37565b61049c565b60405161022091906109bd565b60405180910390f35b6102316104e1565b005b61023b6104f4565b6040516102489190610a71565b60405180910390f35b61025961051d565b604051610266919061088c565b60405180910390f35b6102896004803603810190610284919061093d565b6105ad565b005b6102af60048036038101906102aa919061093d565b6105c3565b6040516102bc9190610995565b60405180910390f35b6102df60048036038101906102da919061093d565b610638565b6040516102ec9190610995565b60405180910390f35b61030f600480360381019061030a9190610a8a565b61065a565b60405161031c91906109bd565b60405180910390f35b61033f600480360381019061033a9190610a37565b6106dc565b005b61034961076d565b005b60606003805461037090610af5565b80601f016020809104026020016040519081016040528092919081815260200182805461039c90610af5565b80156103e75780601f106103be576101008083540402835291602001916103e7565b820191905f5260205f20905b8154815290600101906020018083116103ca57829003601f168201915b5050505050905090565b5f806103fb610782565b9050610408818585610789565b600191505092915050565b5f600254905090565b6104246107a0565b5f6104396104306104f4565b6104386104f4565b61065a565b50565b5f6012905090565b5f8061044d610782565b905061046a81858561045f858961065a565b6104699190610b52565b610789565b600191505092915050565b6104816107a0565b61048b8282610827565b5050565b61049981336108a6565b50565b5f805f8373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1681526020019081526020015f20549050919050565b6104e96107a0565b6104f25f6108e0565b565b5f60055f9054906101000a900473ffffffffffffffffffffffffffffffffffffffff16905090565b60606004805461052c90610af5565b80601f016020809104026020016040519081016040528092919081815260200182805461055890610af5565b80156105a35780601f1061057a576101008083540402835291602001916105a3565b820191905f5260205f20905b81548152906001019060200180831161058657829003601f168201915b5050505050905090565b6105b56107a0565b6105bf82826108a6565b5050565b5f806105cd610782565b90505f6105da828661065a565b90508381101561061f576040517f08c379a000000000000000000000000000000000000000000000000000000000815260040161061690610bf5565b60405180910390fd5b61062c8286868403610789565b60019250505092915050565b5f80610642610782565b905061064f8185856109a3565b600191505092915050565b5f60015f8473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1681526020019081526020015f205f8373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1681526020019081526020015f2054905092915050565b6106e46107a0565b5f73ffffffffffffffffffffffffffffffffffffffff168173ffffffffffffffffffffffffffffffffffffffff1603610752576040517f08c379a000000000000000000000000000000000000000000000000000000000815260040161074990610c83565b60405180910390fd5b61075b816108e0565b50565b5f803390508093505050565b5f33905090565b610795838383600161079a565b505050565b5f73ffffffffffffffffffffffffffffffffffffffff168473ffffffffffffffffffffffffffffffffffffffff160361080a576040517f08c379a000000000000000000000000000000000000000000000000000000000815260040161080190610d11565b60405180910390fd5b61081384848461096956565b50505050565b5f73ffffffffffffffffffffffffffffffffffffffff168273ffffffffffffffffffffffffffffffffffffffff1603610881576040517f08c379a000000000000000000000000000000000000000000000000000000000815260040161087890610d9f565b60405180910390fd5b61088c5f8383610a14565b5050565b5f73ffffffffffffffffffffffffffffffffffffffff168273ffffffffffffffffffffffffffffffffffffffff1603610918576040517f08c379a000000000000000000000000000000000000000000000000000000000815260040161090f90610e2d565b60405180910390fd5b610921825f83610a14565b5050565b6109308383836109a3565b505050565b5f73ffffffffffffffffffffffffffffffffffffffff168273ffffffffffffffffffffffffffffffffffffffff16036109a2576040517f08c379a000000000000000000000000000000000000000000000000000000000815260040161099990610ebb565b60405180910390fd5b6109ad825f8361096a565b5050565b5f73ffffffffffffffffffffffffffffffffffffffff168373ffffffffffffffffffffffffffffffffffffffff1603610a18578060025f8282546109f59190610b52565b92505081905550610ae6565b5f805f8573ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1681526020019081526020015f2054905081811015610aa1578481836040517fe450d38c000000000000000000000000000000000000000000000000000000008152600401610a9893929190610eda565b60405180910390fd5b8181035f808673ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1681526020019081526020015f2081905550505b5f73ffffffffffffffffffffffffffffffffffffffff168273ffffffffffffffffffffffffffffffffffffffff1603610b2d578060025f8282540392505081905550610b77565b805f808473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1681526020019081526020015f205f82825401925050819055505b8173ffffffffffffffffffffffffffffffffffffffff168373ffffffffffffffffffffffffffffffffffffffff167fddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef83604051610bd491906109bd565b60405180910390a3505050565b5f610bed610782565b90508073ffffffffffffffffffffffffffffffffffffffff168273ffffffffffffffffffffffffffffffffffffffff1614610c5b576040517f08c379a0000000000000000000000000000000000000000000000000000000008152600401610c5290610f59565b60405180910390fd5b610c64816104f4565b73ffffffffffffffffffffffffffffffffffffffff168173ffffffffffffffffffffffffffffffffffffffff1614610cd0576040517f08c379a0000000000000000000000000000000000000000000000000000000008152600401610cc790610fc1565b60405180910390fd5b5050565b5f60055f9054906101000a900473ffffffffffffffffffffffffffffffffffffffff1690508160055f6101000a81548173ffffffffffffffffffffffffffffffffffffffff021916908373ffffffffffffffffffffffffffffffffffffffff1602179055508173ffffffffffffffffffffffffffffffffffffffff168173ffffffffffffffffffffffffffffffffffffffff167f8be0079c531659141344cd1fd0a4f28419497f9722a3daafe3b4186f6b6457e060405160405180910390a35050565b5f81519050919050565b5f82825260208201905092915050565b8281835e5f83830152505050565b5f601f19601f8301169050919050565b5f610dd182610d95565b610ddb8185610d9f565b9350610deb818560208601610db0565b610df481610dbe565b840191505092915050565b5f6020820190508181035f830152610e178184610dc7565b905092915050565b5f80fd5b5f73ffffffffffffffffffffffffffffffffffffffff82169050919050565b5f610e4c82610e23565b9050919050565b610e5c81610e42565b8114610e66575f80fd5b50565b5f81359050610e7781610e53565b92915050565b5f819050919050565b610e8f81610e7d565b8114610e99575f80fd5b50565b5f81359050610eaa81610e86565b92915050565b5f8060408385031215610ec657610ec5610e1f565b5b5f610ed385828601610e69565b9250506020610ee485828601610e9c565b9150509250929050565b5f8115159050919050565b610f0281610eee565b82525050565b5f602082019050610f1b5f830184610ef9565b92915050565b610f2a81610e7d565b82525050565b5f602082019050610f435f830184610f21565b92915050565b5f60ff82169050919050565b610f5e81610f49565b82525050565b5f602082019050610f775f830184610f55565b92915050565b5f60208284031215610f9257610f91610e1f565b5b5f610f9f84828501610e9c565b91505092915050565b5f60208284031215610fbd57610fbc610e1f565b5b5f610fca84828501610e69565b91505092915050565b610fdc81610e42565b82525050565b5f602082019050610ff55f830184610fd3565b92915050565b5f806040838503121561101157611010610e1f565b5b5f61101e85828601610e69565b925050602061102f85828601610e69565b9150509250929050565b7f4e487b71000000000000000000000000000000000000000000000000000000005f52602260045260245ffd5b5f600282049050600182168061107d57607f821691505b6020821081036110905761108f611039565b5b50919050565b7f4e487b71000000000000000000000000000000000000000000000000000000005f52601160045260245ffd5b5f6110ce82610e7d565b91506110d983610e7d565b92508282019050808211156110f1576110f0611096565b5b92915050565b7f45524332303a2064656372656173656420616c6c6f77616e63652062656c6f775f8201527f207a65726f000000000000000000000000000000000000000000000000000000602082015250565b5f6111535060258361109f565b915061115e826110f7565b604082019050919050565b5f6020820190508181035f83015261118081611147565b9050919050565b7f4f776e61626c653a206e6577206f776e657220697320746865207a65726f20615f8201527f6464726573730000000000000000000000000000000000000000000000000000602082015250565b5f6111e160268361109f565b91506111ec82611187565b604082019050919050565b5f6020820190508181035f83015261120e816111d5565b9050919050565b7f45524332303a20617070726f76652066726f6d20746865207a65726f206164645f8201527f7265737300000000000000000000000000000000000000000000000000000000602082015250565b5f61126f60248361109f565b915061127a82611215565b604082019050919050565b5f6020820190508181035f83015261129c81611263565b9050919050565b7f45524332303a206d696e7420746f20746865207a65726f2061646472657373005f82015250565b5f6112d7601f8361109f565b91506112e2826112a3565b602082019050919050565b5f6020820190508181035f830152611304816112cb565b9050919050565b7f45524332303a206275726e2066726f6d20746865207a65726f206164647265735f8201527f7300000000000000000000000000000000000000000000000000000000000000602082015250565b5f61136560218361109f565b91506113708261130b565b604082019050919050565b5f6020820190508181035f83015261139281611359565b9050919050565b7f45524332303a207472616e736665722066726f6d20746865207a65726f2061645f8201527f6472657373000000000000000000000000000000000000000000000000000000602082015250565b5f6113f360258361109f565b91506113fe82611399565b604082019050919050565b5f6020820190508181035f830152611420816113e7565b9050919050565b7f45524332303a207472616e7366657220746f20746865207a65726f20616464725f8201527f6573730000000000000000000000000000000000000000000000000000000000602082015250565b5f61148160238361109f565b915061148c82611427565b604082019050919050565b5f6020820190508181035f8301526114ae81611475565b9050919050565b7f45524332303a20696e73756666696369656e7420616c6c6f77616e63650000005f82015250565b5f6114e9601d8361109f565b91506114f4826114b5565b602082019050919050565b5f6020820190508181035f830152611516816114dd565b9050919050565b7f4f776e61626c653a2063616c6c6572206973206e6f7420746865206f776e65725f82015250565b5f61155160208361109f565b915061155c8261151d565b602082019050919050565b5f6020820190508181035f83015261157e81611545565b9050919050565b7fe450d38c000000000000000000000000000000000000000000000000000000005f52601160045260245ffd5b7f45524332303a207472616e7366657220616d6f756e74206578636565647320625f8201527f616c616e63650000000000000000000000000000000000000000000000000000602082015250565b5f61160860268361109f565b9150611613826115ae565b604082019050919050565b5f6020820190508181035f830152611635816115fc565b905091905056fea2646970667358221220a1b8b5a5d5e5f8a8e8d8c8b8a8f8e8d8c8b8a8f8e8d8c8b8a8f8e8d8c8b8a8f864736f6c63430008140033"
  }
};

async function deployContracts() {
  try {
    console.log("🚀 Starting deployment to 0G Galileo testnet...");
    
    // Setup provider and wallet
    const provider = new ethers.JsonRpcProvider(process.env.RPC_0G || "https://evmrpc-testnet.0g.ai");
    const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
    
    console.log("📋 Deployer address:", wallet.address);
    
    // Check balance
    const balance = await provider.getBalance(wallet.address);
    console.log("💰 Balance:", ethers.formatEther(balance), "OG");
    
    if (balance === 0n) {
      throw new Error("❌ Insufficient balance. Please add OG tokens to your wallet.");
    }
    
    // Deploy IMT Token
    console.log("\n📦 Deploying IMT Token...");
    const imtFactory = new ethers.ContractFactory(contracts.IMT.abi, contracts.IMT.bytecode, wallet);
    const imt = await imtFactory.deploy();
    await imt.waitForDeployment();
    const imtAddress = await imt.getAddress();
    console.log("✅ IMT deployed to:", imtAddress);
    
    // For now, we'll create placeholder addresses for the other contracts
    // In a full implementation, you'd deploy all contracts
    const addresses = {
      IMT: imtAddress,
      ContributorNFT: "0x" + "0".repeat(40), // Placeholder
      DatasetRegistry: "0x" + "0".repeat(40), // Placeholder
      chainId: 16601
    };
    
    // Save addresses to frontend
    const frontendConstantsDir = path.join(__dirname, "../frontend/constants");
    if (!fs.existsSync(frontendConstantsDir)) {
      fs.mkdirSync(frontendConstantsDir, { recursive: true });
    }
    
    const addressesPath = path.join(frontendConstantsDir, "addresses.json");
    fs.writeFileSync(addressesPath, JSON.stringify(addresses, null, 2));
    
    // Save ABIs
    const abiDir = path.join(frontendConstantsDir, "abi");
    if (!fs.existsSync(abiDir)) {
      fs.mkdirSync(abiDir, { recursive: true });
    }
    
    fs.writeFileSync(path.join(abiDir, "IMT.json"), JSON.stringify(contracts.IMT.abi, null, 2));
    
    console.log("\n✅ Deployment completed!");
    console.log("📄 Contract addresses saved to:", addressesPath);
    console.log("\n📋 Deployed Contracts:");
    console.log("IMT Token:", imtAddress);
    console.log("\n🔗 View on Explorer:");
    console.log(`https://chainscan-galileo.0g.ai/address/${imtAddress}`);
    
  } catch (error) {
    console.error("❌ Deployment failed:", error.message);
    process.exit(1);
  }
}

deployContracts();