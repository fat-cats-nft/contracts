const hre = require("hardhat");

async function main() {
    const baseTokenURI = "ipfs://QmWNotzVEyHwbUgvQV7mmYvxBmfHutdBNzYC9Y84CKC9cR/"

    // We get the contract to deploy
    const NFTCollectible = await hre.ethers.getContractFactory("NFTCollectible");
    const collectible = await NFTCollectible.deploy(baseTokenURI);

    await collectible.deployed();

    console.log("NFT collectible deployed to:", collectible.address);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
