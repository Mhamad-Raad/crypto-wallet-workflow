import React, { useEffect } from 'react';
import styled from 'styled-components';
import Loader from './Loader';
import loadingImage from './../../assets/game/loading-background.jpg';

const StyledLoadingScreen = styled.div`
  width: 100%;
  min-height: 100vh;
  background-color: black;
  background-image: url(${loadingImage});
  background-repeat: no-repeat;
  background-position: center center;
  background-size: contain;
  background-attachment: fixed;
  display: flex;
  justify-content: center;
`;

const LoadingScreen = ({ children }) => (
  <StyledLoadingScreen>
    <Loader />
    {children && <div className='wallet-buttons-container'>{children}</div>}
  </StyledLoadingScreen>
);

export default LoadingScreen;
