// importfunctionalities
import React from 'react';
// import logo from './logo.svg';
import './App.css';
import {
  PublicKey,
  Transaction,
  Connection,
  clusterApiUrl,
  Keypair,
  LAMPORTS_PER_SOL,
  SystemProgram,
  //  sendAndConfirmRawTransaction,
  sendAndConfirmTransaction,
} from "@solana/web3.js";
import { useEffect, useState } from "react";


//add buffer
window.Buffer = window.Buffer || require('buffer').Buffer;

// create types
type DisplayEncoding = "utf8" | "hex";

type PhantomEvent = "disconnect" | "connect" | "accountChanged";
type PhantomRequestMethod =
  | "connect"
  | "disconnect"
  | "signTransaction"
  | "signAllTransactions"
  | "signMessage";

interface ConnectOpts {
  onlyIfTrusted: boolean;
}

// create a provider interface (hint: think of this as an object) to store the Phantom Provider
interface PhantomProvider {
  publicKey: PublicKey | null;
  isConnected: boolean | null;
  signTransaction: (transaction: Transaction) => Promise<Transaction>;
  signAllTransactions: (transactions: Transaction[]) => Promise<Transaction[]>;
  signMessage: (
    message: Uint8Array | string,
    display?: DisplayEncoding
  ) => Promise<any>;
  connect: (opts?: Partial<ConnectOpts>) => Promise<{ publicKey: PublicKey }>;
  disconnect: () => Promise<void>;
  on: (event: PhantomEvent, handler: (args: any) => void) => void;
  request: (method: PhantomRequestMethod, params: any) => Promise<unknown>;
}

/**
 * @description gets Phantom provider, if it exists
 */
const getProvider = (): PhantomProvider | undefined => {
  if ("solana" in window) {
    // @ts-ignore
    const provider = window.solana as any;
    if (provider.isPhantom) return provider as PhantomProvider;
  }
};


function App() {

  // create state variable for the provider
  const [provider, setProvider] = useState<PhantomProvider | undefined>(undefined);
  // create state variable for the wallet key
  const [walletKey, setWalletKey] = useState<PhantomProvider | undefined>(undefined);
  // create state variable for the wallet key key use
  const [towalletkey, setToWalletKey] = useState([] as any);
  // create state variable for From pubkey
  const [fromKey, setFromKey] = useState([] as any);
  // create state variable for From pubkey
  const [frompubKey, setFrompubKey] = useState([] as any);
  // create state variable for getwalletBalance
  const [gwalletbalance, setwalletBalance] = useState([] as any);
  // create state variable for SOL transfered sign
  const [tranSolSign, settranSolSign] = useState([] as any
  );


  // this is the function that runs whenever the component updates (e.g. render, refresh)
  useEffect(() => {

    const provider = getProvider();
    // if the phantom provider exists, set this as the provider
    if (provider) setProvider(provider);
    else setProvider(undefined);

  }, []);



  // Get the wallet balance from a given private key
  const GetWalletBalance = async () => {
  
    try {
      // Connect to the Devnet
      const connection = new Connection(clusterApiUrl("devnet"), "confirmed");
    console.log("Connection object is:", connection);

      // Make a wallet (keypair) from privateKey and get its balance
      const Balance = await connection.getBalance(new PublicKey(frompubKey));
      const WalletBalance1 = parseFloat((Balance / LAMPORTS_PER_SOL).toFixed(8));  
     //  console.log(`Wallet balance: ${parseInt(WalletBalance1.toString()) / LAMPORTS_PER_SOL} SOL`);
  
      // update walletBalance var
      // setwalletBalance(parseInt(WalletBalance1.toString(), 10));
      setwalletBalance(WalletBalance1);

    } catch (err) {
      console.log(err);
    }

  };



  // Create empty Account Drop 2 Sol and getBalance
  const CreateSolaccount = async () => {

    // if (fromKey.publicKey) setFromKey(frompubKey);
    if (fromKey.publicKey) {
    //  setFrompubKey(frompubKey);
    //  setFromKey(fromKey);
    //  settranSolSign(undefined);

      await AirDropSol();
      await GetWalletBalance();

    }
    else {
 //     setFrompubKey(undefined);
 //     setFromKey(undefined);
 //     setwalletBalance(undefined);

      try {
        // 1 - Create a new keypair
        const from = await Keypair.generate();
       
        // Var fromKey and frompubKey   
        setFromKey(from);
        const frompubKey1 = await from.publicKey.toString();
        setFrompubKey(frompubKey1);
        console.log("From wallet pubkey ", from.publicKey.toString);

        //  2 - Connect to the Devnet for Airdrop
        const connection = new Connection(clusterApiUrl("devnet"), "confirmed");
        console.log("Connection object is:", connection);

        // 2 - AirDrop 2 SOL      
        const fromAirDropSignature = await connection.requestAirdrop(
          new PublicKey(from.publicKey),
          2 * LAMPORTS_PER_SOL
        );
        // Latest blockhash (unique identifer of the block) of the cluster
        let latestBlockHash = await connection.getLatestBlockhash();

        // Confirm transaction using the last valid block height (refers to its time)
        // to check for transaction expiration
        await connection.confirmTransaction({
          blockhash: latestBlockHash.blockhash,
          lastValidBlockHeight: latestBlockHash.lastValidBlockHeight,
          signature: fromAirDropSignature
        });

      
      console.log("Airdrop completed on : ", from.publicKey.toString());

        // 3 - GetWalletBalance
        await GetWalletBalance();

      } catch (err) {
        console.log(err);
      }     
    }
  };



  // Aidrop 1 more SOL for Sender wallet for Fees
  const AirDropSol = async () => {
  if (fromKey.publicKey) {
    try {
    const connection = new Connection(clusterApiUrl("devnet"), "confirmed");
    console.log("Connection object is:", connection);

    const fromAirDropSignature = await connection.requestAirdrop(
      new PublicKey(fromKey.publicKey),
      1 * LAMPORTS_PER_SOL
    );
    // Latest blockhash (unique identifer of the block) of the cluster
    let latestBlockHash = await connection.getLatestBlockhash();

    // Confirm transaction using the last valid block height (refers to its time)
    // to check for transaction expiration
    await connection.confirmTransaction({
      blockhash: latestBlockHash.blockhash,
      lastValidBlockHeight: latestBlockHash.lastValidBlockHeight,
      signature: fromAirDropSignature
    });

    console.log("Airdrop completed on : ", frompubKey);

  //  await GetWalletBalance();
      } catch (err) {
        console.log(err);
      }
    }     
  };




  /**
   * @description prompts user to connect wallet if it exists.
   * This function is called when the connect wallet button is clicked
   */
  const connectWallet = async () => {
    // @ts-ignore
    const { solana } = window;
    // checks if phantom wallet exists
    if (solana) {
      try {
        // connects wallet and returns response which includes the wallet public key
        const response = await solana.connect();

        console.log('wallet account ', response.publicKey.toString());
        // update Tokey to be the to public key
        setToWalletKey(await response);
        // update walletKey to be the public key viewable
        setWalletKey(await response.publicKey.toString());

      } catch (err) {
        // { code: 4001, message: 'User rejected the request.' }
      }
    }
  };

  



   // Transfer 2 sol from to to Wallet & get wallet balance
   const Transol = async () => {
     if (fromKey.publicKey) {
      // @ts-ignore
      const { solana } = window;
      // checks if phantom wallet exists

      if (solana) {
      try {
         
         // connects wallet and returns response which includes the wallet public key
          const connection = new Connection(clusterApiUrl("devnet"), "confirmed");
          console.log("Connection object is:", connection);

          // Send money from "from" wallet and into "to" wallet
          var transaction = new Transaction().add(
            SystemProgram.transfer({
              fromPubkey: fromKey.publicKey,
              //  toPubkey: response.publicKey,
              toPubkey: towalletkey.publicKey,
              lamports: 2 * LAMPORTS_PER_SOL
            })
          );

          // Sign transaction
          var signature = await sendAndConfirmTransaction(
            connection,
            transaction,
            [fromKey]
          );

          settranSolSign(signature);
          console.log('Signature is ', signature);

          await GetWalletBalance();

        } catch (err) {
          // { code: 4001, message: 'User rejected the request.' }
        }
     } }
  };



      // Disconnect the to wallet
      const decoWallet = async () => {
        if (provider) {
          try {
            await provider.disconnect();
            console.log('Wallet Disconnected');
            //  erase key
            setWalletKey(undefined);
          } catch (err) {
            // { code: 4001, message: 'User rejected the request.' }
          }
        }
      };







  // HTML code for the app
  return (
    //   <div className="App">
    <div>
      <header className="App-header">

        <h2>Tansfer to connected Phantom Wallet</h2>

        {provider && (
          <button
            style={{
              fontSize: "16px",
              padding: "15px",
              fontWeight: "bold",
              borderRadius: "5px",
            }}
            onClick={CreateSolaccount}
          >
            1- Create ACC with 2 Sole or 1 more SOL for fees
          </button>
        )}


        {frompubKey && !walletKey && (
          <div>
            <p><h6>Fromkey is: <>{frompubKey}</></h6> </p>
            <p><h6>From Ballance : <>{gwalletbalance}</> SOL</h6> </p>
          </div>
        )}


        {provider && !walletKey && frompubKey && (
          <button
            style={{
              fontSize: "16px",
              padding: "15px",
              fontWeight: "bold",
              borderRadius: "5px",
            }}
            onClick={connectWallet}
          >
            2- Connect Wallet
          </button>
        )}

        {provider && walletKey && (
          <button
            style={{
              fontSize: "16px",
              padding: "15px",
              fontWeight: "bold",
              borderRadius: "5px",
              position: "absolute",
              top: 0,
              right: 0,
            }}
            onClick={decoWallet}
          >
            Disconnect Wallet
          </button>
        )}

        {provider && walletKey && frompubKey && (
          <button
            style={{
              fontSize: "16px",
              padding: "15px",
              fontWeight: "bold",
              borderRadius: "5px",
            }}
            onClick={Transol}
          >
            3- Transfer 2 Sol to Phantom
          </button>
        )}

        {provider && walletKey && frompubKey && (
          <>
          <p><h6> From: {frompubKey} </h6> </p >
          <p><h6> From Ballance : {gwalletbalance} SOL </h6> </p>
          <p><h6> <> ToWallet: {walletKey} </> </h6></p>
          <p><a href="https://explorer.solana.com/&#x3F;cluster=devnet"> Solana Explorer devnet</a></p>
          <p><h6> Signature: {tranSolSign} </h6> </p>
        </>

        )}


        {!provider && (
          <p>
            No provider found. Install{" "}
            <a href="https://phantom.app/">Phantom Browser extension</a>
          </p>
        )}


      </header>
    </div>
  );
}

export default App;
