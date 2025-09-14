// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title DatasetRegistry
 * @dev Core marketplace contract for dataset registration and trading
 */
contract DatasetRegistry is Ownable, ReentrancyGuard {
    struct Dataset {
        address owner;
        string uri;          // IPFS URI
        uint256 price;       // Price in ZAI tokens
        uint256 score;       // Quality score (0-100)
        bool active;         // Whether the dataset is active for sale
        uint256 totalSales;  // Total number of sales
    }

    IERC20 public immutable zaiToken;
    address public treasury;
    uint256 public constant FEE_PERCENTAGE = 4; // 4% fee
    uint256 public constant SCORE_DECIMALS = 100; // Score out of 100
    
    uint256 private _nextDatasetId = 1;
    
    // Mapping from dataset ID to Dataset
    mapping(uint256 => Dataset) public datasets;
    
    // Mapping from buyer to dataset ID to access status
    mapping(address => mapping(uint256 => bool)) public hasAccess;
    
    // Events
    event Registered(
        uint256 indexed datasetId,
        address indexed owner,
        string uri,
        uint256 price
    );
    
    event AccessGranted(
        uint256 indexed datasetId,
        address indexed buyer,
        address indexed owner,
        uint256 price
    );
    
    event DatasetUpdated(
        uint256 indexed datasetId,
        uint256 newPrice,
        bool active
    );

    constructor(address _zaiToken, address _treasury) Ownable(msg.sender) {
        zaiToken = IERC20(_zaiToken);
        treasury = _treasury;
    }

    /**
     * @dev Register a new dataset
     * @param uri IPFS URI of the dataset
     * @param price Price in ZAI tokens
     * @return datasetId The ID of the registered dataset
     */
    function register(string memory uri, uint256 price) 
        public 
        returns (uint256 datasetId) 
    {
        require(bytes(uri).length > 0, "URI cannot be empty");
        require(price > 0, "Price must be greater than 0");
        
        datasetId = _nextDatasetId++;
        
        datasets[datasetId] = Dataset({
            owner: msg.sender,
            uri: uri,
            price: price,
            score: 50, // Default score
            active: true,
            totalSales: 0
        });
        
        emit Registered(datasetId, msg.sender, uri, price);
    }

    /**
     * @dev Purchase access to a dataset
     * @param datasetId ID of the dataset to purchase
     */
    function buy(uint256 datasetId) public nonReentrant {
        Dataset storage dataset = datasets[datasetId];
        
        require(dataset.owner != address(0), "Dataset does not exist");
        require(dataset.active, "Dataset is not active");
        require(dataset.owner != msg.sender, "Cannot buy your own dataset");
        require(!hasAccess[msg.sender][datasetId], "Already has access");
        
        uint256 price = dataset.price;
        uint256 fee = (price * FEE_PERCENTAGE) / 100;
        uint256 ownerAmount = price - fee;
        
        // Transfer tokens
        require(
            zaiToken.transferFrom(msg.sender, dataset.owner, ownerAmount),
            "Transfer to owner failed"
        );
        require(
            zaiToken.transferFrom(msg.sender, treasury, fee),
            "Transfer to treasury failed"
        );
        
        // Grant access
        hasAccess[msg.sender][datasetId] = true;
        dataset.totalSales++;
        
        emit AccessGranted(datasetId, msg.sender, dataset.owner, price);
    }

    /**
     * @dev Update dataset price and status (only owner)
     * @param datasetId ID of the dataset to update
     * @param newPrice New price in ZAI tokens
     * @param active Whether the dataset should be active
     */
    function updateDataset(
        uint256 datasetId, 
        uint256 newPrice, 
        bool active
    ) public {
        Dataset storage dataset = datasets[datasetId];
        require(dataset.owner == msg.sender, "Only owner can update");
        require(newPrice > 0, "Price must be greater than 0");
        
        dataset.price = newPrice;
        dataset.active = active;
        
        emit DatasetUpdated(datasetId, newPrice, active);
    }

    /**
     * @dev Update dataset score (only owner of contract)
     * @param datasetId ID of the dataset
     * @param score New score (0-100)
     */
    function updateScore(uint256 datasetId, uint256 score) public onlyOwner {
        require(score <= SCORE_DECIMALS, "Score cannot exceed maximum");
        datasets[datasetId].score = score;
    }

    /**
     * @dev Get dataset count
     * @return count Total number of datasets
     */
    function getDatasetCount() public view returns (uint256) {
        return _nextDatasetId - 1;
    }

    /**
     * @dev Get dataset by ID
     * @param datasetId ID of the dataset
     * @return Dataset struct
     */
    function getDataset(uint256 datasetId) public view returns (Dataset memory) {
        return datasets[datasetId];
    }

    /**
     * @dev Check if buyer has access to dataset
     * @param buyer Address of the buyer
     * @param datasetId ID of the dataset
     * @return bool True if buyer has access
     */
    function checkAccess(address buyer, uint256 datasetId) public view returns (bool) {
        return hasAccess[buyer][datasetId] || datasets[datasetId].owner == buyer;
    }

    /**
     * @dev Update treasury address (only owner)
     * @param newTreasury New treasury address
     */
    function updateTreasury(address newTreasury) public onlyOwner {
        require(newTreasury != address(0), "Invalid treasury address");
        treasury = newTreasury;
    }
}
