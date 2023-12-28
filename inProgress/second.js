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

  const myKeypair = loadWalletKey(
    "zu85pBfnokYGtF8yrKaH7y6JGkPZPZ4WR1ZyBhCRUoV.json"
  );
  console.log(myKeypair.publicKey.toBase58());
  const mint = new web3.PublicKey(
    "zho23SLbjBbAMScEmJefQcLMvHJHGWNtNMjxuLiR3Xs"
  );
  const pID = new web3.PublicKey("metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s");
  const seed1 = Buffer.from(anchor.utils.bytes.utf8.encode("metadata"));
  const seed2 = pID.toBytes();
  const seed3 = mint.toBytes();

  const [metadataPDA, _bump] = web3.PublicKey.findProgramAddressSync(
    [seed1, seed2, seed3],
    pID
  );

  const umi = createUmi("https://api.devnet.solana.com");

  const accounts = {
    metadata: metadataPDA,
    mint,
    mintAuthority: myKeypair.publicKey,
    payer: myKeypair.publicKey,
    updateAuthority: myKeypair.publicKey,
  };

  const dataV2 = {
    name: "Gizmo Coin",
    symbol: "$GIZMO",
    uri: "https://uxm26fljyvkiy7m45ll3iehqk6jzthykw3eiqasnnmpmbhpbli.arweave.net/pdmvFWnFVIx9nOrXtB-DwV5OZnwq2yIgCTWsewJ3hWs",
    // we don't need that
    // we don't need that
    sellerFeeBasisPoints: 0,
    creators: null,
    collection: null,
    uses: null,
  };

  const args = {
    createMetadataAccountArgsV2: {
      data: dataV2,
      isMutable: true,
    },
  };

  const fullArgs = { ...accounts, ...args };

  const connection = new web3.Connection("https://api.devnet.solana.com");
  const metadataBuilder = mpl.updateMetadataAccountV2(umi, fullArgs);

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
