/**
 * Billing feature flag.
 *
 * Set to true when Stripe is wired and team subscriptions are live.
 * While false, the team creation flow bypasses the payment gate so the
 * product can be used and tested without payment infrastructure.
 *
 * Teams pricing: $9/user/month via Stripe Checkout
 * Personal garden: always free
 */
export const BILLING_ENABLED = false;

export const TEAM_PRICE_PER_USER_MONTH = 9; // USD
