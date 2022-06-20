import abi from '../utils/BuyMeACoffee.json';
import { ethers } from 'ethers';
import Head from 'next/head';
import React, { useEffect, useState } from 'react';
import { NextPage } from 'next';
import {
  Button,
  FormControl,
  FormLabel,
  Heading,
  HStack,
  Input,
  Text,
  Textarea,
  VStack
} from '@chakra-ui/react';

const Home: NextPage = () => {
  // Contract Address & ABI
  const contractAddress = '0x50eb06EFb3f75e2dcB0af0AbDc0Df2D8cb2016B8';
  const contractABI = abi.abi;

  // Component state
  const [currentAccount, setCurrentAccount] = useState('');
  const [name, setName] = useState('');
  const [message, setMessage] = useState('');
  const [memos, setMemos] = useState<any[]>([]);

  const onNameChange = (event: any) => {
    setName(event.target.value);
  };

  const onMessageChange = (event: any) => {
    setMessage(event.target.value);
  };

  // Wallet connection logic
  const isWalletConnected = async () => {
    try {
      // @ts-expect-error
      const { ethereum } = window;

      const accounts = await ethereum.request({ method: 'eth_accounts' });
      console.log('accounts: ', accounts);

      if (accounts.length > 0) {
        const account = accounts[0];
        console.log('wallet is connected! ' + account);
      } else {
        console.log('make sure MetaMask is connected');
      }
    } catch (error) {
      console.log('error: ', error);
    }
  };

  const connectWallet = async () => {
    try {
      // @ts-expect-error
      const { ethereum } = window;

      if (!ethereum) {
        console.log('please install MetaMask');
      }

      const accounts = await ethereum.request({
        method: 'eth_requestAccounts'
      });

      setCurrentAccount(accounts[0]);
    } catch (error) {
      console.log(error);
    }
  };

  const buyCoffee = async (amount: string) => {
    try {
      // @ts-expect-error
      const { ethereum } = window;

      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum, 'any');
        const signer = provider.getSigner();
        const buyMeACoffee = new ethers.Contract(
          contractAddress,
          contractABI,
          signer
        );

        console.log('buying coffee..');
        const coffeeTxn = await buyMeACoffee.buyCoffee(
          name ? name : 'anon',
          message ? message : 'Enjoy your coffee!',
          { value: ethers.utils.parseEther(amount) }
        );

        await coffeeTxn.wait();

        console.log('mined ', coffeeTxn.hash);

        console.log('coffee purchased!');

        // Clear the form fields.
        setName('');
        setMessage('');
      }
    } catch (error) {
      console.log(error);
    }
  };

  // Function to fetch all memos stored on-chain.
  const getMemos = async () => {
    try {
      // @ts-expect-error
      const { ethereum } = window;
      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const buyMeACoffee = new ethers.Contract(
          contractAddress,
          contractABI,
          signer
        );

        console.log('fetching memos from the blockchain..');
        const memos = await buyMeACoffee.getMemos();
        console.log('fetched!');
        setMemos(memos);
      } else {
        console.log('Metamask is not connected');
      }
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    let buyMeACoffee: ethers.Contract;
    isWalletConnected();
    getMemos();

    // Create an event handler function for when someone sends
    // us a new memo.
    const onNewMemo = (
      from: string,
      timestamp: number,
      name: string,
      message: string
    ) => {
      console.log('Memo received: ', from, timestamp, name, message);
      setMemos((prevState) => [
        ...prevState,
        {
          address: from,
          timestamp: new Date(timestamp * 1000),
          message,
          name
        }
      ]);
    };

    // @ts-expect-error
    const { ethereum } = window;

    // Listen for new memo events.
    if (ethereum) {
      const provider = new ethers.providers.Web3Provider(ethereum, 'any');
      const signer = provider.getSigner();
      buyMeACoffee = new ethers.Contract(contractAddress, contractABI, signer);

      buyMeACoffee.on('NewMemo', onNewMemo);
    }

    return () => {
      if (buyMeACoffee) {
        buyMeACoffee.off('NewMemo', onNewMemo);
      }
    };
  }, []);

  return (
    <VStack>
      <Head>
        <title>Buy a Coffee!</title>
        <meta name='description' content='Tipping site' />
        <link rel='icon' href='/favicon.ico' />
      </Head>

      <Heading textAlign={'center'} mt='3rem'>
        Buy a Coffee!
      </Heading>

      {currentAccount ? (
        <VStack>
          <FormControl>
            <FormLabel>Name</FormLabel>
            <Input placeholder='anon' onChange={onNameChange} />
          </FormControl>
          <FormControl>
            <FormLabel>Send Albert a message</FormLabel>
            <Textarea
              rows={3}
              placeholder='Enjoy your coffee!'
              onChange={onMessageChange}
              required
            />
          </FormControl>
          <HStack>
            <Button colorScheme={'linkedin'} onClick={() => buyCoffee('0.001')}>
              Send a regular coffee for 0.001ETH
            </Button>
            <Button
              colorScheme={'messenger'}
              onClick={() => buyCoffee('0.003')}
            >
              Send a LARGE coffee for 0.003ETH
            </Button>
          </HStack>
          <Heading>Memos received</Heading>
          {memos.map((memo, idx) => {

            return (
              <div
                key={idx}
                style={{
                  border: '2px solid',
                  borderRadius: '5px',
                  padding: '5px',
                  margin: '5px'
                }}
              >
                <p style={{ fontWeight: 'bold' }}>&quot;{memo.message}&quot;</p>
                <p>
                  From: {memo.name} at {memo.timestamp.toString()}
                </p>
              </div>
            );
          })}
        </VStack>
      ) : (
        <Button m='5rem' colorScheme={'twitter'} onClick={connectWallet}>
          {' '}
          Connect your wallet{' '}
        </Button>
      )}

      <footer>
        <Text>
          Created by{' '}
          <a
            target='_blank'
            rel='noopener noreferrer'
            href='http://www.twitter.com/MordiGoldstein'
          >
            Mordi Goldstein
          </a>{' '}
          for{' '}
          <a
            href='https://alchemy.com/?a=roadtoweb3weektwo'
            target='_blank'
            rel='noopener noreferrer'
          >
            Alchemy&apos;s Road to Web3 lesson two!
          </a>
        </Text>
      </footer>
    </VStack>
  );
};

export default Home;
