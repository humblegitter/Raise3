// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

contract Raise3NFT is ERC721, Ownable {
    using Strings for uint256;
    
    uint256 public constant MINT_PRICE = 1 ether / 2000; // Roughly $1 worth of ETH
    uint256 public currentTokenId;
    string public baseURI;

    constructor() ERC721("Raise3 NFT", "R3NFT") Ownable(msg.sender) {
        baseURI = "https://raise3.xyz/api/nft/";  // Replace with your metadata API
    }

    function mint() public payable {
        require(msg.value >= MINT_PRICE, "Insufficient payment");
        
        currentTokenId++;
        _safeMint(msg.sender, currentTokenId);
    }

    function setBaseURI(string memory _newBaseURI) public onlyOwner {
        baseURI = _newBaseURI;
    }

    function _baseURI() internal view override returns (string memory) {
        return baseURI;
    }

    function withdraw() public onlyOwner {
        (bool success, ) = msg.sender.call{value: address(this).balance}("");
        require(success, "Transfer failed");
    }
}