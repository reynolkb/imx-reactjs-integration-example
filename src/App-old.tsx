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
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		const onLoad = async () => {
			await buildIMX();
			// await checkWalletConnected();
		};
		onLoad();
	}, [loading]);
	setLoading(false);

	// initialise an Immutable X Client to interact with apis more easily
	async function buildIMX() {
		const publicApiUrl: string = process.env.REACT_APP_ROPSTEN_ENV_URL ?? '';
		await loadingSetClient(publicApiUrl);
	}

	// register and/or setup a user
	async function linkSetup(): Promise<void> {
		const res = await link.setup({});
		setWallet(res.address);
		setBalance(await client.getBalance({ user: res.address, tokenAddress: 'eth' }));

		localStorage.setItem('address', res.address);
		setWalletConnected(true);
	}

	async function loadingSetClient(publicApiUrl: string) {
		setClient(await ImmutableXClient.build({ publicApiUrl }));
	}

	function logBalance() {
		console.log(balance.balance);
	}

	async function checkWalletConnected(): Promise<void> {
		// if (localStorage.getItem('address')) {
		// 	await linkSetup();
		// }
		console.log(client);
		const res = await link.setup({});
	}

	async function logOut() {
		localStorage.removeItem('address');
		setWallet('undefined');
		setWalletConnected(false);
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

	return (
		<div className='App'>
			<button onClick={linkSetup}>Setup</button>
			<button onClick={logOut}>Log Out</button>
			<button onClick={logBalance}>Log Balance</button>
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
