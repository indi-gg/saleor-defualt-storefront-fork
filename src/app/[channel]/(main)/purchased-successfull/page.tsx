"use client";
import { useRouter } from "next/navigation";
import React from "react";

const PurchasedSuccessFull = () => {
	const router = useRouter();

	const goToStore = () => {
		router.push("/default-channel/products");
	};

	return (
		<div className="flex min-h-screen flex-col items-center justify-center bg-gray-100">
			<div className="max-w-2xl rounded-lg bg-white p-12 text-center shadow-lg">
				<h1 className="text-3xl font-semibold text-green-600">Order Placed Successfully!</h1>
				<p className="mt-6 text-lg text-gray-700">You have successfully placed the order.</p>
				<p className="text-md mt-4 text-gray-500">Go to the store to buy more products.</p>
				<button
					onClick={goToStore}
					className="mt-8 rounded-lg bg-gray-800 px-8 py-4 text-lg font-semibold text-white transition duration-300 hover:bg-blue-700"
				>
					Go to Store
				</button>
			</div>
		</div>
	);
};

export default PurchasedSuccessFull;
