import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { EmptyCartPage } from "../EmptyCartPage";
import { PageNotFound } from "../PageNotFound";
import { useUser } from "../../hooks/useUser";
import { Summary, SummarySkeleton } from "@/checkout/sections/Summary";
import { CheckoutForm, CheckoutFormSkeleton } from "@/checkout/sections/CheckoutForm";
import { useCheckout } from "@/checkout/hooks/useCheckout";
import { CheckoutSkeleton } from "@/checkout/views/Checkout/CheckoutSkeleton";
import EvaluationBox from "@/app/[channel]/(main)/cart/EvaluationBox";

export const Checkout = () => {
	const { checkout, fetching: fetchingCheckout } = useCheckout();
	const { loading: isAuthenticating } = useUser();

	const isCheckoutInvalid = !fetchingCheckout && !checkout && !isAuthenticating;

	const isInitiallyAuthenticating = isAuthenticating && !checkout;

	const isEmptyCart = checkout && !checkout.lines.length;

	return isCheckoutInvalid ? (
		<PageNotFound />
	) : isInitiallyAuthenticating ? (
		<CheckoutSkeleton />
	) : (
		<ErrorBoundary FallbackComponent={PageNotFound}>
			<div className="page">
				{isEmptyCart ? (
					<EmptyCartPage />
				) : (
					<div className="grid min-h-screen grid-cols-1 gap-x-16 lg:grid-cols-2">
						<Suspense fallback={<CheckoutFormSkeleton />}>
							{/* <CheckoutForm /> */}
						</Suspense>
						<Suspense fallback={<SummarySkeleton />}>
							{/* <Summary {...checkout} /> */}
							<div className="mb-6 rounded border bg-neutral-50 px-4 py-2">
								<div className="flex items-center justify-between gap-2 py-2">
									<EvaluationBox checkOutData={checkout} />
								</div>
							</div>
						</Suspense>
					</div>
				)}
			</div>
		</ErrorBoundary>
	);
};
