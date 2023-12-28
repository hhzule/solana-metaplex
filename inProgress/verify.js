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
  //   account address of the contract
  //   const mintC = new web3.PublicKey(
  //     "mzhQ6kq4g6V58WAXCoGvL41j2nwV6PBo3pqtKtH5YVA"
  //   );
  const mint = new web3.PublicKey(
    "mzhQ6kq4g6V58WAXCoGvL41j2nwV6PBo3pqtKtH5YVA"
  );

  const mintT = new web3.PublicKey(
    "vpPDs4VWAZjMiGcZ9YZ5SaoV2RnRHuXsvpkPxy7KkLP"
  );

  //fromWeb3JsPublicKey(metadataPDA),
  const signer = {
    publicKey: fromWeb3JsPublicKey(myKeypair.publicKey),
    signTransaction: null,
    signMessage: null,
    signAllTransactions: null,
  };
  const mintAcc = new web3.PublicKey(
    "vpPDs4VWAZjMiGcZ9YZ5SaoV2RnRHuXsvpkPxy7KkLP"
  );

  const pID = new web3.PublicKey("metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s");
  const seed1 = Buffer.from(anchor.utils.bytes.utf8.encode("metadata"));
  const seed2 = pID.toBytes();
  const seed3 = mintAcc.toBytes();

  const [metadataPDA, _bump] = web3.PublicKey.findProgramAddressSync(
    [seed1, seed2, seed3],
    pID
  );

  const accounts = {
    metadata: fromWeb3JsPublicKey(metadataPDA),
    mint: fromWeb3JsPublicKey(mintT),
    mintAuthority: signer,
    payer: signer,
    updateAuthority: fromWeb3JsPublicKey(myKeypair.publicKey),
  };

  const umi = createUmi("https://api.devnet.solana.com");

  //   const metadataBuilder = mpl.setAndVerifyCollection(umi, {
  //     metadata: fromWeb3JsPublicKey(metadataPDA),
  //     collectionAuthority: signer,
  //     payer: signer,
  //     updateAuthority: signer,
  //     /** Mint of the Collection */
  //     collectionMint: mint, // "vpPDs4VWAZjMiGcZ9YZ5SaoV2RnRHuXsvpkPxy7KkLP"
  //     /** Metadata Account of the Collection */
  //     collection: mint, // "mzhQ6kq4g6V58WAXCoGvL41j2nwV6PBo3pqtKtH5YVA"
  //     collectionMasterEditionAccount: fromWeb3JsPublicKey(myKeypair.publicKey),
  //   });

  const metadataBuilder = mpl.verifyCollectionV1(umi, {
    metadata: fromWeb3JsPublicKey(metadataPDA),
    authority: signer,
    collectionMint: mint, // "vpPDs4VWAZjMiGcZ9YZ5SaoV2RnRHuXsvpkPxy7KkLP"
  });
  const connection = new web3.Connection("https://api.devnet.solana.com");

  (async () => {
    const ix = metadataBuilder.getInstructions()[0];
    ix.keys = ix.keys.map((key) => {
      const newKey = { ...key };
      newKey.pubkey = toWeb3JsPublicKey(key.pubkey);
      return newKey;
    });

    const tx = new web3.Transaction().add(ix);
    const sig = await web3.sendAndConfirmTransaction(connection, tx, [
      myKeypair,
    ]);

    console.log(sig);
  })();
}

main();
