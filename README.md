# 🔗 Stateless URL Shortener with JWT Authentication

A full-stack, lightweight **URL Shortener service** built with **Node.js**, **Express.js**, **MongoDB**, **EJS**, and **JWT (JSON Web Token)** for stateless user authentication. 

It allows users to register, log in, generate custom 8-character short URLs, manage their own shortened links, seamlessly redirect to destination targets, and track click metrics with timestamped analytics.

---

## 🚀 Key Features

- 🔐 **Stateless Authentication (JWT)**: Secure user sign-up and login with JWTs stored in HTTP cookies (`uid`), removing server-side session overhead.
- 👤 **User-Specific URL Management**: URLs are tied to individual user accounts (`createdBy`), ensuring users only view and manage links they created.
- ✂️ **Custom Short URLs**: Generates unique, compact 8-character nano IDs for long URLs.
- 🔁 **Smart Duplicate Prevention**: Reuses existing short IDs if the same user attempts to shorten an identical URL again.
- 📊 **Visit Analytics & Tracking**: Automatically logs click timestamps and tracks total visit counts per URL.
- ⚡ **Instant Redirection**: Fast redirection to original target URLs upon visiting the short link.
- 🎨 **Server-Side Rendered UI (EJS)**: Interactive web views for Home (dashboard/link generator), Login, and Signup.
- 🛡️ **Route Protection & Middleware**: Integrated authentication middleware (`restrictToLoggedinUseOnly`, `checkAuth`) to secure private routes and handle unauthorized access.

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
│   └── auth.js           # Route protection & JWT verification middlewares
├── models/
│   ├── url.js            # Mongoose schema for shortId, redirectURL, visitHistory, createdBy
│   └── user.js           # Mongoose schema for user name, email, password
├── routes/
│   ├── staticRouter.js   # UI page routes (GET /, GET /signup, GET /login)
│   ├── url.js            # Protected URL routes (POST /, GET /:shortId, GET /analytics/:shortId)
│   └── user.js           # Auth routes (POST /signup, POST /login)
├── service/
│   └── auth.js           # JWT token generation (setUser) and verification (getUser)
├── views/
│   ├── home.ejs          # Dashboard view (URL generator form + user URL table)
│   ├── login.ejs         # User login page
│   └── signup.ejs        # User signup page
├── connection.js         # MongoDB connection setup
├── index.js              # Server entry point, middleware setup, & route mounting
├── package.json          # Project metadata and dependencies
└── README.md             # Project documentation
```

---

## 📡 API Endpoints & Routes

### 🌐 Web & Static Routes (`/`)

| Method | Endpoint | Description | Access | Response Type |
| :--- | :--- | :--- | :--- | :--- |
| **GET** | `/` | Dashboard page with URL generator and user's shortened links table | Authenticated | HTML (EJS) |
| **GET** | `/signup` | Renders user signup form | Public | HTML (EJS) |
| **GET** | `/login` | Renders user login form | Public | HTML (EJS) |

### 👤 Authentication Routes (`/user`)

| Method | Endpoint | Description | Request Body | Response / Action |
| :--- | :--- | :--- | :--- | :--- |
| **POST** | `/user/signup` | Creates a new user record in MongoDB | `{ name, email, password }` | Redirects to `/` |
| **POST** | `/user/login` | Authenticates user credentials and sets `uid` JWT cookie | `{ email, password }` | Sets cookie & Redirects to `/` |

### 🔗 URL Management & Analytics (`/url`)

*Note: All `/url` routes require authentication via `restrictToLoggedinUseOnly` middleware.*

| Method | Endpoint | Description | Request Body / Params | Response |
| :--- | :--- | :--- | :--- | :--- |
| **POST** | `/url` | Shortens a URL and binds it to the logged-in user | `{ url: "https://example.com" }` | HTML (EJS with generated ID) |
| **GET** | `/url/:shortId` | Redirects to destination URL and records click timestamp | `shortId` (param) | `302 Found` Redirect |
| **GET** | `/url/analytics/:shortId` | Fetches click count and visit timestamp history | `shortId` (param) | JSON |

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
   Ensure MongoDB service is running locally:
   ```bash
   # Windows (Services or mongod)
   mongod
   ```

4. **Start the Application:**
   ```bash
   npm start
   ```

5. **Open in Browser:**
   Navigate to:
   ```text
   http://localhost:8001
   ```
   - Go to `http://localhost:8001/signup` to register a new account.
   - Log in at `http://localhost:8001/login` to start shortening and tracking URLs.

---

## 🤝 Contributing

Contributions, issues, and feature requests are welcome! Feel free to fork the repository and submit a pull request.

---

## 📄 License

This project is licensed under the [ISC License](LICENSE).
