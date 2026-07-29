# flask_ecom

A full-stack e-commerce platform with a Flask REST API backend and React frontend. Supports three user roles (admin, seller, customer) with JWT authentication, audit logging, Cloudinary image uploads, and a full order/payment lifecycle.

---

## Tech Stack

**Backend**
- Python / Flask
- PostgreSQL + SQLAlchemy ORM + Flask-Migrate
- JWT authentication (Flask-JWT-Extended)
- Marshmallow for input validation
- Cloudinary for image storage

**Frontend**
- React 19 + Vite
- Tailwind CSS v4
- Axios (with JWT refresh interceptor)
- React Router v7
- shadcn/ui + Radix UI

---

## Features

- **Three-role RBAC** — admin, seller, customer with per-endpoint enforcement
- **JWT auth** — short-lived access tokens (15 min) + long-lived refresh tokens (30 days), auto-refreshed in the frontend via Axios interceptor
- **Product catalog** — create, update, delete, search, filter by category, Cloudinary image upload
- **Cart & wishlist** — per-user cart and wishlist management
- **Orders** — full order lifecycle with stock decrement on creation
- **Payments** — payment records linked to orders with status tracking
- **Reviews** — product reviews with average rating and count endpoints
- **Support tickets** — customers can open tickets; admins can update and close them
- **Audit log** — every create/update/delete action is logged with the acting user
- **Pagination** — all list endpoints support `page` and `limit` query params

---

## Project Structure

```
flask_ecom/
├── app.py                  # App factory, blueprints, error handlers
├── config.py               # Config loaded from .env
├── database.py             # SQLAlchemy instance
├── requirements.txt
│
├── models/                 # SQLAlchemy models
│   ├── user.py, role.py, permission.py, role_permission.py
│   ├── product.py, category.py
│   ├── cart.py, cart_item.py
│   ├── order.py, order_item.py
│   ├── payment.py
│   ├── review.py
│   ├── wishlist.py, wishlist_item.py
│   ├── support_ticket.py
│   └── audit_log.py
│
├── routes/                 # Flask blueprints (one per resource)
├── schemas/                # Marshmallow validation schemas
├── middlewares/
│   ├── auth.py             # jwt_required, role_required decorators
│   └── audit_log.py        # log_action helper
├── utils/
│   ├── cloudinary.py       # Image upload helper
│   └── seed_products.py    # Dev seed script
│
└── client/                 # React + Vite frontend
    └── src/
        ├── pages/
        │   ├── admin/      # Dashboard, Users, Orders, Products, Payments, Audit, Support
        │   ├── seller/     # Dashboard, Products, Orders, Payments
        │   └── customer/   # Home, Cart, Wishlist, Orders, ProductDetails, Ticket
        ├── components/     # Shared UI components + layout shells
        ├── context/        # AuthContext (user, token, login, logout)
        ├── api/            # Axios instance with interceptors
        └── hooks/          # Custom React hooks
```

---

## Getting Started

### Prerequisites

- Python 3.10+
- Node.js 18+
- PostgreSQL
- A [Cloudinary](https://cloudinary.com) account

### Backend setup

```bash
# Clone the repo
git clone https://github.com/m-zaki-237/flask_ecom.git
cd flask_ecom

# Create and activate a virtual environment
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Copy and fill in environment variables
cp .env.example .env
```

Create a `.env` file in the project root:

```env
DATABASE_URL=postgresql://user:password@localhost:5432/flask_ecom
JWT_SECRET_KEY=your-secret-key

CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
```

```bash
# Run migrations
flask db upgrade

# Start the development server
python app.py
```

The API will be available at `http://127.0.0.1:5000`.

### Frontend setup

```bash
cd client
npm install
npm run dev
```

The frontend will be available at `http://localhost:5173`.

---

## API Reference

All authenticated endpoints require an `Authorization: Bearer <access_token>` header.

### Auth

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/user/register` | — | Register a new user |
| POST | `/user/login` | — | Login, returns access + refresh tokens |
| POST | `/user/refresh` | Refresh token | Get a new access token |

### Users

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/users` | admin | List all users |
| GET | `/user/<id>` | any | Get user by ID |
| PATCH | `/user/update/<id>` | any | Update user profile |
| DELETE | `/user/delete/<id>` | admin | Delete a user |

### Products

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/product` | — | List products (supports `?search=`, `?category_id=`, `?page=`, `?limit=`) |
| GET | `/product/<id>` | — | Get product by ID |
| POST | `/product/create` | admin, seller | Create a product (multipart/form-data with image) |
| PATCH | `/product/update/<id>` | admin, seller | Update a product |
| DELETE | `/product/delete/<id>` | admin, seller | Delete a product |
| GET | `/seller/products` | seller | Get the authenticated seller's products |

### Categories

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/categories` | — | List all categories |
| GET | `/category/<id>` | — | Get category by ID |
| GET | `/category/<id>/subcategories` | — | Get subcategories |
| POST | `/category/create` | admin | Create a category |
| PATCH | `/category/update/<id>` | admin | Update a category |
| DELETE | `/category/delete/<id>` | admin | Delete a category |

### Cart

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/cart` | any | Create a cart |
| GET | `/cart/<id>` | any | Get cart with items |
| DELETE | `/cart/<id>` | any | Delete a cart |
| GET | `/cart/<id>/items` | any | List cart items |
| POST | `/cart/<id>/items` | any | Add item to cart |
| PATCH | `/cart/<id>/items/<item_id>` | any | Update cart item quantity |
| DELETE | `/cart/<id>/items/<item_id>` | any | Remove item from cart |

### Orders

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/orders` | any | Create an order (decrements stock) |
| GET | `/orders` | admin | List all orders (paginated) |
| GET | `/orders/<id>` | any | Get order by ID |
| DELETE | `/orders/<id>` | admin | Delete an order |
| PUT | `/orders/<id>/status` | admin, seller | Update order status |
| GET | `/orders/<id>/items` | any | List items in an order |
| POST | `/orders/<id>/items` | admin | Add item to order |
| PATCH | `/orders/<id>/items/<item_id>` | admin | Update order item |
| DELETE | `/orders/<id>/items/<item_id>` | admin | Remove item from order |
| GET | `/users/<id>/orders` | any | Get all orders for a user |
| GET | `/seller/orders` | seller | Get orders containing seller's products |

### Payments

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/payments` | admin | List all payments (paginated) |
| GET | `/payments/<id>` | any | Get payment by ID |
| POST | `/payments/create` | any | Create a payment record |
| PATCH | `/payments/update/<id>` | admin | Update payment status |
| DELETE | `/payments/<id>` | admin | Delete a payment |
| GET | `/seller/payments` | seller | Get payments for seller's products |

### Reviews

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/reviews` | any | Submit a review |
| GET | `/reviews/<id>` | any | Get review by ID |
| PATCH | `/reviews/update/<id>` | any | Update a review |
| DELETE | `/reviews/<id>` | any | Delete a review |
| GET | `/reviews/product/<id>` | — | Get all reviews for a product |
| GET | `/reviews/product/<id>/average` | — | Get average rating |
| GET | `/reviews/product/<id>/count` | — | Get review count |
| GET | `/reviews/user/<id>` | any | Get reviews by a user |

### Wishlist

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/wishlists` | any | Create a wishlist |
| GET | `/wishlists/<id>` | any | Get wishlist |
| DELETE | `/wishlists/<id>` | any | Delete a wishlist |
| POST | `/wishlists/<id>/items` | any | Add item to wishlist |
| DELETE | `/wishlists/<id>/items/<item_id>` | any | Remove item from wishlist |
| GET | `/wishlist/my` | any | Get the current user's wishlist |

### Support Tickets

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/support_tickets` | admin | List all tickets |
| GET | `/support_tickets/<id>` | any | Get ticket by ID |
| POST | `/support_tickets` | any | Open a new ticket |
| PATCH | `/support_tickets/<id>` | admin | Update ticket status |
| DELETE | `/support_tickets/<id>` | admin | Delete a ticket |
| GET | `/my-support-tickets` | any | Get current user's tickets |

### Audit Logs

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/audit_logs` | admin | List all audit logs |
| GET | `/audit_logs/<id>` | admin | Get log by ID |
| GET | `/audit_logs/user/<id>` | admin | Get logs for a specific user |

---

## Role Permissions Summary

| Feature | Customer | Seller | Admin |
|---------|----------|--------|-------|
| Browse products & categories | ✓ | ✓ | ✓ |
| Cart & wishlist | ✓ | ✓ | ✓ |
| Place orders | ✓ | ✓ | ✓ |
| Manage own products | — | ✓ | ✓ |
| View own orders/payments | ✓ | ✓ (own products) | ✓ (all) |
| Update order status | — | ✓ (own products) | ✓ |
| Manage all users | — | — | ✓ |
| View audit logs | — | — | ✓ |
| Manage support tickets | Open only | Open only | ✓ |

---

## Author

**Muhammad Zakria** — [github.com/m-zaki-237](https://github.com/m-zaki-237)