# Payments & Entitlements Documentation

## Payment Rules
- Payments are processed via Stripe Checkout.
- Successful payment creates entitlements immediately.
- Failed or incomplete payments do not grant access.
- Refunds revoke entitlements at the end of the current access window.

## Entitlement Rules
- Entitlements are scoped to `user_id` + `product_id`.
- Each entitlement includes `access_start` and `access_end`.
- A user can hold multiple entitlements (founders + seasonal access).

### Tier Examples
| Tier | Access Window | Notes |
| --- | --- | --- |
| Founders | Lifetime | Includes all chapters and updates. |
| Season Pass | 12 months | Access to current season only. |
| Trial | 7 days | Limited sample chapters. |

## Webhook Event Matrix
| Stripe Event | Handler Action | Notes |
| --- | --- | --- |
| `checkout.session.completed` | Create entitlement, mark order paid | Primary success path. |
| `invoice.paid` | Extend access window | Subscription renewals. |
| `invoice.payment_failed` | Flag account for retry | Notify user. |
| `customer.subscription.deleted` | Set entitlement `access_end` | End of subscription. |
| `charge.refunded` | Revoke entitlement | Pro-rate if needed. |

## Access Window Logic
- `access_start` defaults to payment success time.
- `access_end` is derived from tier duration or `null` for lifetime.
- If a user purchases a new tier before expiration, extend from the later of now or existing `access_end`.
