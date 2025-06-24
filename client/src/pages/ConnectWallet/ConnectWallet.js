import React, { useContext, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Swal from 'sweetalert2';
import globalContext from './../../context/global/globalContext';
import LoadingScreen from '../../components/loading/LoadingScreen';

import socketContext from '../../context/websocket/socketContext';
import { CS_FETCH_LOBBY_INFO } from '../../pokergame/actions';
import './ConnectWallet.scss';

import { ethers } from 'ethers';
import Web3Modal from 'web3modal';

const ConnectWallet = () => {
  const { setWalletAddress } = useContext(globalContext);
  const { socket } = useContext(socketContext);
  const navigate = useNavigate();
  const query = new URLSearchParams(useLocation().search);

  const [walletAddress, setLocalWalletAddress] = useState(null);
  const [isConnecting, setIsConnecting] = useState(false);

  const handleSuccess = async (address) => {
    try {
      setLocalWalletAddress(address);
      setWalletAddress(address);

      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const signature = await signer.signMessage('This is a test');

      console.log('Signed message:', signature);

      const gameId = query.get('gameId');
      const username = query.get('username');

      if (socket && socket.connected && gameId && username) {
        socket.emit(CS_FETCH_LOBBY_INFO, {
          walletAddress: address,
          socketId: socket.id,
          gameId,
          username,
        });
      }

      navigate('/play');
    } catch (err) {
      console.error('❌ Message signing failed:', err);
      Swal.fire('Error', 'Message signing failed.', 'error');
    }
  };

  const connectMetaMask = async () => {
    if (typeof window.ethereum === 'undefined') {
      Swal.fire('MetaMask not found', 'Please install MetaMask.', 'error');
      return;
    }

    try {
      setIsConnecting(true);

      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts',
      });

      if (!accounts || accounts.length === 0) {
        throw new Error('No accounts found');
      }

      const address = accounts[0];
      handleSuccess(address);
    } catch (err) {
      console.error('MetaMask connection failed:', err);
      Swal.fire(
        'Connection Failed',
        err.message || 'Could not connect.',
        'error'
      );
    } finally {
      setIsConnecting(false);
    }
  };

  const connectEthereumWallet = async () => {
    try {
      setIsConnecting(true);

      const web3Modal = new Web3Modal({
        cacheProvider: false,
        providerOptions: {},
      });

      const instance = await web3Modal.connect();
      const provider = new ethers.providers.Web3Provider(instance);
      const signer = provider.getSigner();
      const address = await signer.getAddress();

      handleSuccess(address);
    } catch (err) {
      console.error('Ethereum wallet connection failed:', err);
      Swal.fire(
        'Connection Failed',
        'Could not connect to Ethereum wallet.',
        'error'
      );
    } finally {
      setIsConnecting(false);
    }
  };

  return (
    <div className='connect-wallet-page'>
      <LoadingScreen>
        {!walletAddress && (
          <div className='wallet-connect-container'>
            <button
              onClick={connectMetaMask}
              className='wallet-connect-button metamask'
            >
              Connect MetaMask Wallet
            </button>
            <button
              onClick={connectEthereumWallet}
              className='wallet-connect-button ethereum'
            >
              Connect Ethereum Wallet
            </button>
          </div>
        )}
      </LoadingScreen>

      {walletAddress && (
        <div className='connected-info'>
          <p>
            🔗 Connected Wallet: <strong>{walletAddress}</strong>
          </p>
        </div>
      )}
    </div>
  );
};

export default ConnectWallet;
