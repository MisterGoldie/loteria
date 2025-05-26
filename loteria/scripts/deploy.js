// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
const hre = require("hardhat");

async function main() {
  // Base USDC Contract address
  const usdcAddress = "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913";

  // Deploy the LoteriaRewards contract
  const LoteriaRewards = await hre.ethers.getContractFactory("LoteriaRewards");
  
  console.log("Deploying LoteriaRewards contract...");
  const loteriaRewards = await LoteriaRewards.deploy(usdcAddress);
  await loteriaRewards.deployed();

  console.log("LoteriaRewards deployed to:", loteriaRewards.address);
  console.log("USDC address:", usdcAddress);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
