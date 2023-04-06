import { FC, ReactNode } from 'react';
import { TitleBar } from 'common';
import styled from 'styled-components';

//#region DEFINE STYLED COMPONENTS

const StyledMain = styled.main`
	padding-top: 65px;
	padding-right: 20px;
	padding-left: 20px;
	padding-bottom: 5px;
`;

//#endregion

type PrimaryLayoutProps = {
	children?: ReactNode;
}

const PrimaryLayout: FC = (props: PrimaryLayoutProps) => {
	const { children } = props;

  return (
    <>
      <header>
        <TitleBar />
      </header>
      <StyledMain>
        {children}
      </StyledMain>
    </>
  );
}

export default PrimaryLayout