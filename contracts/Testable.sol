//SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./NFTCollectible.sol";

contract Testable is NFTCollectible {
    Counters.Counter public tokenIds;

    constructor(string memory baseURI) NFTCollectible(baseURI) {
        tokenIds = _tokenIds;
    }

    function mintSingleNFT() public {
        _mintSingleNFT();
    }

    function incrementTokenLevel(uint256 _tokenId) public {
        _incrementTokenLevel(_tokenId);
    }
}
