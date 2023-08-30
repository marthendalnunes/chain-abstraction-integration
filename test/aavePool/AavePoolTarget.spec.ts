import { expect } from "chai";
import { deployments, ethers } from "hardhat";
import { BigNumber, BigNumberish, constants, Contract, providers, utils, Wallet } from "ethers";
import { DEFAULT_ARGS } from "../../deploy";
import { getRandomBytes32 } from "@connext/utils";
import { fund, ERC20_ABI } from "../helpers";

import ConnextInterface from "../../artifacts/@connext/interfaces/core/IConnext.sol/IConnext.json";

describe("AavePoolTarget", function () {
  // Set up constants (will mirror what deploy fixture uses)
  const { WETH, USDC, CONNEXT, DOMAIN } = DEFAULT_ARGS[31337];
  const AAVE_POOL_ADDRESS = "0x794a61358D6845594F94dc1DB02A252b5b4814aD";
  const CONNEXT_ADDRESS = "0x8f7492DE823025b4CfaAB1D34c58963F2af5DEDA";
  const WHALE = "0x385BAe68690c1b86e2f1Ad75253d080C14fA6e16"; // this is the address that should have weth, target, and random addr

  const ASSET_DECIMALS = 6; // USDC decimals on op

  // Set up variables
  let target: Contract;
  let connext: Contract;
  let wallet: Wallet;
  let whale: Wallet;
  let connextWallet: Wallet;

  let tokenUSDC: Contract;
  before(async () => {
    // get wallet
    [wallet] = (await ethers.getSigners()) as unknown as Wallet[];
    // get whale
    whale = (await ethers.getImpersonatedSigner(WHALE)) as unknown as Wallet;
    // get connext wallet
    connextWallet = (await ethers.getImpersonatedSigner(CONNEXT_ADDRESS)) as unknown as Wallet;

    // deploy contract
    const contract = await ethers.getContractFactory("AavePoolTarget");
    const instance = await contract.deploy(CONNEXT_ADDRESS, AAVE_POOL_ADDRESS);
    await instance.deployed();
    target = instance;

    connext = new Contract(CONNEXT, ConnextInterface.abi, ethers.provider);
    // setup tokens
    tokenUSDC = new ethers.Contract(USDC, ERC20_ABI, ethers.provider);
  });

  describe("constructor", () => {
    it("should deploy correctly", async () => {
      // Ensure all properties set correctly
      expect(await target.connect(wallet).aavePool()).to.be.eq(AAVE_POOL_ADDRESS);

      // Ensure whale is okay
      expect(whale.address).to.be.eq(WHALE);
      expect(tokenUSDC.address).to.be.eq(USDC);
    });
  });

  describe("xReceive", () => {
    before(async () => {
      // fund the target contract with eth, random token, and target asset
      await fund(constants.AddressZero, utils.parseEther("1"), wallet, target.address);
      await fund(constants.AddressZero, utils.parseEther("1"), wallet, connextWallet.address);

      await fund(USDC, utils.parseUnits("5", ASSET_DECIMALS), whale, target.address);
    });

    it("should work when from is ERC20", async () => {
      const toAsset = tokenUSDC;
      // get reasonable amount out

      const adapterBalance = await toAsset.balanceOf(target.address);
      console.log("adapterBalance", adapterBalance.toString());

      const calldata = utils.defaultAbiCoder.encode(
        ["address", "address", "uint16"],
        [toAsset.address, wallet.address, 0],
      );
      const transferId = getRandomBytes32();

      console.log("calldata", calldata);
      console.log("transferId", transferId);
      // send tx
      const tx = await target
        .connect(connextWallet)
        .xReceive(transferId, utils.parseUnits("5", ASSET_DECIMALS), toAsset.address, wallet.address, DOMAIN, calldata);

      // wait for tx to be mined
      const receipt = await tx.wait();
      // // Ensure tokens got sent to connext
      // expect((await toAsset.balanceOf(target.address)).toString()).to.be.eq("0");
      console.log("balance", toAsset.balanceOf(wallet.address).toString());
      console.log("receipt", receipt);
    });
  });
});
