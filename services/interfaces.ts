import { Contract } from "web3-eth-contract";
import BN from "bn.js";

export interface TipBotContract extends Contract {
  methods: {
    tip: (address: string) => {
      encodeABI: encodeABI;
    };
    airDrop: (address: string[]) => {
      encodeABI: encodeABI;
    };
    tipByToken: (
      recipientAddress: string,
      tokenAddress: string,
      amount: BN
    ) => {
      encodeABI: encodeABI;
    };
  };
}

export interface ERC20Contract extends Contract {
  methods: {
    approve: (
      spenderAddress: string,
      amount: BN
    ) => {
      encodeABI: encodeABI;
      send: ({ from }: { from: string }) => Promise<any>;
    };
    balanceOf: (address: string) => {
      call: ({ from }: { from: string }) => Promise<BN>;
    };
  };
}

type encodeABI = () => string;
