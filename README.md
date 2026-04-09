# ToppersCrowd Backend

A robust and scalable REST API backend for the **ToppersCrowd (ABCNerd)** learning platform. This service handles user authentication, word management, competitive quizzes, subscriptions, and AI-driven features.

---

## 🚀 Features

-   **Authentication & Authorization**:
    -   JWT-based auth with refresh token rotation.
    -   Email verification and password reset flows with OTP.
-   **Word Management**:
    -   Comprehensive dictionary management with categories, synonyms, and examples.
    -   Advanced filtering, search, and pagination.
-   **Learning & Assessment**:
    -   Dynamic quiz generation and attempt tracking.
    -   Leaderboards with category-wise performance analytics.
    -   User "Notebook" for personalized learning progress.
-   **Monetization & Engagement**:
    -   Stripe-integrated subscription management.
    -   Automated billing and invoice generation.
    -   In-app notifications for milestones and reminders.
-   **Real-time & AI Capabilities**:
    -   Socket.IO integration for live updates.
    -   Integration with Google Gemini AI for content generation.
    -   Background processing with Cron jobs (subscription reminders, etc.).

---

## 🛠️ Tech Stack

-   **Language**: [TypeScript](https://www.typescriptlang.org/)
-   **Framework**: [Express.js](https://expressjs.com/)
-   **Database**: [MongoDB](https://www.mongodb.com/) with [Mongoose](https://mongoosejs.com/)
-   **Caching**: [Redis](https://redis.io/) (via ioredis)
-   **Payments**: [Stripe](https://stripe.com/)
-   **Storage**: [Cloudinary](https://cloudinary.com/) (File uploads)
-   **Real-time**: [Socket.IO](https://socket.io/)
-   **Validation**: [Zod](https://zod.dev/)

---

## 📁 Project Structure

```text
src/
├── modules/             # Primary feature modules
│   ├── usersAuth/       # Authentication, profiles, and social login
│   ├── wordmanagement/  # Dictionary and word entries
│   ├── categoryword/    # Word groupings and categories
│   ├── quiz/            # Quiz definitions and content
│   ├── quizattempt/     # User quiz results and scoring
│   ├── subscription/    # Plans and user subscriptions
│   └── ...              # Notifications, Invoices, Progress, Notebook
├── config/              # Application and environment configuration
├── database/            # DB connection and automated cron jobs
├── helpers/             # Custom error handling and async wrappers
├── middlewares/         # Auth, validation, and rate-limiting
├── utils/               # Shared utilities (apiResponse, constants)
├── app.ts               # Express application setup
└── server.ts            # Entry point for the server
```

---

## ⚙️ Getting Started

### Prerequisites

-   **Node.js**: v18 or later
-   **MongoDB**: Local instance or Atlas URI
-   **Redis**: (Optional) For specialized caching/sessions

### Installation

1.  **Clone the repository**:
    ```bash
    git clone <your-repo-url>
    cd topperscrowd_backend
    ```

2.  **Install dependencies**:
    ```bash
    npm install
    ```

3.  **Environment Setup**:
    -   Copy `.env.example` to `.env`
    -   Fill in the required credentials (MongoDB URI, Stripe Keys, Cloudinary, etc.)
    ```bash
    cp .env.example .env
    ```

### Running Locally

-   **Development**:
    ```bash
    npm run dev
    ```
-   **Production Build**:
    ```bash
    npm run build
    npm run start
    ```

---

## 📜 Available Scripts

| Script | Description |
| :--- | :--- |
| `npm run dev` | Runs the server in development mode with hot-reload. |
| `npm run build` | Compiles TypeScript into the `dist/` directory. |
| `npm run start` | Executes the compiled JavaScript in production. |
| `npm run lint` | Runs ESLint for code quality checks. |
| `npm run prettier` | Formats the codebase using Prettier. |
| `npm run seed:words` | Seeds the database with initial word data. |
| `npm run makemodule` | Scaffolds a new API module (controller, service, model). |

---

## 🔒 Security

-   **Password Hashing**: BCrypt
-   **Rate Limiting**: `express-rate-limit` for DDoS protection.
-   **CORS**: Configured for specific origin access.
-   **Secure Cookies**: HTTP-only cookies for token storage.

---

## 🤝 Support

For technical support or feature requests, please contact the development team at [support@topperscrowd.com](mailto:support@topperscrowd.com).

**Happy Coding!** 🎉