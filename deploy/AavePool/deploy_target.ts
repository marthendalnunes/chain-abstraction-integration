import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import { config as envConfig } from "dotenv";
import { AAVE_CONFIG, DEFAULT_ARGS, MEAN_CONFIG } from "../index";

envConfig();

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  // Get the chain id
  const chainId = +(await hre.getChainId());
  console.log("chainId", chainId);

  if (!DEFAULT_ARGS[chainId] || !AAVE_CONFIG[chainId].POOL) {
    throw new Error(`No defaults provided for ${chainId}`);
  }

  // Get the constructor args
  const args = [process.env.CONNEXT ?? DEFAULT_ARGS[chainId].CONNEXT, AAVE_CONFIG[chainId].POOL];

  // Get the deployer
  const [deployer] = await hre.ethers.getSigners();
  if (!deployer) {
    throw new Error(`Cannot find signer to deploy with`);
  }
  console.log("\n============================= Deploying MeanFinanceTarget ===============================");
  console.log("deployer: ", deployer.address);
  console.log("constructorArgs:", args);

  // Deploy contract
  const adapter = await hre.deployments.deploy("AavePoolTarget", {
    from: deployer.address,
    args: args,
    skipIfAlreadyDeployed: true,
    log: true,
    // deterministicDeployment: true,
  });
  console.log(`AavePoolTarget deployed to ${adapter.address}`);
};
export default func;
func.tags = ["AavePoolTarget", "test", "prod"];
