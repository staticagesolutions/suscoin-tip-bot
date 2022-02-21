import { Contract } from "web3-eth-contract";

export interface TipBotContract extends Contract {
  methods: {
    tip: (address: string) => {
      encodeABI: () => string;
    };
  };
}
