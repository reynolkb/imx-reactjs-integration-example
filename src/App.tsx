import './App.css';
import { Link, ImmutableXClient, ImmutableMethodResults } from '@imtbl/imx-sdk';
import { useEffect, useState } from 'react';
import Marketplace from './Marketplace';
import Inventory from './Inventory';
import Bridging from './Bridging';
require('dotenv').config();

const App = () => {
	// initialise Immutable X Link SDK
	const link = new Link(process.env.REACT_APP_ROPSTEN_LINK_URL);

	// general
	const [tab, setTab] = useState('marketplace');
	const [wallet, setWallet] = useState('undefined');
	const [balance, setBalance] = useState<ImmutableMethodResults.ImmutableGetBalanceResult>(Object);
	const [client, setClient] = useState<ImmutableXClient>(Object);
	const [walletConnected, setWalletConnected] = useState(false);

	useEffect(() => {
		buildIMX();
	}, []);

	// initialise an Immutable X Client to interact with apis more easily
	async function buildIMX(): Promise<void> {
		const publicApiUrl: string = process.env.REACT_APP_ROPSTEN_ENV_URL ?? '';
		let clientResponse = await ImmutableXClient.build({ publicApiUrl });
		setClient(clientResponse);
		if (localStorage.getItem('address')) {
			let walletAddress = localStorage.getItem('address') as string;
			setWalletConnected(true);
			setWallet(walletAddress);
			setBalance(await clientResponse.getBalance({ user: walletAddress, tokenAddress: 'eth' }));
		}
	}

	// register and/or setup a user
	async function linkSetup(): Promise<void> {
		const res = await link.setup({});
		setWalletConnected(true);
		setWallet(res.address);
		setBalance(await client.getBalance({ user: res.address, tokenAddress: 'eth' }));

		localStorage.setItem('address', res.address);
	}

	function handleTabs() {
		if (client.address) {
			switch (tab) {
				case 'inventory':
					if (wallet === 'undefined') return <div>Connect wallet</div>;
					return <Inventory client={client} link={link} wallet={wallet} />;
				case 'bridging':
					if (wallet === 'undefined') return <div>Connect wallet</div>;
					return <Bridging client={client} link={link} wallet={wallet} />;
				default:
					return <Marketplace client={client} link={link} />;
			}
		}
		return null;
	}

	function logOut() {
		localStorage.removeItem('address');
		setWallet('undefined');
		setWalletConnected(false);
	}

	async function moonPay() {
		await link.fiatToCrypto({});
	}

	return (
		<div className='App'>
			<button onClick={linkSetup}>Setup</button>
			<button onClick={logOut}>Log Out</button>
			<button onClick={moonPay}>Buy ETH</button>
			<div>Active wallet: {wallet}</div>
			{walletConnected ? <div>Immutable X ETH balance (in wei): {balance?.balance?.toString()}</div> : <div>Immutable X ETH balance (in wei):</div>}
			<button onClick={() => setTab('marketplace')}>Marketplace</button>
			<button onClick={() => setTab('inventory')}>Inventory</button>
			<button onClick={() => setTab('bridging')}>Deposit and withdrawal</button>
			<br />
			<br />
			<br />
			{handleTabs()}
		</div>
	);
};

export default App;
