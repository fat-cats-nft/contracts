//SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import "./NFTCollectible.sol";

contract Feeding is Ownable {
    // Mapping from tokenId to calories consumed
    mapping(uint256 => uint256) public calories;
    // Mapping of level to calories requirements
    mapping(uint8 => uint256) public calorieRequirements;

    // Setter for calorie requirements for a given level
    function setCalorieRequirementsForLevel(
        uint8 _level,
        uint256 _calorieRequirements
    ) public onlyOwner {
        calorieRequirements[_level] = _calorieRequirements;
    }

    // Feed NFT food tokens
    function feed(uint256 _tokenId) public payable {
        require(msg.value >= 0.1 ether);
        calories[_tokenId] += msg.value;
    }

    // Upgrade NFT
    function upgrade(uint256 _tokenId) public {
        // uint256 _currentLevel = levels[_tokenId];
        // uint256 _calorieRequirements = 10**(_currentLevel - 1) * 10**18;
        // uint256 _consumedCalories = calories[_tokenId];
        // require(
        //     _consumedCalories >= _calorieRequirements,
        //     "Insufficient calories to upgrade NFT. You need to feed your cat more!"
        // );
        // _incrementTokenLevel(_tokenId);
        // calories[_tokenId] -= _calorieRequirements;
    }
}
