const {
  Metaplex,
  keypairIdentity,
  bundlrStorage,
  toMetaplexFile,
} = require("@metaplex-foundation/js");

const { Connection, clusterApiUrl, Keypair } = require("@solana/web3.js");
const fs = require("fs");
const {
  fromWeb3JsPublicKey,
  toWeb3JsPublicKey,
} = require("@metaplex-foundation/umi-web3js-adapters");

function loadWalletKey(keypairFile) {
  const loaded = Keypair.fromSecretKey(
    new Uint8Array(JSON.parse(fs.readFileSync(keypairFile).toString()))
  );
  return loaded;
}

async function main() {
  const connection = new Connection(clusterApiUrl("devnet"));
  //   const wallet = Keypair.generate();

  console.log("Let's name some tokens");
  //account address that deployed the contract
  const myKeypair = loadWalletKey(
    "zu85pBfnokYGtF8yrKaH7y6JGkPZPZ4WR1ZyBhCRUoV.json"
  );
  const signer = {
    publicKey: fromWeb3JsPublicKey(myKeypair.publicKey),
    signTransaction: null,
    signMessage: null,
    signAllTransactions: null,
  };
  // const myKeypair = Keypair.generate();
  //   console.log("connection", wallet);
  try {
    const metaplex = Metaplex.make(connection).use(keypairIdentity(myKeypair));
    // .use(bundlrStorage({ address: "https://devnet.bundlr.network" }));

    // const buffer = fs.readFileSync("img.jpeg");

    // const file = toMetaplexFile(buffer, "image.png");
    // console.log("file", file);
    // const { uri } = await metaplex.nfts().uploadMetadata({
    //   name: "My NFT",
    //   description: "My description",
    //   image: imageUri,
    // });

    const collectionNft = await metaplex.nfts().create(
      {
        uri: "https://uxm26fljyvkiy7m45ll3iehqk6jzthykw3eiqasnnmpmbhpbli.arweave.net/pdmvFWnFVIx9nOrXtB-DwV5OZnwq2yIgCTWsewJ3hWs",
        name: "My NFT",
        sellerFeeBasisPoints: 0,
        // symbol: data.symbol,
        // mintAuthority: signer,
        // useExistingMint:
        isCollection: true,
      },

      { commitment: "finalized" }
    );
    // console.log("collectionNft", collectionNft);
    console.log("mintAddress", collectionNft.mintAddress);
    console.log("tokenAddress", collectionNft.tokenAddress);
    console.log("nft.address", collectionNft.nft.address);
    const { nft } = await metaplex.nfts().create(
      {
        uri: "https://uxm26fljyvkiy7m45ll3iehqk6jzthykw3eiqasnnmpmbhpbli.arweave.net/pdmvFWnFVIx9nOrXtB-DwV5OZnwq2yIgCTWsewJ3hWs",
        name: "My NFT",
        sellerFeeBasisPoints: 0,
        collection: collectionNft.mintAddress,
      },

      { commitment: "finalized" }
    );
    console.log("nft", nft.address);
    let res = await metaplex.nfts().verifyCollection(
      {
        mintAddress: nft.address,
        collectionMintAddress: collectionNft.nft.address,
        isSizedCollection: true,
        // collectionAuthority: signer,
      }
      // {
      //   payer: signer,
      // }
    );
    console.log("res", res);
  } catch (error) {
    console.log("error", error);
  }
}

main();
