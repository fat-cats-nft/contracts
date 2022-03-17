//SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "hardhat/console.sol";

contract NFTCollectible is ERC721Enumerable, Ownable {
    using SafeMath for uint256;
    using Counters for Counters.Counter;

    Counters.Counter private _tokenIds;
    string public baseTokenURI;

    uint256 public constant MAX_SUPPLY = 1000;
    uint256 public constant PRICE = 0.01 ether;
    uint256 public constant MAX_PER_MINT = 3;
    // Mapping from tokenId to fatness level
    mapping(uint256 => uint8) public levels;
    // Mapping from tokenId to calories fed
    mapping(uint256 => uint256) public calories;

    constructor(string memory baseURI) ERC721("Fat Cats NFT", "FCNFT") {
        setBaseURI(baseURI);
    }

    function setBaseURI(string memory _baseTokenURI) public onlyOwner {
        baseTokenURI = _baseTokenURI;
    }

    function _baseURI() internal view virtual override returns (string memory) {
        return baseTokenURI;
    }

    function tokenURI(uint256 tokenId)
        public
        view
        virtual
        override
        returns (string memory)
    {
        require(
            _exists(tokenId),
            "ERC721Metadata: URI query for nonexistent token"
        );

        string memory baseURI = _baseURI();
        string memory uri = string(
            abi.encodePacked(
                baseURI,
                Strings.toString(tokenId),
                "/",
                Strings.toString(levels[tokenId])
            )
        );
        return bytes(baseURI).length > 0 ? uri : "";
    }

    // Feed NFT food tokens
    function feed(uint256 _tokenId) public payable {
        calories[_tokenId] += msg.value;
    }

    // Upgrade token to the next level
    function _incrementTokenLevel(uint256 _tokenId) public {
        levels[_tokenId]++;
    }

    function reserveNFTs() public onlyOwner {
        uint256 totalMinted = _tokenIds.current();
        uint256 _tokensToMint = 10;

        require(totalMinted.add(_tokensToMint) < MAX_SUPPLY, "Not enough NFTs");

        for (uint256 i = 0; i < _tokensToMint; i++) {
            _mintSingleNFT();
        }
    }

    function mintNFTs(uint256 _count) public payable {
        uint256 totalMinted = _tokenIds.current();

        require(totalMinted.add(_count) <= MAX_SUPPLY, "Not enough NFTs!");

        require(
            _count > 0 && _count <= MAX_PER_MINT,
            "Cannot mint specified number of NFTs."
        );

        require(
            msg.value >= PRICE.mul(_count),
            "Not enough ether to purchase NFTs."
        );

        for (uint256 i = 0; i < _count; i++) {
            _mintSingleNFT();
        }
    }

    function _mintSingleNFT() private {
        uint256 newTokenID = _tokenIds.current();
        _safeMint(msg.sender, newTokenID);
        _incrementTokenLevel(newTokenID);
        _tokenIds.increment();
    }

    function tokensOfOwner(address _owner)
        external
        view
        returns (uint256[] memory)
    {
        uint256 tokenCount = balanceOf(_owner);
        uint256[] memory tokensId = new uint256[](tokenCount);

        for (uint256 i = 0; i < tokenCount; i++) {
            tokensId[i] = tokenOfOwnerByIndex(_owner, i);
        }

        return tokensId;
    }

    function withdraw() public payable onlyOwner {
        uint256 balance = address(this).balance;
        require(balance > 0, "No ether left to withdraw");

        (bool success, ) = (msg.sender).call{value: balance}("");
        require(success, "Transfer failed.");
    }
}
