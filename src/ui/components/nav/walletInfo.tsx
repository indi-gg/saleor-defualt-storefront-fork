import React, { useEffect, useState } from "react";

const WalletInfo = () => {
	const [walletData, setWalletData] = useState(null);
	console.log("🚀 ~ WalletInfo ~ walletData:", walletData);
	const kgenAccessToken = localStorage.getItem("kgen_accessToken");
	const { bonusKCash, boughtKCash, earnedKCash } = walletData?.balances?.["K-Cash"]?.breakdown || {};
	const { amount } = walletData?.balances?.["K-Cash"] || {};

	useEffect(() => {
		if (kgenAccessToken) {
			const getWalletData = getWalletBalance(kgenAccessToken);
			getWalletData?.then((data: any) => {
				setWalletData(data);
			});
		}
	}, [kgenAccessToken]);
	return (
		<div className="mt-2">
			{walletData && (
				<div>
					<div>Wallet Balance</div>
					<div className="text-al my-2 ml-6 text-left	">
						<div>Total KCash: {amount}</div>
						<div>Bonus KCash: {bonusKCash?.amount}</div>
						<div>Bought KCash: {boughtKCash?.amount}</div>
						<div>Earned KCash: {earnedKCash?.amount}</div>
					</div>
				</div>
			)}
		</div>
	);
};

export default WalletInfo;

const getWalletBalance = (accessToken: string) => {
	const myHeaders = new Headers();
	myHeaders.append("accept", "*/*");
	myHeaders.append("Authorization", `Bearer ${accessToken}`);

	const requestOptions = {
		method: "GET",
		headers: myHeaders,
		redirect: "follow",
	};

	return fetch("https://stage-api-backend.kgen.io/wallets/tokens/balance", requestOptions)
		.then((response) => {
			return response.json();
		})
		.then((result) => {
			return result;
		})
		.catch((error) => console.error(error));
};
