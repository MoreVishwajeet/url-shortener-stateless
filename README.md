# 🔗 Stateless URL Shortener with JWT Authentication & RBAC

A full-stack, lightweight **URL Shortener service** built with **Node.js**, **Express.js**, **MongoDB**, **EJS**, and **JWT (JSON Web Token)** for stateless authentication and **Authorization**.

It allows users to register with roles (`NORMAL` or `ADMIN`), generate custom 8-character short URLs, manage their own shortened links, access administrative oversight views, seamlessly redirect to destination targets, and track click metrics with timestamped analytics.

---

## 🚀 Key Features

- 🔐 **Stateless Authentication (JWT)**: Secure user sign-up and login with JWTs stored in HTTP cookies (`uid`), removing server-side session overhead.
- 👥 **Role-Based Access Control (RBAC)**: Flexible role authorization (`NORMAL`, `ADMIN`) using a reusable higher-order middleware `restrictTo(roles)`.
- 👑 **Admin Dashboard & Oversight**: Dedicated admin endpoint (`GET /admins/urls`) allowing administrators to view all shortened links across the entire system.
- 👤 **User-Specific URL Management**: Regular users only see and manage the links they personally created (`createdBy`).
- ✂️ **Custom Short URLs**: Generates unique, compact 8-character nano IDs for long URLs.
- 🔁 **Duplicate URL Handling**: Checks if a URL has already been shortened by the current user to avoid duplicate entries.
- 📊 **Visit Analytics & Tracking**: Automatically logs click timestamps and tracks total visit counts per URL.
- ⚡ **Instant Redirection**: High-performance redirection to target URLs via short IDs.
- 🎨 **Server-Side Rendered UI (EJS)**: Interactive web views for Dashboard (link generator + analytics table), Login, and Signup.
- 🛡️ **Middleware Pipeline**: Global `checkForAuthentication` middleware extracts user identity from JWT cookies on all requests, while `restrictTo` handles granular route protection.

---

## 🛠️ Tech Stack

- **Runtime:** [Node.js](https://nodejs.org/)
- **Web Framework:** [Express.js](https://expressjs.com/) (v5)
- **Database & ODM:** [MongoDB](https://www.mongodb.com/) with [Mongoose](https://mongoosejs.com/) (v9)
- **Authentication & Security:** [jsonwebtoken (JWT)](https://jwt.io/), [cookie-parser](https://www.npmjs.com/package/cookie-parser)
- **Template Engine:** [EJS](https://ejs.co/)
- **ID Generation:** [NanoID](https://github.com/ai/nanoid), [UUID](https://github.com/uuidjs/uuid)
- **Dev Tooling:** [Nodemon](https://nodemon.io/)

---

## 📁 Project Structure

```text
url-shortener-stateless/
├── controllers/
│   ├── url.js            # URL shortening logic, redirection, and analytics
│   └── user.js           # User registration and login handlers
├── middlewares/
│   └── auth.js           # checkForAuthentication & restrictTo(roles) RBAC middlewares
├── models/
│   ├── url.js            # Mongoose schema for shortId, redirectURL, visitHistory, createdBy
│   └── user.js           # Mongoose schema for name, email, password, role
├── routes/
│   ├── staticRouter.js   # UI page routes (GET /, GET /admins/urls, GET /signup, GET /login)
│   ├── url.js            # Protected URL routes (POST /, GET /:shortId, GET /analytics/:shortId)
│   └── user.js           # Auth routes (POST /signup, POST /login)
├── service/
│   └── auth.js           # JWT token generation (with role payload) and verification
├── views/
│   ├── home.ejs          # Dashboard view (URL generator form + links analytics table)
│   ├── login.ejs         # User login page
│   └── signup.ejs        # User signup page
├── connection.js         # MongoDB connection setup
├── index.js              # Server entry point, global middlewares, & route mounting
├── package.json          # Project metadata and dependencies
└── README.md             # Project documentation
```

---

## 🛡️ Authentication & Authorization Architecture

1. **Global Auth Parser (`checkForAuthentication`)**:
   - Runs on every incoming request (`app.use(checkForAuthentication)`).
   - Reads the `uid` cookie, verifies the JWT, and attaches the decoded user object `{ _id, email, role }` to `req.user`.
   - If no token is provided or the token is invalid, `req.user` defaults to `null`.

2. **Role Authorization (`restrictTo(roles)`)**:
   - Higher-order middleware accepting an array of allowed roles (e.g. `restrictTo(["ADMIN"])` or `restrictTo(["NORMAL", "ADMIN"])`).
   - Unauthenticated requests (`!req.user`) are redirected to `/login`.
   - Authenticated requests with unauthorized roles receive an `unauthorized` response.

---

## 📡 API Endpoints & Routes

### 🌐 Web & View Routes (`/`)

| Method | Endpoint | Allowed Roles | Description | Response Type |
| :--- | :--- | :--- | :--- | :--- |
| **GET** | `/` | `NORMAL`, `ADMIN` | User dashboard showing their shortened links | HTML (EJS) |
| **GET** | `/admins/urls` | `ADMIN` | Admin dashboard displaying all shortened URLs across all users | HTML (EJS) |
| **GET** | `/signup` | Public | Renders user signup form | HTML (EJS) |
| **GET** | `/login` | Public | Renders user login form | HTML (EJS) |

### 👤 User Authentication Routes (`/user`)

| Method | Endpoint | Access | Request Body | Response / Action |
| :--- | :--- | :--- | :--- | :--- |
| **POST** | `/user/signup` | Public | `{ name, email, password }` | Creates user (defaults to `NORMAL` role) & redirects to `/` |
| **POST** | `/user/login` | Public | `{ email, password }` | Validates credentials, sets `uid` JWT cookie, & redirects to `/` |

### 🔗 URL Operations & Analytics (`/url`)

*Note: All `/url` routes are protected for `NORMAL` and `ADMIN` roles.*

| Method | Endpoint | Allowed Roles | Description | Request / Params | Response |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **POST** | `/url` | `NORMAL`, `ADMIN` | Generates short URL bound to current user | Body: `{ url: "https://example.com" }` | HTML (EJS with generated ID) |
| **GET** | `/url/:shortId` | `NORMAL`, `ADMIN` | Redirects to destination URL and logs visit timestamp | Param: `shortId` | `302 Found` Redirect |
| **GET** | `/url/analytics/:shortId` | `NORMAL`, `ADMIN` | Fetches click count and visit timestamp history | Param: `shortId` | JSON |

#### Example Analytics Response (`GET /url/analytics/:shortId`)

```json
{
  "totalCkicks": 3,
  "analytics": [
    { "timestamp": 1727622800000 },
    { "timestamp": 1727622850000 },
    { "timestamp": 1727622910000 }
  ]
}
```

---

## 📝 Database Schemas

### 1. User Schema (`models/user.js`)

```javascript
const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    required: true,
    default: "NORMAL" // Options: "NORMAL", "ADMIN"
  }
}, { timestamps: true });
```

### 2. URL Schema (`models/url.js`)

```javascript
const urlSchema = new mongoose.Schema({
  shortId: {
    type: String,
    required: true,
    unique: true,
  },
  redirectURL: {
    type: String,
    required: true,
  },
  visitHistory: [
    {
      timestamp: { type: Number }
    }
  ],
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "users"
  }
}, { timestamps: true });
```

---

## ⚙️ Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v16 or higher)
- [MongoDB](https://www.mongodb.com/try/download/community) running locally on port `27017`

### Installation & Setup

1. **Clone the repository:**
   ```bash
   git clone https://github.com/MoreVishwajeet/url-shortener-stateless.git
   cd url-shortener-stateless
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start MongoDB:**
   Ensure your local MongoDB daemon is active:
   ```bash
   # Windows (via Services or mongod)
   mongod
   ```

4. **Run the server:**
   ```bash
   npm start
   ```

5. **Access the application:**
   Open your browser and navigate to:
   ```text
   http://localhost:8001
   ```
   - Register a new account at `http://localhost:8001/signup`
   - Sign in at `http://localhost:8001/login`
   - Access user dashboard at `http://localhost:8001/`
   - Access admin panel at `http://localhost:8001/admins/urls` *(requires role: `ADMIN`)*

---

## 🤝 Contributing

Contributions, issues, and feature requests are welcome! Feel free to fork the repository and submit a pull request.

---

## 📄 License

This project is licensed under the [ISC License](LICENSE).
