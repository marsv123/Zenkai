// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title ContributorNFT
 * @dev NFT collection for dataset contributors - one NFT per contributor
 */
contract ContributorNFT is ERC721, Ownable {
    uint256 private _nextTokenId = 1;
    
    // Mapping to track if an address already has a contributor NFT
    mapping(address => bool) public hasContributorNFT;
    
    // Mapping from address to token ID
    mapping(address => uint256) public contributorTokenId;

    constructor() ERC721("Zenkai Contributor", "ZCON") Ownable(msg.sender) {}

    /**
     * @dev Mint a contributor NFT if the address doesn't already have one
     * @param to Address to mint the NFT to
     * @return tokenId The ID of the minted token
     */
    function mintIfNone(address to) public returns (uint256) {
        require(!hasContributorNFT[to], "Address already has a contributor NFT");
        
        uint256 tokenId = _nextTokenId++;
        _mint(to, tokenId);
        
        hasContributorNFT[to] = true;
        contributorTokenId[to] = tokenId;
        
        return tokenId;
    }

    /**
     * @dev Check if an address has a contributor NFT
     * @param contributor Address to check
     * @return bool True if the address has a contributor NFT
     */
    function isContributor(address contributor) public view returns (bool) {
        return hasContributorNFT[contributor];
    }

    /**
     * @dev Get the contributor's token ID
     * @param contributor Address of the contributor
     * @return tokenId The contributor's token ID (0 if none)
     */
    function getContributorTokenId(address contributor) public view returns (uint256) {
        return contributorTokenId[contributor];
    }
}
