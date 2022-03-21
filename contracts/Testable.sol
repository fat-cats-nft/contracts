//SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./NFTCollectible.sol";

contract Testable is NFTCollectible {
    constructor(string memory baseURI) NFTCollectible(baseURI) {}

    function getTokenIds() public view returns (uint256) {
        return _tokenIds._value;
    }

    function incrementTokenLevel(uint256 _tokenId) public {
        _incrementTokenLevel(_tokenId);
    }

    function mintSingleNFT() public {
        _mintSingleNFT();
    }
}
