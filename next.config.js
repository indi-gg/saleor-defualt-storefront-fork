/** @type {import('next').NextConfig} */
const config = {
	env: {
		BASE_API_URL: "https://store-ipwvwuo6.saleor.cloud/graphql/",
	},
	images: {
		remotePatterns: [
			{
				hostname: "*",
			},
		],
	},
	experimental: {
		typedRoutes: false,
	},
	// used in the Dockerfile
	output:
		process.env.NEXT_OUTPUT === "standalone"
			? "standalone"
			: process.env.NEXT_OUTPUT === "export"
				? "export"
				: undefined,
};

export default config;
