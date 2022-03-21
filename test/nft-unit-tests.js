const { expect, should } = require("chai");
const { ethers } = require("hardhat");

describe("NFT Collectible", function () {
    const initialBaseTokenURI = "Initial Base Token URI/"

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

        const updatedBaseTokenURI = "Updated Base Token URI/"
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

    it("Should properly increment token level", async function () {
        // Deploy the contract
        const Factory = await ethers.getContractFactory("Testable");
        const contract = await Factory.deploy(initialBaseTokenURI);
        await contract.deployed();

        // Increment token level below max level
        const MAX_LEVEL = await contract.MAX_LEVEL();
        for (let i = 1; i <= MAX_LEVEL; i++) {
            const incrementTokenLevelTxn = await contract.incrementTokenLevel(0);
            await incrementTokenLevelTxn.wait();
            expect(await contract.levels(0)).to.equal(i);
        }

        // Increment token level beyond max level
        try {
            await contract.incrementTokenLevel(0)
        } catch (error) {
            expect(error.message).to.equal("VM Exception while processing transaction: reverted with reason string 'You've reached max fatness.'");
        }
    });

    it("Should properly mint a single NFT", async function () {
        // Deploy the contract
        const Factory = await ethers.getContractFactory("Testable");
        const contract = await Factory.deploy(initialBaseTokenURI);
        await contract.deployed();

        // Get owner address
        const [owner] = await ethers.getSigners();
        const address = owner.address;

        // Set minted token info
        const tokenId = 0;
        const tokenLevel = 1;

        // Check initial state
        expect(await contract.totalSupply()).to.equal(0);
        expect(await contract.getTokenIds()).to.equal(ethers.BigNumber.from("0"));
        const initialTokensOfOwner = Object.values(await contract.tokensOfOwner(address));
        expect(initialTokensOfOwner.length).to.equal(0);
        try {
            await contract.tokenURI(tokenId)
        } catch (error) {
            expect(error.message).to.equal("VM Exception while processing transaction: reverted with reason string 'ERC721Metadata: URI query for nonexistent token'");
        }

        // Mint single NFT & check metadata
        const mintSingleNFTTxn = await contract.mintSingleNFT();
        await mintSingleNFTTxn.wait();

        // Check to make sure token totals incremented
        expect(await contract.totalSupply()).to.equal(1);
        expect(await contract.getTokenIds()).to.equal(ethers.BigNumber.from("1"));

        // Check to make sure NFT metadata minted correctly

        // Check that token level is correct
        expect(await contract.levels(tokenId)).to.equal(tokenLevel);

        // Check that token owner is correct
        const tokensOfOwner = Object.values(await contract.tokensOfOwner(address));
        expect(tokensOfOwner.length).to.equal(1);
        expect(tokensOfOwner[0]).to.equal(ethers.BigNumber.from(tokenId.toString()));

        // Check that tokenURI is correct
        const tokenURI = initialBaseTokenURI + tokenId.toString() + "/" + tokenLevel.toString();
        expect(await contract.tokenURI(tokenId)).to.equal(tokenURI);
    });
});
