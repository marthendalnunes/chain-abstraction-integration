import { expect } from "chai";
import { deployments, ethers } from "hardhat";
import { BigNumber, BigNumberish, constants, Contract, providers, utils, Wallet } from "ethers";
import { DEFAULT_ARGS } from "../../deploy";
import { getRandomBytes32 } from "@connext/utils";
import { fund, ERC20_ABI } from "../helpers";

import AavePoolInterface from "../../artifacts/@aave/core-v3/contracts/interfaces/IPool.sol/IPool.json";

describe("AavePoolAdapter", function () {
  // Set up constants (will mirror what deploy fixture uses)
  const { WETH, USDC, CONNEXT, DOMAIN } = DEFAULT_ARGS[31337];
  const AAVE_POOL_ADDRESS = "0x794a61358D6845594F94dc1DB02A252b5b4814aD";
  const CONNEXT_ADDRESS = "0x8f7492DE823025b4CfaAB1D34c58963F2af5DEDA";
  const WHALE = "0x385BAe68690c1b86e2f1Ad75253d080C14fA6e16"; // this is the address that should have weth, target, and random addr
  const NOT_ZERO_ADDRESS = "0x7088C5611dAE159A640d940cde0a3221a4af8896";
  const RANDOM_TOKEN = "0x4200000000000000000000000000000000000042"; // this is OP
  const ASSET_DECIMALS = 6; // USDC decimals on op

  // Set up variables
  let adapter: Contract;
  let aavePool: Contract;
  let wallet: Wallet;
  let whale: Wallet;
  let tokenUSDC: Contract;
  let weth: Contract;
  let randomToken: Contract;

  before(async () => {
    // get wallet
    [wallet] = (await ethers.getSigners()) as unknown as Wallet[];
    // get whale
    whale = (await ethers.getImpersonatedSigner(WHALE)) as unknown as Wallet;
    // deploy contract
    const contract = await ethers.getContractFactory("AavePoolAdapter");
    const instance = await contract.deploy(AAVE_POOL_ADDRESS);
    await instance.deployed();
    adapter = instance;

    aavePool = new Contract(AAVE_POOL_ADDRESS, AavePoolInterface.abi, ethers.provider);
    // setup tokens
    tokenUSDC = new ethers.Contract(USDC, ERC20_ABI, ethers.provider);
  });

  describe("constructor", () => {
    it("should deploy correctly", async () => {
      // Ensure all properties set correctly
      expect(await adapter.connect(wallet).aavePool()).to.be.eq(AAVE_POOL_ADDRESS);
      // await aavePool
      //   .connect(wallet)
      //   // Ensure whale is okay
      //   .expect(whale.address)
      //   .to.be.eq(WHALE);
      expect(tokenUSDC.address).to.be.eq(USDC);
    });
  });

  describe("supply", () => {
    before(async () => {
      // fund the target contract with eth, random token, and target asset
      // await fund(constants.AddressZero, utils.parseEther("1"), whale, adapter.address);
      await fund(USDC, utils.parseUnits("5", ASSET_DECIMALS), whale, adapter.address);
    });

    it("should work ", async () => {
      const toAsset = tokenUSDC;
      // get reasonable amount out

      const adapterBalance = wallet;
      console.log("adapterBalance", adapterBalance.toString());

      const tx = await adapter
        .connect(wallet)
        ._supply(toAsset.address, utils.parseUnits("5", ASSET_DECIMALS), wallet.address, 0);
      const receipt = await tx.wait();
      console.log("receipt", receipt);

      // const calldata = utils.defaultAbiCoder.encode(
      //   ["address", "uint256", "address", "uint16"],
      //   [toAsset.address, utils.parseUnits("5", ASSET_DECIMALS), wallet.address, 0],
      // );
      // const transferId = getRandomBytes32();

      // // send tx
      // const tx = await target
      //   .connect(wallet)
      //   .xReceive(transferId, BigNumber.from(adapterBalance), toAsset.address, wallet.address, DOMAIN, calldata);

      // const receipt = await tx.wait();
      // // // Ensure tokens got sent to connext
      // // expect((await toAsset.balanceOf(target.address)).toString()).to.be.eq("0");
      // console.log("balance", toAsset.balanceOf(wallet.address).toString());
      // console.log("receipt", receipt);
    });
  });
});
