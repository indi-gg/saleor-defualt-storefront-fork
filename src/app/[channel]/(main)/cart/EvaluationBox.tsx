"use client";
import { generateUniqueId } from "@/lib/utils";
import { useRouter, useSearchParams } from "next/navigation";
import React, { useEffect, useMemo, useState } from "react";
import Loading from "../products/loading";

const getEvalPayLoad = (referenceId: string, checkOutData: any) => {
	const data = {
		reference_id: referenceId,
		products: [],
	};

	checkOutData?.lines?.forEach((productItem: any) => {
		const { variant, totalPrice } = productItem || {};
		const { product, id } = variant || {};
		const { name, slug, media } = product || "";
		const newProduct = {
			product_reference_id: generateUniqueId(),
			product_id: id?.slice(0, 12),
			metadata: {
				name: name,
				description: slug || "this is a description",
				product_type: "external",
				image_url: media?.[0]?.url,
			},
			price_with_gst: totalPrice?.gross?.amount || 0,
			gst_percent: 0,
		};
		data.products.push(newProduct);
	});
	return data;
};

const EvaluationBox = ({ checkOutData }: any) => {
	const [referenceId, setReferenceId] = useState("");
	const [productData, setProductData] = useState<any>(null);
	const [kCashData, setKCashData] = useState<any>(null);
	const router = useRouter();

	const { base_kcash_amount, kcash_to_purchase, tax, total_kcash_required } = kCashData || {};
	const kgenAccessToken = localStorage.getItem("kgen_accessToken");
	const saleorAccessToken = localStorage.getItem("saleor_accessToken");
	const searchParams = useSearchParams();
	const checkoutId = searchParams.get("checkout");
	const [loading, setLoading] = useState(false);

	useEffect(() => {
		const cartData = JSON.parse(localStorage.getItem("cartData")) || {};
		const refId = generateUniqueId();
		cartData.referenceId = refId;
		setReferenceId(refId);
		localStorage.setItem("cartData", JSON.stringify(cartData));
	}, []);

	useEffect(() => {
		if (referenceId && kgenAccessToken && checkOutData) {
			const updatedData = getEvalPayLoad(referenceId, checkOutData);
			setProductData(updatedData);
			const resultantData = getEvaluationData(kgenAccessToken, updatedData);
			resultantData?.then((data) => {
				if (data) {
					setKCashData(data);
				}
			});
		}
	}, [referenceId, kgenAccessToken, checkOutData]);

	const RenderProductData = useMemo(() => {
		if (!productData?.products?.length) {
			return <></>;
		}
		return productData?.products?.map(({ metadata, price_with_gst, gst_percent }: any) => {
			console.log(JSON.stringify(productData));
			return (
				<div className="w-full p-4 border rounded-md shadow-sm" key={metadata?.name}>
					<div className="flex items-center gap-4">
						{/* Display Product Image */}
						{metadata?.image_url && (
							<img
								src={metadata.image_url}
								alt={metadata?.name}
								className="w-24 h-24 object-cover rounded-md" // Image size
							/>
						)}
	
						{/* Display Product Details (Name and Price) */}
						<div className="flex-1">
							<div className="flex flex-col">
								{/* Product Name */}
								<div className="text-lg font-semibold">
									Product Name: {metadata?.name}
								</div>
	
								{/* Product Price */}
								<div className="text-gray-600 mt-2">
									Price: {price_with_gst} K-Cash
								</div>
							</div>
						</div>
					</div>
				</div>
			);
		});
	}, [productData]);
	
	
	

	return (
		<div className="max-w-7xl">
			{loading && <Loading />}
			{RenderProductData}
			
			{/* Flex container to align keys and values */}
			<div className="mt-8 w-full border-t-2 border-gray-200 pt-4 font-medium text-neutral-700">
				<div className="flex justify-between">
					<span>Total Price (excluding Tax):</span>
					<span>{base_kcash_amount || "..."} K-Cash</span>
				</div>
			</div>
			<div className="mt-2 w-full font-medium text-neutral-600">
				<div className="flex justify-between">
					<span>Total K-Cash User Needs to Purchase:</span>
					<span>{kcash_to_purchase} K-Cash</span>
				</div>
			</div>
			<div className="mt-2 w-full font-medium text-neutral-600">
				<div className="flex justify-between">
					<span>Total Price (including Tax):</span>
					<span>{total_kcash_required || "..."} K-Cash</span>
				</div>
			</div>
			<div className="mt-2 w-full font-medium text-neutral-600">
				<div className="flex justify-between">
					<span>Total Tax:</span>
					<span>{tax} K-Cash</span>
				</div>
			</div>
	
			<div className="mt-6 w-full">
				{kCashData ? (
					<button
						onClick={() => {
							setLoading(true);
							submitProduct(referenceId, kgenAccessToken);
							const purchasedData = confirmPurchaseSaleor(checkoutId, saleorAccessToken);
							purchasedData?.then((data) => {
								if (data) {
									router.push("/default-channel/purchased-successfull");
								}
							});
						}}
						className="rounded-sm bg-gray-800 p-2 text-white"
					>
						Confirm Order
					</button>
				) : (
					<button
						type="submit"
						aria-disabled={true}
						aria-busy={true}
						className="h-12 items-center rounded-md bg-neutral-900 px-6 py-3 text-base font-medium leading-6 text-white shadow hover:bg-neutral-800 disabled:cursor-not-allowed disabled:opacity-70 hover:disabled:bg-neutral-700 aria-disabled:cursor-not-allowed aria-disabled:opacity-70 hover:aria-disabled:bg-neutral-700"
					>
						<div className="inline-flex items-center">
							<svg
								className="-ml-1 mr-3 h-5 w-5 animate-spin text-white"
								xmlns="http://www.w3.org/2000/svg"
								fill="none"
								viewBox="0 0 24 24"
							>
								<circle
									className="opacity-25"
									cx="12"
									cy="12"
									r="10"
									stroke="currentColor"
									strokeWidth="4"
								></circle>
								<path
									className="opacity-75"
									fill="currentColor"
									d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
								></path>
							</svg>
							<span>Processing...</span>
						</div>
					</button>
				)}
			</div>
		</div>
	);
};

export default EvaluationBox;

export const getEvaluationData = (accessToken: string, updatedData: any) => {
	const myHeaders = new Headers();
	myHeaders.append("source", "website");
	myHeaders.append("Authorization", `Bearer ${accessToken}`);
	myHeaders.append("Content-Type", "application/json");

	const raw = JSON.stringify(updatedData);

	const requestOptions = {
		method: "POST",
		headers: myHeaders,
		body: raw,
		redirect: "follow",
	};

	return fetch("https://pre-prod.devindigg.com/tps/shop/v2/purchase/evaluate", requestOptions)
		.then((response) => {
			return response.json();
		})
		.then((result) => {
			return result;
		})
		.catch((error) => console.error(error));
};

async function confirmPurchaseSaleor(checkoutId: string | null, accessToken: string) {
	const confirmMutation = `
		mutation {
			checkoutComplete(
				id: "${checkoutId}"
			  ) {
				order {
				  id
				  status
				}
				errors {
				  field
				  message
				}
			  }
		}
	`;
	const myHeaders = new Headers();
	myHeaders.append("source", "website");
	myHeaders.append("Authorization", `Bearer ${accessToken}`);
	myHeaders.append("Content-Type", "application/json");

	try {
		let response = await fetch(process.env.BASE_API_URL, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({ query: confirmMutation }),
		});

		let result = await response.json();
		return result;
	} catch (error) {
		console.error("Error during login or registration:", error);
	}
}

export const submitProduct = (referenceId: string, kgenAccessToken: string) => {
	const myHeaders = new Headers();
	myHeaders.append("source", "website");
	myHeaders.append("Authorization", `Bearer ${kgenAccessToken}`);
	myHeaders.append("Content-Type", "application/json");

	const raw = JSON.stringify({
		reference_id: referenceId,
	});

	const requestOptions = {
		method: "POST",
		headers: myHeaders,
		body: raw,
		redirect: "follow",
	};

	fetch("https://pre-prod.devindigg.com/tps/shop/v2/purchase/submit", requestOptions)
		.then((response) => {
			return response.json();
		})
		.then((result) => console.log(result))
		.catch((error) => console.error(error));
};
