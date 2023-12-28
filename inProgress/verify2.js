// import * as mpl from "@metaplex-foundation/mpl-token-metadata";
// import * as web3 from "@solana/web3.js"
// import * as anchor from '@project-serum/anchor'
const mpl = require("@metaplex-foundation/mpl-token-metadata");
const web3 = require("@solana/web3.js");
const anchor = require("@project-serum/anchor");
const { createUmi } = require("@metaplex-foundation/umi-bundle-defaults");
const {
  fromWeb3JsPublicKey,
  toWeb3JsPublicKey,
} = require("@metaplex-foundation/umi-web3js-adapters");
const UMI = require("@metaplex-foundation/umi");

function loadWalletKey(keypairFile) {
  const fs = require("fs");
  const loaded = web3.Keypair.fromSecretKey(
    new Uint8Array(JSON.parse(fs.readFileSync(keypairFile).toString()))
  );
  return loaded;
}

async function main() {
  console.log("Let's name some tokens");
  //account address that deployed the contract
  const myKeypair = loadWalletKey(
    "zu85pBfnokYGtF8yrKaH7y6JGkPZPZ4WR1ZyBhCRUoV.json"
  );
  console.log(myKeypair.publicKey.toBase58());

  const umi = createUmi("https://api.devnet.solana.com").use(
    mpl.mplTokenMetadata()
  );

  const signer = {
    publicKey: fromWeb3JsPublicKey(myKeypair.publicKey),
    signTransaction: null,
    signMessage: null,
    signAllTransactions: null,
  };
  //   const mint = UMI.generateSigner(signer);
  umi.use(UMI.signerIdentity(signer));

  const mint = UMI.createSignerFromKeypair(
    umi,
    UMI.publicKey("zu85pBfnokYGtF8yrKaH7y6JGkPZPZ4WR1ZyBhCRUoV")
  );
  const res = await mpl
    .createNft(umi, {
      mint: mint,
      name: "My Collection",
      uri: "https://example.com/my-collection.json",
      sellerFeeBasisPoints: UMI.percentAmount(5.5), // 5.5%
      isCollection: true,
    })
    .sendAndConfirm(umi);
  console.log("response", res);
  const asset = await fetchDigitalAsset(umi, mint.publicKey);
  console.log("asset", asset);
  // (async () => {
  //     const ix = metadataBuilder.getInstructions()[0];
  //     ix.keys = ix.keys.map((key) => {
  //       const newKey = { ...key };
  //       newKey.pubkey = toWeb3JsPublicKey(key.pubkey);
  //       return newKey;
  //     });

  //     const tx = new web3.Transaction().add(ix);
  //     const sig = await web3.sendAndConfirmTransaction(connection, tx, [
  //       myKeypair,
  //     ]);

  //     console.log(sig);
  //   })();
}

main();
