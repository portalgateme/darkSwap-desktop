import { DarkSwap, NoteCryptoContext, createNoteCryptoContext, deriveKey } from "@thesingularitynetwork/darkswap-sdk"
import { getAddress, Signer } from "ethers"
import { getDarkSwap } from "../../utils/darkSwap"
import { RpcManager } from "../rpcManager"

const NOTE_CRYPTO_SALT = "darkswap-note-crypto"

export class DarkSwapContext {
    chainId: number
    signer: Signer
    walletAddress: string
    publicKey: string
    darkSwap: DarkSwap
    signature: string
    noteCryptoContext: NoteCryptoContext

    private constructor(chain: number, wallet: string, signer: Signer, pubKey: string, darkSwap: DarkSwap, signature: string, noteCryptoContext: NoteCryptoContext) {
        this.chainId = chain
        this.walletAddress = wallet
        this.signer = signer
        this.publicKey = pubKey
        this.darkSwap = darkSwap
        this.signature = signature
        this.noteCryptoContext = noteCryptoContext
    }

    static async createDarkSwapContext(chain: number, walletIn: string, rpcManager: RpcManager) {
        const wallet = getAddress(walletIn.toLowerCase());
        const [signer, pubKey] = rpcManager.getSignerAndPublicKey(wallet, chain)
        const darkSwap = getDarkSwap(chain, signer)

        const domain = {
            name: "SingularityDarkSwapClientServer",
            version: "1",
        };

        const types = {
            Message: [
                { name: "wallet", type: "string" },
                { name: "content", type: "string" },
            ],
        };

        const value = {
            wallet: wallet,
            content: "Please sign this message to create your own Zero Knowledge proof key-pair. This doesn't cost you anything and is free of any gas fees.",
        };

        const signature = await signer.signTypedData(domain, types, value);
        const keyHex = deriveKey(signature, NOTE_CRYPTO_SALT)
        const noteCryptoContext = createNoteCryptoContext(wallet, keyHex)
        return new DarkSwapContext(chain, wallet, signer, pubKey, darkSwap, signature, noteCryptoContext)
    }
} 