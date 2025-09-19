// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * ZenkaiINFT — "INFT-style" ERC-721 with dynamic, linked AI asset metadata.
 * - ERC721 + ERC2981 (royalties)
 * - Updatable URIs (dataset/model/encryptedMeta)
 * - Reputation score + ZK flag
 * - Owner/Editor roles for controlled updates
 */

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/token/common/ERC2981.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

contract ZenkaiINFT is ERC721URIStorage, ERC2981, AccessControl, Pausable {
    using Counters for Counters.Counter;
    Counters.Counter private _ids;

    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");
    bytes32 public constant EDITOR_ROLE = keccak256("EDITOR_ROLE");

    struct Asset {
        string datasetURI;        // og://... or ipfs://...
        string modelURI;          // og://... or ipfs://...
        string encryptedMetaURI;  // og://... or ipfs://...
        uint32 reputation;        // 0..1e9
        bool   zkProtected;
    }

    mapping(uint256 => Asset) public assets;

    event Minted(uint256 indexed tokenId, address indexed to, string datasetURI, string modelURI);
    event AssetUpdated(uint256 indexed tokenId, string datasetURI, string modelURI, string encryptedMetaURI, bool zkProtected);
    event ReputationUpdated(uint256 indexed tokenId, uint32 reputation);

    constructor(
        string memory name_,
        string memory symbol_,
        address admin,
        address royaltyReceiver,
        uint96 royaltyBps // e.g., 500 = 5%
    ) ERC721(name_, symbol_) {
        _grantRole(DEFAULT_ADMIN_ROLE, admin);
        _grantRole(MINTER_ROLE, admin);
        _grantRole(EDITOR_ROLE, admin);
        _setDefaultRoyalty(royaltyReceiver, royaltyBps);
    }

    function pause() external onlyRole(DEFAULT_ADMIN_ROLE) { _pause(); }
    function unpause() external onlyRole(DEFAULT_ADMIN_ROLE) { _unpause(); }

    function mint(
        address to,
        string calldata tokenURI_,
        string calldata datasetURI_,
        string calldata modelURI_,
        string calldata encryptedMetaURI_,
        bool zkProtected_
    ) external onlyRole(MINTER_ROLE) whenNotPaused returns (uint256) {
        _ids.increment();
        uint256 tokenId = _ids.current();
        _safeMint(to, tokenId);
        _setTokenURI(tokenId, tokenURI_);
        assets[tokenId] = Asset({
            datasetURI: datasetURI_,
            modelURI: modelURI_,
            encryptedMetaURI: encryptedMetaURI_,
            reputation: 0,
            zkProtected: zkProtected_
        });
        emit Minted(tokenId, to, datasetURI_, modelURI_);
        return tokenId;
    }

    function updateAssetURIs(
        uint256 tokenId,
        string calldata datasetURI_,
        string calldata modelURI_,
        string calldata encryptedMetaURI_,
        bool zkProtected_
    ) external whenNotPaused {
        require(_isApprovedOrOwner(_msgSender(), tokenId) || hasRole(EDITOR_ROLE, _msgSender()), "Not authorized");
        Asset storage a = assets[tokenId];
        a.datasetURI = datasetURI_;
        a.modelURI = modelURI_;
        a.encryptedMetaURI = encryptedMetaURI_;
        a.zkProtected = zkProtected_;
        emit AssetUpdated(tokenId, datasetURI_, modelURI_, encryptedMetaURI_, zkProtected_);
    }

    function setTokenURI(uint256 tokenId, string calldata newURI) external whenNotPaused {
        require(_isApprovedOrOwner(_msgSender(), tokenId) || hasRole(EDITOR_ROLE, _msgSender()), "Not authorized");
        _setTokenURI(tokenId, newURI);
    }

    function setReputation(uint256 tokenId, uint32 reputation_) external whenNotPaused onlyRole(EDITOR_ROLE) {
        assets[tokenId].reputation = reputation_;
        emit ReputationUpdated(tokenId, reputation_);
    }

    function setDefaultRoyalty(address receiver, uint96 feeNumerator) external onlyRole(DEFAULT_ADMIN_ROLE) {
        _setDefaultRoyalty(receiver, feeNumerator);
    }

    function supportsInterface(bytes4 interfaceId)
        public view override(ERC721, ERC2981, AccessControl)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }

    function _beforeTokenTransfer(address from, address to, uint256 tokenId, uint256 batchSize)
        internal override whenNotPaused
    {
        super._beforeTokenTransfer(from, to, tokenId, batchSize);
    }
}