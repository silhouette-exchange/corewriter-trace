import { AbiCoder } from "ethers";

const ABI = AbiCoder.defaultAbiCoder();

type Action<type = string> = {
  version: number;
  type: type;
};

type LimitOrderAction = Action<"limitOrder"> & {
  data: {
    asset: number;
    isBuy: boolean;
    limitPx: number;
    sz: number;
    reduceOnly: boolean;
    encodedTif: number;
    cloid: BigInt;
  };
};

type VaultTransferAction = Action<"vaultTransfer"> & {
  data: {
    vault: string;
    isDeposit: boolean;
    usd: number;
  };
};

type TokenDelegateAction = Action<"tokenDelegate"> & {
  data: {
    validator: string;
    wei: number;
    isUndelegate: boolean;
  };
};

type StakingDepositAction = Action<"stakingDeposit"> & {
  data: {
    wei: number;
  };
};

type StakingWithdrawAction = Action<"stakingWithdraw"> & {
  data: {
    wei: number;
  };
};

type SpotSendAction = Action<"spotSend"> & {
  data: {
    destination: string;
    token: number;
    wei: number;
  };
};

type CancelOrderByOidAction = Action<"cancelOrderByOid"> & {
  data: {
    asset: number;
    oid: bigint;
  };
};

type CancelOrderByCloidAction = Action<"cancelOrderByCloid"> & {
  data: {
    asset: number;
    cloid: bigint;
  };
};

type UsdClassTransferAction = Action<"usdClassTransfer"> & {
  data: {
    ntl: number;
    toPerp: boolean;
  };
};

type SendAssetAction = Action<"sendAsset"> & {
  data: {
    destination: string;
    subAccount: string;
    source_dex: number;
    destination_dex: number;
    token: bigint;
    wei: bigint;
  };
};

type UnknownAction = Action<"unknown"> & {
  data: {
    data: string;
  };
};

type CoreWriterAction =
  | LimitOrderAction
  | VaultTransferAction
  | TokenDelegateAction
  | StakingDepositAction
  | StakingWithdrawAction
  | SpotSendAction
  | UsdClassTransferAction
  | CancelOrderByOidAction
  | CancelOrderByCloidAction
  | SendAssetAction
  | UnknownAction;

const decodeLimitOrder = (data: string): Omit<LimitOrderAction, "version"> => {
  const result = ABI.decode(
    [
      "uint32 asset",
      "bool isBuy",
      "uint64 limitPx",
      "uint64 sz",
      "bool reduceOnly",
      "uint8 encodedTif",
      "uint128 cloid",
    ],
    `0x${data}`
  );

  return {
    type: "limitOrder",
    data: {
      asset: Number(result.asset),
      isBuy: Boolean(result.isBuy),
      limitPx: Number(result.limitPx),
      sz: Number(result.sz),
      reduceOnly: Boolean(result.reduceOnly),
      encodedTif: Number(result.encodedTif),
      cloid: BigInt(result.cloid),
    },
  };
};

const decodeStakingDeposit = (
  data: string
): Omit<StakingDepositAction, "version"> => {
  const result = ABI.decode(["uint64 wei"], `0x${data}`);

  return {
    type: "stakingDeposit",
    data: {
      wei: Number(result.wei),
    },
  };
};

const decodeTokenDelegate = (
  data: string
): Omit<TokenDelegateAction, "version"> => {
  const result = ABI.decode(
    ["address validator", "uint64 wei", "bool isUndelegate"],
    `0x${data}`
  );

  return {
    type: "tokenDelegate",
    data: {
      validator: result.validator,
      wei: Number(result.wei),
      isUndelegate: result.isUndelegate,
    },
  };
};

const decodeStakingWithdraw = (
  data: string
): Omit<StakingWithdrawAction, "version"> => {
  const result = ABI.decode(["uint64 wei"], `0x${data}`);

  return {
    type: "stakingWithdraw",
    data: {
      wei: Number(result.wei),
    },
  };
};

const decodeSpotSend = (data: string): Omit<SpotSendAction, "version"> => {
  const result = ABI.decode(
    ["address destination", "uint64 token", "uint64 wei"],
    `0x${data}`
  );

  return {
    type: "spotSend",
    data: {
      destination: result.destination,
      token: Number(result.token),
      wei: Number(result.wei),
    },
  };
};

const decodeUsdClassTransfer = (
  data: string
): Omit<UsdClassTransferAction, "version"> => {
  const result = ABI.decode(["uint64 ntl", "bool toPerp"], `0x${data}`);

  return {
    type: "usdClassTransfer",
    data: {
      ntl: Number(result.ntl),
      toPerp: result.toPerp,
    },
  };
};

const decodeVaultTransfer = (
  data: string
): Omit<VaultTransferAction, "version"> => {
  const result = ABI.decode(
    ["address vault", "bool isDeposit", "uint64 usd"],
    `0x${data}`
  );

  return {
    type: "vaultTransfer",
    data: {
      vault: result.vault,
      isDeposit: result.isDeposit,
      usd: Number(result.usd),
    },
  };
};

const decodeCancelOrderByOid = (
  data: string
): Omit<CancelOrderByOidAction, "version"> => {
  const result = ABI.decode(["uint32 asset", "uint64 oid"], `0x${data}`);

  return {
    type: "cancelOrderByOid",
    data: {
      asset: Number(result.asset),
      oid: BigInt(result.oid),
    },
  };
};

const decodeCancelOrderByCloid = (
  data: string
): Omit<CancelOrderByCloidAction, "version"> => {
  const result = ABI.decode(["uint32 asset", "uint64 cloid"], `0x${data}`);

  return {
    type: "cancelOrderByCloid",
    data: {
      asset: Number(result.asset),
      cloid: BigInt(result.cloid),
    },
  };
};

const decodeSendAsset = (data: string): Omit<SendAssetAction, "version"> => {
  const result = ABI.decode(
    [
      "address destination",
      "address subAccount",
      "uint32 source_dex",
      "uint32 destination_dex",
      "uint64 token",
      "uint64 wei",
    ],
    `0x${data}`
  );

  return {
    type: "sendAsset",
    data: {
      destination: result.destination,
      subAccount: result.subAccount,
      source_dex: Number(result.source_dex),
      destination_dex: Number(result.destination_dex),
      token: BigInt(result.token),
      wei: BigInt(result.wei),
    },
  };
};

export const decodeCoreWriterAction = (data: string): CoreWriterAction => {
  const version = parseInt(`0x${data.slice(2, 4)}`);

  const action = parseInt(`0x${data.slice(4, 10)}`);

  const payload = data.slice(10);

  switch (action) {
    case 1:
      return {
        version,
        ...decodeLimitOrder(payload),
      };
    case 2:
      return {
        version,
        ...decodeVaultTransfer(payload),
      };
    case 3:
      return {
        version,
        ...decodeTokenDelegate(payload),
      };
    case 4:
      return {
        version,
        ...decodeStakingDeposit(payload),
      };
    case 5:
      return {
        version,
        ...decodeStakingWithdraw(payload),
      };
    case 6:
      return {
        version,
        ...decodeSpotSend(payload),
      };
    case 7:
      return {
        version,
        ...decodeUsdClassTransfer(payload),
      };
    case 10:
      return {
        version,
        ...decodeCancelOrderByOid(payload),
      };
    case 11:
      return {
        version,
        ...decodeCancelOrderByCloid(payload),
      };
    case 13:
      return {
        version,
        ...decodeSendAsset(payload),
      };
  }

  return {
    version,
    type: "unknown",
    data: {
      data: payload,
    },
  };
};
