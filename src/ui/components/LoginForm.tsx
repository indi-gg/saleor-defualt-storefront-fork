"use client"; // Mark this component as a Client Component


import { useEffect, useState } from "react";
import { useRouter } from "next/navigation"; // Import the useRouter hook from next/navigation

export function LoginForm() {
	const [phoneNumber, setPhoneNumber] = useState("");
	const [otp, setOtp] = useState("");
	const [authCode, setAuthCode] = useState(""); // To store the authCode from the OTP API response
	const [otpSent, setOtpSent] = useState(false); // To track if OTP is sent
	const [loading, setLoading] = useState(false); // To track the loading state
	const [isLoggedIn, setIsLoggedIn] = useState(false); // To track login status
	const router = useRouter(); // Initialize the Next.js router

	// Function to check if the user is already logged in
	useEffect(() => {
		const kgenAccessToken = localStorage.getItem("kgen_accessToken");
		const saleorAccessToken = localStorage.getItem("saleor_accessToken");

		// If both tokens exist, mark the user as logged in
		if (kgenAccessToken && saleorAccessToken) {
			setIsLoggedIn(true);
		}
	}, []);

	// Function to log out the user
	const logout = () => {
		localStorage.removeItem("kgen_accessToken");
		localStorage.removeItem("kgen_refreshhToken");
		localStorage.removeItem("saleor_accessToken");
		localStorage.removeItem("saleor_refreshToken");
		setIsLoggedIn(false); // Update the state
		router.push("/"); // Redirect to the homepage or login screen after logging out
	};

	// Function to request OTP
	const requestOtp = async (event: React.FormEvent) => {
		event.preventDefault();
		setLoading(true);

		try {
			const response = await fetch('https://stage-api-backend.kgen.io/authentication/register', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					'accept': '*/*',
				},
				body: JSON.stringify({
					phone_number: phoneNumber,
					countryCode: '+91', // Update this to be dynamic if needed
				}),
			});

			const data = await response.json();

			if (response.ok && data.authCode) {
				setAuthCode(data.authCode);
				setOtpSent(true); // OTP is sent, now show OTP input
				accountRegister(`${phoneNumber}@email.com`, "password");
				
			} else {
				console.error("Error requesting OTP:", data);
			}
		} catch (error) {
			console.error("Error requesting OTP:", error);
		} finally {
			setLoading(false);
		}
	};

	// Function to verify OTP and log in (or register if needed)
	const verifyOtpAndSignIn = async (event: React.FormEvent) => {
		event.preventDefault();
		setLoading(true);

		try {
			const response = await fetch('https://stage-api-backend.kgen.io/authentication/verify', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					'accept': '*/*',
				},
				body: JSON.stringify({
					phone_number: phoneNumber,
					countryCode: '+91',
					authCode: parseInt(authCode), // Use the stored authCode from the OTP request
					otp: parseInt(otp),
				}),
			});

			const data = await response.json();

			if (response.ok && data.accessToken) {
				// Step 2: After OTP verification, try to log in or register if needed
				await registerAndSignIn(`${phoneNumber}@email.com`, "password", data.accessToken, data.refreshToken);
				router.push("/default-channel");
				
			} else {
				console.error("Error verifying OTP:", data);
			}
		} catch (error) {
			console.error("Error verifying OTP and signing in:", error);
		} finally {
			setLoading(false);
		}
	};

	// If the user is logged in, show the "Already logged in" screen with a logout button
	if (isLoggedIn) {
		return (
			<div className="mx-auto mt-16 w-full max-w-lg">
				<div className="rounded border p-8 shadow-md">
					<h2 className="text-xl font-semibold">You are already logged in!</h2>
					<button
						className="mt-4 rounded bg-red-600 px-4 py-2 text-white hover:bg-red-500"
						onClick={logout}
					>
						Logout
					</button>
				</div>
			</div>
		);
	}

	// If the user is not logged in, show the login form
	return (
		<div className="mx-auto mt-16 w-full max-w-lg">
			<form className="rounded border p-8 shadow-md" onSubmit={requestOtp}>
				<div className="mb-4">
					<label className="sr-only" htmlFor="phoneNumber">Phone Number</label>
					<input
						type="tel"
						name="phoneNumber"
						placeholder="Phone Number"
						className="w-full rounded border bg-neutral-50 px-4 py-2"
						value={phoneNumber}
						onChange={(e) => setPhoneNumber(e.target.value)}
						required
					/>
				</div>
				<button
					className="rounded bg-neutral-800 px-4 py-2 text-neutral-200 hover:bg-neutral-700"
					type="submit"
					disabled={loading}
				>
					{loading ? "Requesting OTP..." : "Get OTP"}
				</button>
			</form>

			{otpSent && (
				<form className="rounded border p-8 shadow-md mt-8" onSubmit={verifyOtpAndSignIn}>
					<div className="mb-4">
						<label className="sr-only" htmlFor="otp">OTP</label>
						<input
							type="text"
							name="otp"
							placeholder="Enter OTP"
							className="w-full rounded border bg-neutral-50 px-4 py-2"
							value={otp}
							onChange={(e) => setOtp(e.target.value)}
							required
						/>
					</div>
					<button
						className="rounded bg-neutral-800 px-4 py-2 text-neutral-200 hover:bg-neutral-700"
						type="submit"
						disabled={loading}
					>
						{loading ? "Verifying OTP..." : "Verify OTP and Log In"}
					</button>
				</form>
			)}
		</div>
	);
}


// Function to register an account and then sign in
async function registerAndSignIn(email: string, password: string, accessToken: string, refreshToken: string) {
	const tokenCreateMutation = `
		mutation {
			tokenCreate(email: "${email}", password: "${password}") {
				token
				refreshToken
				errors {
					field
					message
				}
			}
		}
	`;

	try {
		// Step 1: Try logging in with tokenCreate mutation
		let response = await fetch('http://localhost:8000/graphql/', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({ query: tokenCreateMutation }),
		});

		let result = await response.json();
		console.log('first attempt loging in response:', result);

		if (result.data.tokenCreate.token) {
			localStorage.setItem("kgen_accessToken", accessToken);
			localStorage.setItem("kgen_refreshhToken", refreshToken);
			localStorage.setItem("saleor_accessToken", result.data.tokenCreate.token);
			localStorage.setItem("saleor_refreshToken", result.data.tokenCreate.refreshToken);
			console.log('User logged in successfully:', result.data.tokenCreate.token);

		} else {
			console.error('Login or registration failed:', result.data.tokenCreate.errors);
		}
	} catch (error) {
		console.error('Error during login or registration:', error);
	}
}

// Function to register a user account
async function accountRegister(email: string, password: string) {
	const registerMutation = `
		mutation {
			accountRegister(
				input: {
					email: "${email}",
					password: "${password}",
					channel: "default-channel"
				}
			) {
				errors {
					field
					code
				}
				user {
					email
					isActive
					isConfirmed
				}
			}
		}
	`;

	try {
		const registerResponse = await fetch('http://localhost:8000/graphql/', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({ query: registerMutation }),
		});

		const registerResult = await registerResponse.json();
		console.log('Account registration response:', registerResult);

		if (registerResult.data.accountRegister.errors.length > 0) {
			console.error('Registration errors:', registerResult.data.accountRegister.errors);
			return;
		}

		console.log('Account registered successfully:', registerResult.data.accountRegister.user);
	} catch (error) {
		console.error('Error during account registration:', error);
	}
}
