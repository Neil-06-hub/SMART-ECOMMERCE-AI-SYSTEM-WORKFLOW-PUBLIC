# System Requirements Specification

**Project:** SMART ECOMMERCE AI SYSTEM
**Version:** 2.2.0
**Date:** 2026-04-01
**Course:** Môn Học Năm 4 - HK2
**Status:** Approved
**Language:** English

---

## Table of Contents

1. [Business Requirements](#1-business-requirements)
2. [Functional Requirements](#2-functional-requirements)
3. [Non-Functional Requirements](#3-non-functional-requirements)
4. [User Stories](#4-user-stories)
5. [Constraints & Assumptions](#5-constraints--assumptions)
6. [Out of Scope — Phase 1](#6-out-of-scope--phase-1)
7. [Summary](#7-summary)

---

## 1. Business Requirements

### 1.1 Core Problem Statement

Traditional e-commerce platforms are failing on two core fronts: shoppers must search for relevant products themselves across a catalog of thousands of SKUs with no personalization support, leading to high bounce rates and low conversion rates; meanwhile, marketing teams must perform customer segmentation and draft campaign content manually, consuming significant human resources while campaign effectiveness cannot be accurately measured. This system addresses both problems simultaneously by integrating an AI recommendation engine that personalizes the shopping experience and AI marketing automation that automates the entire campaign lifecycle from segmentation to delivering optimized content — all with the goal of increasing revenue and retaining customers without linearly increasing operational costs.

### 1.2 Business Goals

| Goal ID | Objective | Measurement Metric | Target (Phase 1) |
|---|---|---|---|
| BG-01 | Increase purchase conversion rate | Conversion rate (visits → purchase) | >= 3.5% |
| BG-02 | Improve AI Recommendation effectiveness | CTR on AI recommendations | >= 5% |
| BG-03 | Increase average order value | Average Order Value (AOV) | +15% vs. baseline |
| BG-04 | Reduce marketing costs | Acquisition cost per returning customer | -20% vs. manual campaigns |
| BG-05 | Improve email campaign effectiveness | Email open rate | >= 20% |
| BG-06 | Reduce cart abandonment rate | Cart abandonment rate | <= 65% |
| BG-07 | Improve admin operational efficiency | Time to process 1 order by admin | -30% vs. baseline |

### 1.3 User Personas

---

#### Persona 1 — Buyer

**Description:** End user, aged 18–45, shops online frequently across multiple devices. Includes both anonymous guests and registered account holders.

**Goals:**
- Find relevant products quickly without spending time browsing endlessly
- Receive the right offers at the right time for products they care about
- Know order status without needing to contact support
- Consistent shopping experience on both mobile and desktop

**Pain Points:**
- Overwhelmed by irrelevant products on the homepage
- Multi-step checkout process requiring repeated data entry
- No notifications when a favorite product drops in price or comes back in stock
- Generic marketing emails unrelated to actual needs

**Key Needs:**
- Smart search that understands Vietnamese, with quick filters
- Personalized AI recommendations on the homepage and product pages
- Fast checkout with saved addresses and payment methods
- Real-time order status notifications

---

#### Persona 2 — Seller / Product Manager

**Description:** Internal staff responsible for managing the product catalog, pricing, and inventory. Has domain knowledge but no deep technical skills.

**Goals:**
- Upload and update products in bulk quickly
- Always be aware of inventory status so items never go out of stock unknowingly
- Understand which products are selling well to make pricing and promotion decisions

**Pain Points:**
- Must create each product/variant manually when the catalog is large
- No automatic alerts when stock is running low
- Lacks insight into why a product has many views but a low conversion rate

**Key Needs:**
- Bulk CSV import/export with automatic variant generation
- Automatic inventory alerts with configurable thresholds
- Product performance reports: views, add-to-cart rate, conversion rate

---

#### Persona 3 — Marketing Manager

**Description:** Responsible for digital marketing strategy, user behavior analysis, and conversion rate optimization. Comfortable with marketing tools but does not know how to code.

**Goals:**
- Create and automate marketing campaigns targeting the right audience
- Use AI to save time on content creation
- Accurately measure ROI for each campaign

**Pain Points:**
- Manual customer segmentation takes days of effort
- Generic email content results in low open rates
- Does not know the best time to send notifications to each customer group
- A/B test results must be calculated manually in a spreadsheet

**Key Needs:**
- Automatic AI segmentation (RFM) + custom segment builder
- LLM content generation for email subjects, bodies, and push notifications
- Send-time optimization that predicts the best send time for each user
- A/B test dashboard with automatic statistical significance calculation

---

#### Persona 4 — Admin / System Administrator

**Description:** System administrator managing the entire platform: users, permissions, operational monitoring, and incident response.

**Goals:**
- System runs stably with immediate awareness of any issues
- Clear role-based access control so no one exceeds their permissions
- Sufficient audit evidence when investigating incidents

**Pain Points:**
- Lack of visibility into AI service performance
- Logs scattered across multiple locations, making root cause analysis difficult
- No fast rollback mechanism when a deployment has issues

**Key Needs:**
- Centralized monitoring including AI model metrics
- Detailed role-based access control with a complete audit trail
- Health dashboard and alerting when metrics exceed thresholds

---

## 2. Functional Requirements

> **Format:** `- [ ] **FR-[MODULE]-[ID]** \`Priority\`: [Detailed description]`
> **Priority:** `Must` = mandatory before demo | `Should` = important, implement if time allows | `Could` = nice-to-have
> Each FR is clear enough for a developer to implement without further clarification.
> No specific technology is mentioned here (see `TECH_STACK.md`).
> **Total Must: 21 | Should: 27 | Could: 10**

---

### 2.1 FR-AUTH — Authentication & User Module

- [ ] **FR-AUTH-01** `Must`: Account registration via email and password — the system validates the email format, enforces password policy (minimum 8 characters, at least 1 uppercase letter, 1 digit, 1 special character), sends a verification email containing a one-time link that expires after 24 hours; the account is only activated after email verification is successful.
- [ ] **FR-AUTH-02** `Should`: Registration and login via OAuth providers (Google, Facebook) — the system receives the authorization code, exchanges it for an access token from the provider, creates a new internal account if the email does not already exist or links to an existing account if the email matches; the provider's password is never stored in the system.
- [ ] **FR-AUTH-03** `Could`: Two-factor authentication (2FA) — supports TOTP (authenticator apps such as Google Authenticator) and SMS OTP (6 digits, expires after 5 minutes); users enable/disable 2FA in security settings; after 5 consecutive incorrect OTP entries, login is locked for 15 minutes and an email notification is sent.
- [ ] **FR-AUTH-04** `Must`: Session management — issues an Access Token (short-lived, configurable TTL) and a Refresh Token (long-lived, stored in an HTTP-only Secure cookie); supports a "logout from all devices" feature that revokes all Refresh Tokens; users can view a list of active sessions (device, IP, last login time) and revoke individual sessions.
- [ ] **FR-AUTH-05** `Should`: Forgot password and reset — the user enters their email, the system sends a reset link containing a one-time token that expires after 1 hour; after the password is successfully changed, the token is immediately invalidated and all current Refresh Tokens are revoked; a success message is displayed regardless of whether the email exists (prevents email enumeration).
- [ ] **FR-AUTH-06** `Should`: Personal profile management — users can edit their display name, phone number (validate Vietnamese format), and avatar (upload image file; the system resizes and crops to a standard size server-side); manage up to 5 delivery addresses (province/city, district, ward, specific address, recipient name, recipient phone); one address can be set as the default.
- [ ] **FR-AUTH-07** `Could`: Loyalty Points system — every completed order (COMPLETED status) earns points at a configurable rate (e.g., 1 point per 10,000 VND); points can be redeemed for discount vouchers (e.g., 100 points = 10,000 VND); users view a full points history with timestamp, reason for earning/spending, points changed, and balance after each transaction; points do not expire in Phase 1.
- [ ] **FR-AUTH-08** `Should`: Wishlist — logged-in users can add/remove products (by product ID, regardless of variant), view the full wishlist with current price and stock status, and move all in-stock wishlist items to the cart in a single action; the wishlist is stored persistently tied to the account.

---

### 2.2 FR-CATALOG — Catalog & Search Module

- [ ] **FR-CATALOG-01** `Must`: Full product CRUD — required fields: product name, short description (plain text), long description (rich text supporting heading/bold/list/image), list price, SKU, status (draft / active / inactive); optional fields: sale price, barcode, brand, tags (max 20 tags), images (max 10 images per product, supporting bulk upload with automatic resizing to standard dimensions); admin can preview the product page before publishing.
- [ ] **FR-CATALOG-02** `Must`: Multi-level category management (Category Tree) — tree structure up to 3 levels deep (e.g., Fashion > Men > Shirts); CRUD category with name, slug (auto-generated from name, customizable), description, cover image, display order; products can belong to multiple categories; categories have meta title and meta description for SEO.
- [ ] **FR-CATALOG-03** `Should`: Product variant management — admin defines attribute groups (e.g., Size with values S/M/L/XL; Color with Red/Blue/White); the system automatically generates a matrix of all combinations as individual SKUs; each SKU has its own price, inventory, and image; the matrix editor UI allows bulk price/stock setting by row/column.
- [ ] **FR-CATALOG-04** `Must`: Full-text search with Vietnamese language support — search by product name, description, SKU, tags, and brand name; handles Vietnamese diacritics (searching "ao so mi" matches "áo sơ mi"); supports fuzzy search for common typos; results are ranked by a relevance score combined with popularity; p95 response time < 300ms.
- [ ] **FR-CATALOG-05** `Should`: Advanced filters — available filters: category (multi-select), price range (range slider with min/max), rating (>= X stars), brand (multi-select), in-stock status (toggle), custom attributes per category (e.g., Size only shown when filtering Fashion); multiple filters combined using AND logic; filter state is reflected in URL query parameters for bookmarking and sharing.
- [ ] **FR-CATALOG-06** `Should`: Result sorting — sorting options: price ascending, price descending, newest, best-selling, highest rated, AI relevance (for logged-in users only); default: AI relevance for logged-in users, best-selling for guests; sort order is preserved when filters are changed.
- [ ] **FR-CATALOG-07** `Must`: Product detail page — displays: image gallery with thumbnails and hover zoom, variant selector that updates price/stock/image in real time when selected, "Out of Stock" badge when stock = 0, countdown timer if a flash sale is active, breadcrumb navigation reflecting the category path, structured data markup (JSON-LD Schema.org/Product) for SEO.
- [ ] **FR-CATALOG-08** `Should`: Reviews and ratings — only users who have successfully purchased the product (order in COMPLETED status) may write a review; rating 1–5 stars, optional short title, optional body text, up to 5 attached images; the product page displays average rating, total review count, and a star distribution histogram; admin can hide/delete policy-violating reviews with a reason note; reviews are sorted by newest and most helpful (based on upvotes).
- [ ] **FR-CATALOG-09** `Should`: Inventory management — admin updates stock per variant; automatic alerts (email/dashboard notification) when any variant's stock falls below a configurable threshold (default: 10); "Out of Stock" status is set automatically when stock = 0, and automatically reverts to "In Stock" when stock > 0; stock movement history with timestamp, reason for change, and actor.
- [ ] **FR-CATALOG-10** `Could`: Flash Sales & Time-limited Promotions — admin creates a promotion with: name, discount type (percentage or fixed amount), start and end time (accurate to the second), applicable to specific products or an entire category; the product page shows the original price crossed out, the discounted price, and a countdown timer to the end; the promotional price automatically takes effect and expires at the configured time without manual intervention.

---

### 2.3 FR-CART — Cart, Checkout & Payment Module

- [ ] **FR-CART-01** `Must`: Cart management — add products to the cart with the selected variant and quantity, update the quantity of individual items, remove individual items or clear the entire cart; the cart of a logged-in user is stored persistently on the server; when a user logs in after having an anonymous cart, the system merges them (preserves items from both, adds quantities if the same product appears in both); the total updates in real time when quantities change.
- [ ] **FR-CART-02** `Should`: Coupon/Voucher application — the user enters a code, the system simultaneously validates: code exists, is within the valid period, meets all conditions (cart total >= minimum value, applicable products/categories, user has not exceeded the per-user usage limit); displays the discount amount clearly; if invalid, displays a specific reason (expired / already used / conditions not met).
- [ ] **FR-CART-03** `Should`: Shipping fee calculation — when the user enters a delivery address (or selects a saved address), the system calculates the shipping fee based on the destination province/city and the total order weight; displays multiple shipping methods with different prices and estimated delivery times (e.g., Standard 3–5 days / Express 1–2 days); displays the free shipping threshold and the amount still needed to qualify.
- [ ] **FR-CART-04** `Must`: Multi-step checkout flow — steps: (1) Delivery address, (2) Shipping method, (3) Payment method, (4) Order confirmation; the user can go back to a previous step without losing data already entered; the confirmation step displays in full: item list, address, shipping method, fees, discounts, and total; progress is shown via a step indicator.
- [ ] **FR-CART-05** `Must`: Multi-method payment — supports: (1) COD (Cash on Delivery): order is created immediately, payment on delivery; (2) QR Pay via domestic gateway (adapter for Momo, VNPay): displays a QR code, the system polls or receives a webhook to confirm; (3) International cards (Visa/Mastercard) via payment gateway: redirect to the payment gateway page, receive result via callback URL; payment status is updated automatically via webhook, no page reload required from the user.
- [ ] **FR-CART-06** `Must`: Instant order confirmation — immediately after an order is successfully created, the system sends a confirmation email containing: order ID, product list with images and prices, delivery address, payment method, total amount, estimated delivery time, and an order tracking link; if the user provided a phone number, also send a summary SMS.
- [ ] **FR-CART-07** `Could`: Saved Payment Methods — the user can choose to save a payment method after a successful transaction; the card/account number is tokenized through the payment gateway, and the system only stores the token and last 4 digits (no raw data stored); next time the user selects a saved method and only needs to confirm (no re-entry required); the user can delete any saved method at any time.
- [ ] **FR-CART-08** `Should`: Payment error handling — if the payment gateway returns an error or times out, the order stays in PENDING_PAYMENT status and stock is not deducted; a clear error message and reason (if provided by the gateway) is displayed; the user can retry with the same method or choose a different method without re-entering order information; after 30 minutes with no payment, the order is automatically cancelled and the cart is restored.

---

### 2.4 FR-ORDER — Order Management Module

- [ ] **FR-ORDER-01** `Must`: Order lifecycle — 6 statuses: `PENDING_PAYMENT` → `PAID` → `PROCESSING` → `SHIPPED` → `DELIVERED` → `COMPLETED`; additionally, three off-flow statuses: `CANCELLED`, `RETURN_REQUESTED`, and `REFUNDED`; each transition records: new status, time, actor (user / admin / system), optional notes; stock is deducted when transitioning to PAID; stock is restored when CANCELLED or when a return is approved.
- [ ] **FR-ORDER-02** `Should`: Order tracking — user views the tracking page from the link in the email or from "My Orders"; displays: a visual timeline of completed and upcoming steps, current status, tracking number and carrier name, a deep-link to the carrier's tracking page (if integrated); status updates in real time via webhook from the logistics partner when available.
- [ ] **FR-ORDER-03** `Should`: Status change notifications — the system automatically sends notifications when an order transitions to key statuses: PAID (order confirmed/paid), SHIPPED (out for delivery with tracking number), DELIVERED (delivered), CANCELLED (cancelled); notification channels: email (mandatory) + SMS (if phone number is available); email content uses a customizable template that auto-fills order information; admin can send manual notifications with custom notes.
- [ ] **FR-ORDER-04** `Should`: Order cancellation — users can cancel when the order is in PENDING_PAYMENT or PAID status; admin can cancel any order before it reaches SHIPPED status; on cancellation: stock is restored immediately; if already paid, a refund request is created automatically; a cancellation reason is required (dropdown + free-text note); the user receives a cancellation confirmation email.
- [ ] **FR-ORDER-05** `Should`: Refunds — a refund is created automatically when a paid order is cancelled, or manually by admin after approving a return request; supports full or partial refunds (enter a specific amount); refund methods: back to the original payment method (processed via payment gateway) or to the loyalty points balance (credited immediately); refund status: PENDING → PROCESSING → COMPLETED / FAILED; the user receives an email notification of the refund result.
- [ ] **FR-ORDER-06** `Could`: Returns & Exchanges — users create a return request within N days (configurable, default 7 days) after the order reaches DELIVERED status; must select a reason (defective item / wrong product / not as described / changed mind) and upload at least 1 proof image; admin reviews and approves/rejects with a reason note; if approved: a return shipping label is created, status is updated to REFUNDED, and stock is incremented after the return is received.
- [ ] **FR-ORDER-07** `Must`: Order management (Admin) — admin views an order list with filters by: status, order date (range picker), order value, payment method, and sales channel; sort by date and value; view individual order details; manually update status with a note; print packing slips containing: order ID, product list, delivery address, and barcode; add internal notes (not visible to users).
- [ ] **FR-ORDER-08** `Should`: Order history (User side) — user views all placed orders, filter by status, search by order ID or product name; view order details: all products, price at time of purchase, delivery address, payment method, status timeline; "Reorder" feature: add all products from a previous order to a new cart in one action (out-of-stock products are skipped and the user is notified).

---

### 2.5 FR-REC — AI Recommendation Engine Module

> Full pipeline: Data Collection → Feature Store → Model Training → Inference Serving → Cold-Start → A/B Testing → Feedback Loop → Monitoring

- [ ] **FR-REC-01** `Must` [Data Collection]: Behavioral event collection — the system records all interaction events: `page_view`, `product_view`, `search_query`, `add_to_cart`, `remove_from_cart`, `purchase`, `review_submit`, `wishlist_add`, `recommendation_impression`, `recommendation_click`; each event contains: `user_id` (or `session_id` for guests), `item_id`, `event_type`, `timestamp` (UTC), `context` (current page, device type, source placement); events are sent asynchronously from the frontend — no waiting for a response, no UI slowdown; the client automatically retries if the request fails.
- [ ] **FR-REC-02** `Must` [Feature Store]: Feature engineering and storage — a periodic batch job (default every 1 hour) computes from raw events: (a) User features: purchase history vector, category affinity scores (interaction frequency by category), price sensitivity (typical price range purchased), recency (date of last interaction), frequency (number of interactions in the last 30 days), monetary (total spending); (b) Item features: category embedding, popularity score (views and purchases in the last 7 days), average rating, price tier; (c) Sparse user-item interaction matrix; features are stored in the feature store with versioning to ensure reproducible training.
- [ ] **FR-REC-03** `Must` [Model Training — CF]: Collaborative Filtering training — uses an available ML library (Surprise, LightFM, implicit or equivalent) to train a Matrix Factorization model on the user-item interaction matrix from the feature store; training schedule: default once per day during off-peak hours (configurable); after each training run, the new model is automatically evaluated on an offline test set with metrics: precision@10, recall@10, NDCG@10; the new model is only promoted to production if all metrics are >= the current model's (no regression); model artifacts and metadata (training date, dataset version, metrics) are saved in a model registry.
- [ ] **FR-REC-04** `Should` [Model Training — CBF]: Content-Based Filtering training — uses available embedding and similarity computation libraries (scikit-learn, sentence-transformers or equivalent) to compute an item similarity matrix based on product attributes: category embedding (one-hot encoded category path), text embedding of the description, tag overlap, price range similarity; the similarity matrix is rebuilt when new products are added (trigger-based) or on a daily schedule; similarity scores are stored in a cache for fast inference.
- [ ] **FR-REC-05** `Must` [Inference Serving — Hybrid API]: Hybrid Recommendation API — endpoint accepts: `user_id` (or `session_id`), `context` (current page, `item_id` if viewing a specific product), `n` (number of recommendations to return), `exclude_item_ids` (list to exclude); returns: a prioritized list of item_ids with explanation scores; final score = alpha × CF_score + (1-alpha) × CBF_score (alpha is configurable); results are cached per user_id with a configurable TTL (default 10 minutes); response time p95 < 200ms (cache hit), p99 < 500ms (cache miss).
- [ ] **FR-REC-06** `Must` [Inference Serving — Placements]: Recommendation display placements — the system supports 5 independent placements, each calling FR-REC-05 with different context: (1) **Homepage Feed**: N personalized products for logged-in users; (2) **Similar products** on the Product Detail Page: CBF-heavy, excludes the current product; (3) **Frequently bought together** in Cart: based on co-purchase patterns, shows products commonly bought with cart items; (4) **Search personalization**: reranks search results according to user preference; (5) **Email recommendation block**: daily batch inference, no real-time requirement; each placement has configurable item counts and business rule overrides (prioritize products needing a sales push, exclude out-of-stock products).
- [ ] **FR-REC-07** `Must` [Cold-Start]: New user handling — when a user has fewer than 3 interactions (since account creation or a new guest session): fallback strategy in priority order: (1) Category preferences from an onboarding survey (if the user completed it at registration), (2) Trending products in the last 7 days (site-wide), (3) Top-rated products in the category being browsed; after the user accumulates at least 3 interactions, the system automatically switches to the hybrid model on the next request without any user action.
- [ ] **FR-REC-08** `Could` [A/B Testing]: A/B testing recommendation strategies — the system supports running up to 3 strategies in parallel; users are assigned to groups randomly and consistently (the same user always falls into the same group throughout the test duration); traffic allocation is configurable by percentage (e.g., 20%/80%); per-group metrics are recorded: impression count, CTR, conversion rate, revenue per user; admin views results in real time, manually declares a winner or sets an auto-promote threshold; changing traffic allocation does not require a service redeploy.
- [ ] **FR-REC-09** `Should` [Feedback Loop]: Feedback collection and processing — explicit negative feedback: user clicks "Don't show me this type" or reports an inappropriate recommendation; the system removes that item from the user's recommendation list immediately (real-time blocklist, no waiting for model retraining); simultaneously records the negative signal in training data for the next retraining run; implicit feedback (no clicks on a recommendation after many impressions) is also recorded with a lower weight.
- [ ] **FR-REC-10** `Should` [Monitoring]: Recommendation performance monitoring — dashboard displays: (a) Online metrics (updated hourly): CTR by placement, conversion rate from recommendations, revenue attributed to recommendations (last-click), impression count; (b) Offline metrics (updated after each training run): precision@10, recall@10, NDCG@10 over time; (c) System metrics: inference latency p50/p95/p99, cache hit rate, feature store freshness (lag between event occurrence and feature update); automatic alerts when: CTR drops > 20% vs. 7-day baseline, inference latency p95 > 500ms, feature freshness > 3 hours.

---

### 2.6 FR-MKTG — Marketing Module

- [ ] **FR-MKTG-01** `Should` [RFM Segmentation]: Customer segmentation using RFM — the Marketing Manager clicks "Recalculate RFM" to trigger an on-demand calculation (not automated on a schedule); the system analyzes the customer base by Recency (days since last purchase), Frequency (number of purchases in the last 12 months), Monetary (total spending in the last 12 months) and assigns each user to one of 7 standard segments (Champions / Loyal Customers / Potential Loyalists / At Risk / Can't Lose Them / Hibernating / Lost); admin views the user distribution by segment as charts and tables; click a segment to view the list of users.
- [ ] **FR-MKTG-02** `Should` [Custom Segmentation]: Create custom segments with a Rule Builder — a drag-and-drop interface lets the Marketing Manager build custom segments by combining conditions: behavioral (viewed products in category X in the last N days, has/has not purchased from category Y, has items in wishlist, has an order in progress), attribute-based (total spending >= X, purchase count >= Y, registered within Z days, address in a specific province/city); conditions can be combined with AND/OR; a real-time preview of matching user count is shown before saving; segments are recalculated on a schedule or on-demand.
- [ ] **FR-MKTG-03** `Must` [Campaign Builder]: Create and manage campaigns — a campaign includes: name, description, target segment (selected from RFM or custom segments), channel (email), run schedule (start date / end date); campaign statuses: Draft → Scheduled → Running → Paused → Completed; admin can pause/resume a running campaign; duplicate a campaign to reuse its configuration; history of all campaigns with summary metrics.
- [ ] **FR-MKTG-06** `Could` [Basic Personalization]: Email templates support basic dynamic variables: `{{name}}`, `{{email}}`, `{{segment}}`; the Marketing Manager can preview the rendered email with a specific user's data before sending.
- [ ] **FR-MKTG-09** `Should` [Email Delivery]: HTML campaign email delivery — send HTML emails with a plain-text fallback, a tracking pixel for open rate, and UTM parameters for click tracking; one-click unsubscribe in the email footer per CAN-SPAM standard; bounces and complaints automatically add addresses to a suppression list and no further emails are sent. (Push notifications and SMS are not in scope for Phase 1.)
- [ ] **FR-MKTG-10** `Should` [Campaign Analytics]: Campaign performance reporting — per-campaign dashboard: sent count, delivery rate (%), open rate (%), CTR (%), conversion rate (%), revenue attributed (last-click model), unsubscribe rate (%); timeline chart: metrics per day throughout the campaign run; compare metrics across campaigns in the same time period; compare metrics across segments receiving the campaign; export report as CSV; retention tracking: did users who received the campaign return to make a purchase within 30 days.

---

### 2.7 FR-ANALYTICS — Analytics & Dashboard Module

- [ ] **FR-ANALYTICS-01** `Must`: Real-time Business Dashboard — admin/manager views a dashboard with widgets updated in real time (polling every 60 seconds or via server-sent events): today's revenue (amount and % comparison with yesterday), new orders, new user registrations, GMV (Gross Merchandise Value), users currently online; each metric has a 24-hour sparkline; prominent alerts for anomalous metrics (revenue drops > 30% vs. 7-day average).
- [ ] **FR-ANALYTICS-02** `Should`: Revenue Reporting — revenue analysis by dimensions: (a) Time: day, week, month, year, custom date range; (b) Product category; (c) Specific products (top N); (d) Payment method; line/bar charts with drill-down capability (click a month to see daily detail); displays: gross revenue, discounts, net revenue, order count, AOV, new vs. returning customers; export Excel/CSV with all data.
- [ ] **FR-ANALYTICS-03** `Should`: User Behavior Analysis — funnel visualization: Visitors → Product Viewed → Add to Cart → Checkout Started → Order Placed; shows count and drop-off rate at each step; breakdown by device type (mobile/desktop/tablet); top 20 most-viewed products and conversion rate per product; top search queries and their click-through rate; session duration heatmap.
- [ ] **FR-ANALYTICS-04** `Could`: Search Analytics — list of top queries by volume in the selected time range; no-result queries with their occurrence count — used to add tags/products; queries that lead to purchases (high-converting queries); click-through rate from search results; admin uses this data to improve the search index and product tagging; export the no-result queries list for the catalog team to action.
- [ ] **FR-ANALYTICS-05** `Should`: AI Recommendation Performance Dashboard — displayed metrics: total CTR and CTR per placement (Homepage Feed, PDP Similar, Cart FBT, Search), conversion rate from recommendations, revenue attributed to recommendations, coverage (% of catalog items recommended at least once in 7 days — a measure of popularity bias), diversity score (average pairwise distance between recommended items); offline metrics after each training run: precision@10, recall@10; charts over time; compare metrics across A/B test groups.
- [ ] **FR-ANALYTICS-06** `Must`: User Management & RBAC — 5 system roles: Super Admin (full access), Product Manager (catalog + inventory), Marketing Manager (marketing + analytics), Data Analyst (read-only analytics + recommendation metrics), Customer Support (view orders + user profiles, no editing); Super Admin creates staff accounts, assigns roles, and disables accounts; every permission is enforced server-side; the UI automatically shows/hides menus and action buttons based on role.
- [ ] **FR-ANALYTICS-07** `Should`: Audit Log — records all significant admin/staff actions in an immutable log: who (user ID + email), what (action type), on which resource (resource type + resource ID), what changed (before/after JSON diff for update operations), when (UTC timestamp), from where (IP address, user agent); the log cannot be deleted or modified (append-only); search and filter UI by user, action type, resource type, and time range; CSV export; stored for at least 90 days.
- [ ] **FR-ANALYTICS-08** `Could`: Product Reports — top-selling products (by revenue and by quantity) in the selected time range; slow-moving inventory (products with stock > 0 but no sales in X days); out-of-stock frequency (number of occurrences and total time out of stock in 30 days); return rate per product (% of orders returned / total orders); admin views and exports reports; automatic alerts for products approaching the low-stock threshold displayed in the dashboard.

---

## 3. Non-Functional Requirements

### 3.1 Performance

| Metric | Target | Notes |
|---|---|---|
| Page load time | p95 < 2 seconds | Measured as Time to Interactive on a 4G connection |
| API response latency — standard endpoints | p95 < 200ms | Typical CRUD operations (product, cart, user) |
| API response latency — complex queries | p99 < 500ms | Complex filter + sort + pagination |
| AI Recommendation inference | p95 < 200ms | Cache hit — result already cached |
| AI Recommendation inference | p99 < 500ms | Cache miss — real-time computation |
| Search latency | p95 < 300ms | Full-text search with combined filters |
| Overall throughput | >= 500 req/s | Sustained load, no performance degradation |
| Concurrent users | >= 1,000 users | Simultaneous active sessions with no latency impact |
| Background job (batch inference) | Completes within < 2 hours | Batch recommendations for email campaign with 100k users |

### 3.2 Scalability

| Metric | Target | Notes |
|---|---|---|
| Web tier scaling strategy | Horizontal scale-out with stateless instances | Session state not stored in-process; uses distributed cache |
| AI service scaling | Scale out independently from the web tier | AI inference service is fully decoupled |
| Database strategy | Read replica ready when needed | Schema has no blockers for future sharding |
| Cache hit rate — recommendation | >= 80% | Per-user cache with 10-minute TTL |
| Cache hit rate — product catalog | >= 90% | Product data cache with 1-hour TTL |
| Event ingestion throughput | >= 10,000 behavioral events/minute | Async pipeline, does not block web requests |
| Data volume resilience | System operates stably with 10x data growth | No major migration required when scaling |
| Message queue backpressure | Queue does not overflow during traffic spikes | Consumer auto-scales or queue buffer is sufficiently large |

### 3.3 Security

| Metric | Target | Notes |
|---|---|---|
| Authentication mechanism | Token-based: short-lived access token + long-lived refresh token | Refresh token stored in HTTP-only Secure cookie |
| Password storage | One-way hash with salt, adaptive cost factor | No plaintext stored; MD5 and SHA1 are not permitted |
| Data encryption in transit | TLS 1.2 minimum, TLS 1.3 preferred | All endpoints and internal service communication |
| Sensitive data at rest | Encryption equivalent to AES-256 | Payment tokens, PII fields (phone number, address) |
| Rate limiting — authentication | Max 10 attempts/minute per IP | Hard lockout 15 minutes after 5 consecutive failed attempts |
| Rate limiting — general API | Max 100 requests/minute per authenticated user | Configurable per endpoint group |
| Input validation | 100% of user inputs are sanitized | Prevents SQL Injection, XSS, Command Injection, Path Traversal |
| CORS policy | Explicit origin whitelist | No wildcard `*` in production |
| Security compliance | No Critical or High vulnerabilities | OWASP Top 10 scan before each release |
| Audit logging completeness | 100% of admin actions are logged | Immutable, includes user ID, timestamp, and IP |

### 3.4 Availability & Reliability

| Metric | Target | Notes |
|---|---|---|
| Uptime SLA | >= 99.5% | Equivalent to ~3.6 hours of permitted downtime per month |
| Recovery Time Objective (RTO) | <= 30 minutes | Time to restore operations after an incident |
| Recovery Point Objective (RPO) | <= 1 hour | Maximum 1 hour of data loss in the worst case |
| Graceful degradation — AI service | Fallback to best-seller list within <= 100ms | The entire site is unaffected when the AI service is down |
| Graceful degradation — payment gateway | Clear message displayed, cart preserved | No cart data lost on payment timeout |
| Automated backup | Daily full backup + hourly incremental | Backups stored at a storage location independent of production |
| Deployment rollback | <= 5 minutes | Blue-green or canary deployment strategy |
| Health check | Each service exposes a `/health` endpoint | Used for load balancer routing and monitoring alerts |

### 3.5 AI/ML Specific Requirements

| Metric | Target | Notes |
|---|---|---|
| Recommendation inference latency | p95 < 200ms end-to-end | Includes feature lookup, scoring, and response serialization |
| Click-Through Rate (CTR) | >= 5% | Measured over total recommendation impressions |
| Precision@10 | >= 0.30 | Offline evaluation — measured on a held-out test set |
| Recall@10 | >= 0.20 | Offline evaluation — measured on a held-out test set |
| Cold-start response time | Trending list returned within <= 100ms | Precomputed, no model inference required |
| Model retraining cadence | At least once per day | Batch retraining during off-peak hours |
| Feature store freshness | Maximum 1-hour lag | Time between an event occurring and the feature being updated |
| A/B test minimum sample | >= 1,000 users/group | Before drawing statistical significance conclusions |
| Model promotion gate | Offline metrics >= current model | Do not deploy a new model if precision or recall is lower |
| Catalog coverage | >= 60% of items recommended at least once per week | Measures diversity, avoids excessive popularity bias |

---

## 4. User Stories

> **Format:** `**US-[PERSONA]-[ID]:** As a [persona], I want [action], so that [benefit].`

### 4.1 User Stories — Buyer

**US-BUY-01:** As a buyer, I want to see personalized product recommendations on the homepage based on my browsing and purchase history, so that I can discover products relevant to my taste without spending time manually searching.

**US-BUY-02:** As a buyer, I want to apply multiple filters simultaneously (price range, category, rating, stock availability) and have the URL update to reflect my filter state, so that I can quickly narrow down options and easily share or bookmark my filtered search.

**US-BUY-03:** As a buyer, I want to receive an automatic notification when a product in my wishlist drops in price or comes back in stock, so that I can make a timely purchase decision without having to manually check the product page repeatedly.

**US-BUY-04:** As a buyer, I want to track the real-time status of my order with a clear visual timeline and receive push notifications at each major stage (confirmed, shipped, delivered), so that I always know where my package is without needing to contact customer support.

### 4.2 User Stories — Seller / Product Manager

**US-SELL-01:** As a product manager, I want to receive automatic low-stock alerts (configurable threshold) in the dashboard and via email when any product variant's inventory falls below the threshold, so that I can restock proactively before items go out of stock and cause lost sales.

**US-SELL-02:** As a product manager, I want to view a product performance report showing views, add-to-cart rate, conversion rate, and return rate per product, so that I can identify underperforming products and make data-driven decisions about pricing adjustments, content improvements, or promotions.

**US-SELL-03:** As a product manager, I want to bulk-import products via a CSV file with automatic SKU and variant generation from attribute definitions, so that I can update the entire catalog at scale without manually creating hundreds of individual product listings.

### 4.3 User Stories — Marketing Manager

**US-MKT-01:** As a marketing manager, I want the system to automatically segment the entire customer base using RFM analysis and visually identify "At Risk" customers — those who used to buy frequently but haven't purchased recently, so that I can proactively launch a targeted re-engagement campaign before these customers churn permanently.

**US-MKT-02:** As a marketing manager, I want to use an AI-powered content generator to create 3 variations of an email subject line and body for a campaign by providing only a brief description of the product and target audience, so that I can run meaningful A/B tests without spending hours on copywriting or relying on an external agency.

**US-MKT-03:** As a marketing manager, I want the system to automatically send a personalized abandoned cart email — containing the exact items the user left behind plus an AI-recommended product and a time-limited discount — 1 hour after a user adds items to cart without completing checkout, so that I can recover lost revenue without any manual intervention per campaign.

**US-MKT-04:** As a marketing manager, I want to view a comprehensive analytics dashboard for each campaign showing open rate, CTR, conversion rate, revenue attributed, and statistical significance of A/B test results, so that I can accurately measure ROI, learn what content resonates with each segment, and continuously optimize future strategies.

### 4.4 User Stories — Admin / System Administrator

**US-ADM-01:** As an admin, I want to view a real-time dashboard that consolidates today's revenue, new orders count, new user registrations, AI recommendation CTR, and system health status in a single view, so that I can immediately assess the overall health of the business and technology platform without navigating through multiple separate reports.

**US-ADM-02:** As an admin, I want to assign role-based permissions to staff accounts with fine-grained control (e.g., Customer Support role can view and update order status but cannot modify products or access financial reports), so that I can enforce the principle of least privilege and reduce the risk of accidental or unauthorized changes to critical data.

**US-ADM-03:** As an admin, I want to monitor AI recommendation performance metrics (CTR, precision@10, inference latency p95) in real-time and receive automated alerts when any metric degrades beyond a defined threshold, so that I can detect and investigate model quality issues before they noticeably impact the user experience and conversion rate.

**US-ADM-04:** As an admin, I want an immutable audit log that records every significant admin action — including who performed it, what was changed (before and after values), when it happened, and from which IP address — and allows me to search and filter this log, so that I can investigate any unauthorized changes, maintain accountability, and fulfill compliance requirements.

---

## 5. Constraints & Assumptions

### 5.1 Technical Constraints

- The architecture must be **modular** — whether monolith or microservices, modules must have clear domain boundaries, be independently testable, and be extractable into separate services in the future without a full rewrite.
- **AI services must be decoupled** from the web application layer — communication is through a pure API contract; the web app must never import AI model code directly.
- Every **external service** (payment gateway, email provider, LLM API, SMS provider) must be accessed through an adapter/interface layer — enabling provider swaps without changing business logic.
- **Database schema** must be backward-compatible when upgraded — no destructive migrations (drop column, rename column) once production data exists; only additive changes.
- The **behavioral event pipeline** must be asynchronous (async, fire-and-forget from the web app side) — the web request must not wait for the event to be persisted before returning a response.
- The system must operate correctly when the **AI service is unavailable** — graceful degradation is mandatory, not optional.
- All **API endpoints** must be documented to a standard (OpenAPI 3.0) and must validate input before processing.

### 5.2 Budget & Timeline Constraints

| Constraint | Value | Notes |
|---|---|---|
| Timeline | 16 weeks (1 semester) | Divided into 4 sprints × 4 weeks |
| Team size | 5–8 developers | Assigned by module; each person may own 1–2 modules |
| Infrastructure budget | Prioritize free tier / low-cost cloud | Target: stay within the free tier of cloud providers |
| Payment integration | Sandbox / test mode only | No real money processed in Phase 1 |
| AI training dataset | Synthetic data or a public e-commerce dataset | No real user data available at the start |

**Suggested sprint allocation:**

| Sprint | Weeks | Modules |
|---|---|---|
| Sprint 1 | 1–4 | FR-AUTH, FR-CATALOG, FR-CART |
| Sprint 2 | 5–8 | FR-ORDER, FR-ANALYTICS (MVP), Basic Admin Dashboard |
| Sprint 3 | 9–12 | FR-REC (full AI pipeline), FR-MKTG (segmentation + campaign builder) |
| Sprint 4 | 13–16 | FR-MKTG (email delivery + basic analytics), NFR testing, polish, demo prep |

### 5.3 Third-Party Dependencies

| Dependency | Purpose | Constraint |
|---|---|---|
| Payment Gateway (sandbox) | Test payment processing (FR-CART-05) | Sandbox credentials only, no live |
| Transactional Email Service | Send confirmation and notification emails (FR-CART-06, FR-ORDER-03, FR-MKTG-09) | Free tier sufficient for demo environment |
| SMS Provider | 2FA OTP + order notification SMS (FR-AUTH-03, FR-ORDER-03) | Optional — can be mocked in Phase 1 |
| Object Storage | Store product images, review images, packing slips | Free tier storage or self-hosted |

### 5.4 Demo Scope & Evaluators

**Evaluators:** Professors with deep experience in IT and e-commerce.

**Priority evaluation criteria:**
1. **AI Recommendation quality** — LightFM Collaborative Filtering + TF-IDF CBF must work for real, not just fallback. Precision@10 and Recall@10 must meet the threshold (>= 0.30 and >= 0.20).
2. **Complete e-commerce flow** — Register → Browse → Search → Product Detail → Add to Cart → Checkout → VNPay payment → Order confirmation email.
3. **AnalyticsModule** — Dashboard must display real data from behavioral_events, no mock data.
4. **MarketingModule** — RFM segmentation and campaign email delivery must be functional (using Gmail SMTP nodemailer).

**Actual scale in demo:** ~10–50 concurrent users, ~50–100 emails/day, ~1,000–5,000 behavioral events/day — all within the capacity of the free-tier infrastructure.

**Not required in the demo context:**
- SEO traffic (no real search engine indexing)
- 99.5% SLA (shared free tier has no committed SLA)
- Horizontal scaling (1 Render instance per service is sufficient)
- Real payments (VNPay sandbox only — no real transactions)

---

## 6. Out of Scope — Phase 1

The following features are **NOT** implemented in Phase 1:

- **Live payment processing** — integrating a payment gateway to process real transactions; Phase 1 uses sandbox/test mode only
- **Native mobile application** (iOS/Android) — only a responsive web is built; mobile app will be Phase 2 if applicable
- **Multi-vendor marketplace** — multiple independent sellers with separate seller dashboards, commission management, and payout systems
- **Real logistics integration** — automatic order placement via carrier APIs (Giao Hàng Nhanh, GHTK, etc.), automatic label printing
- **Real-time customer support chatbot** — in-site chatbot with live messaging
- **Blockchain / NFT / Web3 features** — any feature related to blockchain
- **Multi-currency** — only VND is supported; multi-currency is Phase 2
- **Languages beyond Vietnamese and English** — the i18n framework will be prepared, but only 2 languages are supported
- **Subscription / Recurring billing** — periodic payment model
- **Affiliate / Referral program** — affiliate commission tracking and referral links
- **Social commerce features** — shopping directly through social media posts (Instagram Shopping, TikTok Shop)
- **Real-time fraud detection** — ML model scoring transactions in real time to detect fraud
- **Loyalty tier membership** (Gold/Silver/Platinum with different perks) — Phase 1 only has a basic points system (FR-AUTH-07)
- **International shipping** — domestic delivery only (Vietnam)
- Cloudflare CDN proxy (removed — Vercel Edge CDN is sufficient for demo scale)
- Third-party error tracking (Sentry) — replaced by MongoDB error_logs collection
- Resend/SendGrid email API — replaced by Gmail SMTP (nodemailer) for demo scale

---

## 7. Summary

| Category | Module / Group | Count |
|---|---|---|
| Business Goals | — | 7 |
| User Personas | — | 4 |
| **Functional Requirements** | FR-AUTH | 8 |
| | FR-CATALOG | 10 |
| | FR-CART | 8 |
| | FR-ORDER | 8 |
| | FR-REC | 10 |
| | FR-MKTG | 6 |
| | FR-ANALYTICS | 8 |
| **Total Functional Requirements** | | **58** (Must: 21 / Should: 27 / Could: 10) |
| **Non-Functional Requirements** | Performance | 9 |
| | Scalability | 8 |
| | Security | 10 |
| | Availability | 8 |
| | AI/ML Specific | 10 |
| **Total Non-Functional Requirements** | | **45** |
| **User Stories** | Buyer | 4 |
| | Seller / Product Manager | 3 |
| | Marketing Manager | 4 |
| | Admin | 4 |
| **Total User Stories** | | **15** |
| Out of Scope Items | — | 14 |

---

*This document is the foundation for the entire design and development process. All changes must be reviewed by the full team and the version number must be updated.*
*Continue reading: [`TECH_STACK.md`](./TECH_STACK.md) → [`ARCHITECTURE.md`](./ARCHITECTURE.md) → [`MODULE_STRUCTURE.md`](./MODULE_STRUCTURE.md) → [`DATABASE_DESIGN.md`](./DATABASE_DESIGN.md)*
