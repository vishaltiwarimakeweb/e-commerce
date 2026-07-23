# Project Overview

- This is an E-commerce full stack web-application named Woozi E-commerce. It has all the features of a basic e-commerce applications such as cart management, orders, catalog, profile management, a static customer support page, searching, sorting, filtering, specific product viewing, authentication, cart only available for logged in users. Product reviewing functionality with images.

# Tech Stack

- **Frontend** : Next.js( App Router ), Typescript, Tailwind CSS, Lucide React, React Toastify
- **Backend** : Next.js ( API Routes ), Typescript
- **Database** : MongoDB + Mongoose
  **Tools** : Redis( for OTP sending/storage & rate-limiting management attempts for OTP entering ), Brevo ( for sending Emails ), Cloudinary ( for media-uploads )

# Frontend Rules

- Dark/Light mode UI using Tailwind CSS.
- Colorful, modern & eye-catching UI of all the pages.
- Optimistic UI updates.
- Toasters with appropriate messages.

# Features :

## Authentication

Authentication is implemented using custom JWT authentication.

- Email & Password registration or OAuth registration.
- OAuth login (Google and GitHub)
- Admin panel for adding/removing/updating products
- Passwords hashed using bcrypt
- Secure JWT authentication
- HTTP-only authentication cookies
- Refresh session through JWT validation
- Forgot password via OTP by using Redis TTL(later phase)

## Cookie Configuration

Authentication token is stored inside a secure cookie.

```ts
{
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
    maxAge: 7 * 24 * 60 * 60 * 1000
}
```

## OTP Rules ( IMPORTANT )

- All OTP and its TTL is stored & managed in Redis.
- OTP is hashed via bcrypt and then stored in Redis as a hashed string.
- Once requested an OTP for any purpose, user can request a new OTP after 90 seconds(TTL), if the user tries before, an error toaster asks the user to wait for remaining seconds.
- Rate limiting is implemented and managed in Redis in such a way that if a user enters incorrect OTP for more than 5 times, the user is blocked from entering and requesting the OTP for 3 minutes and the user is notified via an error toaster.
- Entered OTP by the user is compared by await bcrypt.compare() method as the OTP stored is also a hashed string.
- OTP data lives only in Redis (with TTL) — it never needs a MongoDB collection.

## Cart

- Cart is synced with the backend based upon user's actions.
- The final price calculated in the cart is stored in integer cents for accurate calculations but displayed to the user as usual.
- Add to cart feature is accessible to logged in users only otherwise redirects to sign in page upon clicking.
- Cart line items only reference the product and quantity — price is always read live from the current `Product.price` on display/checkout, since the catalog can change between add-to-cart and checkout. Only a placed **Order** freezes a price snapshot.

## Admin Panel

- Accessible only to the admin account which will be decided via an attribute in the user's model : isAdmin - Boolean, default : false.
- The admin can create/update or delete existing products.
- Deleting a product is a soft delete (`isActive: false`) so past orders and reviews that reference it stay intact — it's just hidden from the catalog.

## Product Catalog

- Multiple product cards with Product's title with a very short description and a thumbnail are visible.
- Search bar, Filtering by category, price & tags.
- Sorting by price, name ( A-Z ).
- `category` is stored as a plain string field on each product (no separate Category collection) — the filter dropdown's option list is derived from the distinct category values already in the Product collection. Keeps the schema minimal until there's an actual need to manage categories independently (icons, ordering, etc.).

## Product page

- All photos of the product are accessible.
- Full description & title.
- Add to cart functionality.
- All tags accessible.
- Customer reviews are accessible.
- Review the product feature with maximum 5 star ratings(mandatory), description(optional) & images(optional).
- One review per user per product (submitting again edits the existing review) — enforced with a unique compound index, so ratings stay meaningful instead of one user stacking multiple reviews.

## Orders

- Order containing all the products's details along with estimated delivery date and the delivery address selected from profile.
- Payment mode : COD/Online, default : COD.
- Payment status : Failed, Pending, Paid, default : Pending ( unless paid ).
- Delivery status : On the way/ Delivered, default : On the way.
- The chosen address and each product's title/thumbnail/price are copied (snapshotted) onto the order at checkout time, so editing/deleting an address or product later never changes the record of a past order.
- The actual online-payment gateway (Razorpay/Stripe/etc.) is not chosen yet — out of scope for phases 0-7, the schema just reserves the fields (`paymentMode`, `paymentStatus`) so it can be wired in later without a schema change.

## User Profile

- Name, Email( required & unique ), age, phone number ( optional but unique )
- Saved addresses : A user can have multiple stored addresses labelled as Home, Work etc.
- Sign Out button exists on the profile page only.

## Customer Support

- A static contact/FAQ page (no database collection). Common questions are hardcoded content; the contact form sends an email to the support inbox via Brevo. No ticket tracking in this build — revisit as its own phase if ticket tracking becomes a real need.

# Pages

- Dashboard ( accessible without logging in also )
- One product page ( accessible without logging in also )
- Customer Support / FAQ page ( accessible without logging in also )
- Register page
- Sign in page
- Navbar ( visible only after logging in ) containing links to other pages : Dashboard, Profile, My Orders, Cart.
- Profile
- My Orders
- Cart
- Admin panel ( admin only : product create/update/delete )

# Database Schemas

MongoDB + Mongoose. Every schema below uses `{ timestamps: true }` for `createdAt`/`updatedAt`. Prices are always stored as **integer cents**. There are 5 top-level collections: `users`, `products`, `reviews`, `carts`, `orders`. Addresses are an embedded subdocument, not their own collection.

## User

```ts
interface Address {
  label: "Home" | "Work" | "Other";
  fullName: string;
  phone: string;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  isDefault: boolean; // default: false
}

interface User {
  name: string; // required
  email: string; // required, unique, lowercase, indexed
  password?: string; // required only when authProvider === "credentials"; select: false
  authProvider: "credentials" | "google" | "github"; // default: "credentials"
  providerId?: string; // OAuth account id, used to link/find the OAuth user
  age?: number;
  phone?: string; // unique, sparse index (optional field, still unique when present)
  isAdmin: boolean; // default: false
  addresses: Address[]; // embedded, not referenced
  createdAt: Date;
  updatedAt: Date;
}
```

- Indexes: `email` (unique), `phone` (unique, sparse), `{ providerId: 1, authProvider: 1 }` for OAuth lookups.
- `password` uses `select: false` so it's never returned by default queries — must be explicitly `.select("+password")` during login.

## Product

```ts
interface Product {
  title: string; // required, text-indexed for search
  shortDescription: string; // required, shown on catalog cards
  description: string; // required, shown on product page
  images: string[]; // required, min length 1, Cloudinary URLs
  price: number; // required, integer cents
  category: string; // required, indexed
  tags: string[]; // indexed
  stock: number; // default: 0
  ratingAverage: number; // default: 0, recalculated on review create/update/delete
  ratingCount: number; // default: 0, recalculated on review create/update/delete
  isActive: boolean; // default: true — false = admin soft-delete, hidden from catalog
  createdAt: Date;
  updatedAt: Date;
}
```

- Indexes: text index on `title` (+ optionally `tags`) for the search bar; `category` and `price` indexed for filter/sort.
- `ratingAverage`/`ratingCount` are denormalized onto the product so the catalog/product page never has to aggregate the `reviews` collection on every read — they're recomputed whenever a review is created, edited, or deleted.

## Review

```ts
interface Review {
  product: ObjectId; // ref "Product", required, indexed
  user: ObjectId; // ref "User", required
  rating: number; // required, 1-5
  description?: string;
  images?: string[]; // Cloudinary URLs
  createdAt: Date;
  updatedAt: Date;
}
```

- Unique compound index on `{ product: 1, user: 1 }` — one review per user per product; re-submitting updates the existing review instead of creating a duplicate.

## Cart

```ts
interface CartItem {
  product: ObjectId; // ref "Product", required
  quantity: number; // required, min 1
}

interface Cart {
  user: ObjectId; // ref "User", required, unique — one cart per user
  items: CartItem[];
  createdAt: Date;
  updatedAt: Date;
}
```

- No price is stored on cart items — price is read live from `Product.price` (populated) whenever the cart is displayed or checked out, so it always reflects the current catalog.

## Order

```ts
interface OrderItem {
  product: ObjectId; // ref "Product", required
  title: string; // snapshot at order time
  thumbnail: string; // snapshot at order time
  price: number; // snapshot at order time, integer cents
  quantity: number; // required
}

interface Order {
  user: ObjectId; // ref "User", required, indexed
  items: OrderItem[];
  shippingAddress: Address; // embedded snapshot copy, not a reference
  totalAmount: number; // required, integer cents
  paymentMode: "COD" | "Online"; // default: "COD"
  paymentStatus: "Pending" | "Paid" | "Failed"; // default: "Pending"
  deliveryStatus: "On the way" | "Delivered"; // default: "On the way"
  estimatedDeliveryDate: Date; // required
  createdAt: Date;
  updatedAt: Date;
}
```

- Indexes: `user` (for "My Orders"), `{ user: 1, createdAt: -1 }` to list a user's orders newest-first.
- Everything under `items` and `shippingAddress` is a copy taken at checkout — later edits to the product catalog or the user's saved addresses must never mutate a past order.

# Architecture Clarifications

- **Pagination**: Product catalog and "My Orders" use simple offset pagination (`page`/`limit` query params), ~16 products per page. No cursor pagination needed at this scale.
- **Image uploads (Cloudinary)**: The backend issues a signed upload signature (API route, DB untouched); the browser uploads the file directly to Cloudinary; the browser then sends only the resulting `secure_url` to our API to persist on the product/review document. Keeps large file bytes off our server while still fitting the Frontend → Database → Response → User flow (the DB write is the URL, not the file).
- **JWT session refresh**: One sliding-expiry cookie (the config already in this doc) — each authenticated request that validates the JWT reissues the same cookie with a renewed `maxAge`. No separate refresh-token collection or Redis entry.
- **Stock on order placement**: Decremented atomically at order creation via a guarded update (`findOneAndUpdate` requiring `stock >= quantity`); if the guard fails the order is rejected before creation, preventing overselling under concurrent checkouts.
- **Order cancellation**: Not in scope for phases 0-7 — not part of the original feature list. Revisit as its own phase if needed later.

# Phase - 0

- Authentication + User onboarding.

# Phase - 1

- Product's catalog via dummy products insertion in the database collection, with search/filter/sort UI.

# Phase - 2

- One product page with all the features (details, images, reviews read + write).

# Phase - 3

- User profile + Profile editing features ( UI and Backend both ), including saved addresses.

# Phase - 4

- Cart management with features.

# Phase - 5

- Order management features.

# Phase - 6

- Admin panel : product create/update/delete (soft delete via `isActive`).

# Phase - 7

- Customer support / FAQ static page with a Brevo-backed contact form.
