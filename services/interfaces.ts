import { Contract } from "web3-eth-contract";

export interface TipBotContract extends Contract {
  methods: {
    tip: (address: string) => {
      encodeABI: encodeABI;
    };
    airDrop: (address: string[]) => {
      encodeABI: encodeABI;
    };
  };
}

type encodeABI = () => string;
