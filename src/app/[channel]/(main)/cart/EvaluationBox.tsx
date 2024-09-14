"use client";
import { generateUniqueId } from "@/lib/utils";
import React, { useEffect, useMemo, useState } from "react";

const getEvalPayLoad = (referenceId: string, checkOutData: any) => {
	const data = {
		reference_id: referenceId,
		products: [],
	};

	checkOutData?.lines?.forEach((productItem: any) => {
		const { variant, totalPrice } = productItem || {};
		const { product } = variant || {};
		const { name, id, slug, thumbnail } = product || "";
		const newProduct = {
			product_reference_id: generateUniqueId(),
			product_id: id,
			metadata: {
				name: name,
				description: slug,
				product_type: "external",
				image_url: thumbnail?.url,
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
	const [productData, setProductData] = useState<any>([]);
	const [kCashData, setKCashData] = useState<any>([]);
	const { base_kcash_amount, kcash_to_purchase, tax, total_kcash_required } = kCashData || "";
	const kgenAccessToken = localStorage.getItem("kgen_accessToken");

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
			return (
				<div className="w-full">
					<div className="flex gap-2">
						<div>Product Name :</div> {metadata?.name}
					</div>
					<div className="ml-40 flex w-full justify-end gap-2 text-gray-600">
						<div>price_with_gst :</div> {price_with_gst}
					</div>
					<div className="ml-40 flex w-full justify-end gap-2 text-gray-600">
						<div>gst_percent :</div> {gst_percent}
					</div>
				</div>
			);
		});
	}, [productData]);

	return (
		<div className="max-w-7xl">
			{RenderProductData}
			<h2 className="mt-8 w-full border-t-2 border-gray-200 pt-4 font-medium text-neutral-700">
				base_kcash_amount : {base_kcash_amount}
			</h2>
			<h2 className="mt-2 w-full  border-gray-200 font-medium text-neutral-600">
				kcash_to_purchase : {kcash_to_purchase}
			</h2>
			<h2 className="mt-2 w-full  border-gray-200  font-medium text-neutral-600">
				total_kcash_required : {total_kcash_required}
			</h2>
			<h2 className="mt-2 w-full  border-gray-200  font-medium text-neutral-600">tax : {tax}</h2>
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
