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
        expect(await contract.PRICE()).to.equal(ethers.BigNumber.from("100000000000000000"));
        expect(await contract.levels(0)).to.equal(0);
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
        const setBaseURITxn = await contract.setBaseURI(updatedBaseTokenURI);
        await setBaseURITxn.wait();
        // Check that base token URI was updated properly
        expect(await contract.baseTokenURI()).to.equal(updatedBaseTokenURI);

        // Ensure base URI update is only owner
        const [owner, addr1] = await ethers.getSigners();
        await expect(contract.connect(addr1).setBaseURI(updatedBaseTokenURI)).to.be.revertedWith('Ownable: caller is not the owner');
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

        // Ensure max level update is only owner
        const [owner, addr1] = await ethers.getSigners();
        await expect(contract.connect(addr1).setMaxLevel(NEW_MAX_LEVEL)).to.be.revertedWith('Ownable: caller is not the owner');
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
        await expect(contract.incrementTokenLevel(0)).to.be.revertedWith("You've reached max fatness.");
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
        await expect(contract.tokenURI(tokenId)).to.be.revertedWith("ERC721Metadata: URI query for nonexistent token");

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

    it("Should reserve NFTs properly", async function () {
        // Deploy the contract
        const Factory = await ethers.getContractFactory("NFTCollectible");
        const contract = await Factory.deploy(initialBaseTokenURI);
        await contract.deployed();

        // Reserve too many NFTs
        await expect(contract.reserveNFTs(1001)).to.be.revertedWith("Not enough NFTs");

        // Get owner address
        const [owner, addr1] = await ethers.getSigners();
        const address = owner.address;

        // Reserve NFTs
        const reserveNumber = 10;
        const reserveNFTsTxn = await contract.reserveNFTs(reserveNumber);
        await reserveNFTsTxn.wait()
        expect(await contract.totalSupply()).to.equal(reserveNumber);
        const tokensOfOwner = Object.values(await contract.tokensOfOwner(address));
        expect(tokensOfOwner.length).to.equal(reserveNumber);
        for (let i = 0; i < tokensOfOwner.length; i++) {
            expect(tokensOfOwner[i]).to.equal(ethers.BigNumber.from(i.toString()));
        }

        // Ensure reserve NFTs is only owner
        await expect(contract.connect(addr1).reserveNFTs(1)).to.be.revertedWith("Ownable: caller is not the owner");
    });

    it("Should mint NFTs properly", async function () {
        // Deploy the contract
        const Factory = await ethers.getContractFactory("NFTCollectible");
        const contract = await Factory.deploy(initialBaseTokenURI);
        await contract.deployed();

        // Get owner address
        const [owner, addr1] = await ethers.getSigners();
        const ownerAddress = owner.address;
        const minterAddress = addr1.address;
        const mintNumber = 3;
        const mintPrice = await contract.PRICE();
        const mintAmount = (mintNumber * mintPrice / 10000000000000000).toString();

        // Mint more NFTs than available
        await expect(contract.mintNFTs(1001)).to.be.revertedWith("Not enough NFTs");

        // Mint more NFTs than allowable
        await expect(contract.mintNFTs(4)).to.be.revertedWith("Cannot mint specified number of NFTs.");

        // Mint single NFT with less than mint value
        await expect(contract.mintNFTs(1, { value: ethers.utils.parseEther("0.0999") })).to.be.revertedWith("Not enough ether to purchase NFTs.");

        // Mint multiple NFTs with less than mint value
        await expect(contract.mintNFTs(3, { value: ethers.utils.parseEther("0.2999") })).to.be.revertedWith("Not enough ether to purchase NFTs.");

        // Mint multiple NFTs
        const reserveNFTsTxn = await contract.connect(addr1).mintNFTs(mintNumber, { value: ethers.utils.parseEther(mintAmount) });
        await reserveNFTsTxn.wait()

        const tokensOfMinter = Object.values(await contract.tokensOfOwner(minterAddress));
        const tokensOfOwner = Object.values(await contract.tokensOfOwner(ownerAddress));
        expect(tokensOfOwner.length).to.equal(0);
        expect(tokensOfMinter.length).to.equal(3);
        for (let i = 0; i < tokensOfMinter.length; i++) {
            expect(tokensOfMinter[i]).to.equal(ethers.BigNumber.from(i.toString()));
            expect(await contract.levels(i)).to.equal(1);
        }
    });

    it("Should update upgradeAllowList properly + gate level upgrades accordingly", async function () {

    });
});
