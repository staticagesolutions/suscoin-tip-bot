import { ERC20Token } from "types/supported-erc20-token";
import { default as ERC20Json } from "../solidity/build/contracts/ERC20.json";
import { AbiItem } from "web3-utils";
import { supportedTokens } from "shared/utils/tokens-config";

export class SupportedTokenService {
  getERC20ABI(): AbiItem[] | null {
    return ERC20Json.abi as AbiItem[];
  }

  getContractAddress(token: ERC20Token): string {
    let address = "";
    switch (token) {
      case ERC20Token.PSYS:
        address = supportedTokens.ERC20.PSYS.address;
        break;
    }
    return address;
  }
}
