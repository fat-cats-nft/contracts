const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("NFT Collectible", function () {
    const initialBaseTokenURI = "Initial Base Token URI"

    it("Should deploy the NFT contract with the correct parameters", async function () {
        // Deploy the contract
        const Factory = await ethers.getContractFactory("NFTCollectible");
        const contract = await Factory.deploy(initialBaseTokenURI);
        await contract.deployed();

        // Check that contract parameters are correct
        expect(await contract.baseTokenURI()).to.equal(initialBaseTokenURI);
        expect(await contract.MAX_LEVEL()).to.equal(4);
        expect(await contract.MAX_PER_MINT()).to.equal(3);
        expect(await contract.MAX_SUPPLY()).to.equal(1000);
        expect(await contract.totalSupply()).to.equal(0);
        expect(await contract.PRICE()).to.equal(ethers.BigNumber.from("10000000000000000"));
        expect(await contract.levels(0)).to.equal(0);
        expect(await contract.calories(0)).to.equal(ethers.BigNumber.from("0"));
    });

    it("Should properly update the base token uri", async function () {
        // Deploy the contract
        const Factory = await ethers.getContractFactory("NFTCollectible");
        const contract = await Factory.deploy(initialBaseTokenURI);
        await contract.deployed();

        const updatedBaseTokenURI = "Updated Base Token URI"
        // Check that initial base token URI is correct
        expect(await contract.baseTokenURI()).to.equal(initialBaseTokenURI);
        // Update base token URI
        const setBaseURITxn = await contract.setBaseURI(updatedBaseTokenURI)
        await setBaseURITxn.wait();
        // Check that base token URI was updated properly
        expect(await contract.baseTokenURI()).to.equal(updatedBaseTokenURI);
    });

    it("Should properly update the max token level", async function () {
        // Deploy the contract
        const Factory = await ethers.getContractFactory("NFTCollectible");
        const contract = await Factory.deploy(initialBaseTokenURI);
        await contract.deployed();

        // get current MAX_LEVEL
        const MAX_LEVEL = await contract.MAX_LEVEL();
        const NEW_MAX_LEVEL = MAX_LEVEL + 1;

        // Reset max token level
        const setMaxLevelTxn = await contract.setMaxLevel(NEW_MAX_LEVEL);
        await setMaxLevelTxn.wait();
        // Check that new max token level updated
        expect(await contract.MAX_LEVEL()).to.equal(NEW_MAX_LEVEL);
    });

    // it("Should mint single NFT & return the proper metadata", async function () {
    //     // Deploy the contract
    //     const Factory = await ethers.getContractFactory("Testable");
    //     const contract = await Factory.deploy(initialBaseTokenURI);
    //     await contract.deployed();

    //     // Increment 
    //     // Mint single NFT
    //     const minted = await contract.mintSingleNFT();
    // });
});
