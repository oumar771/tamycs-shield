# SecureApp - User Account Management Application

**Secure Programming Project** - Bachelor 3 Cybersecurity  
ESAIP La Salle - 2026

| Role | Name |
|------|------|
| **Full-Stack Developer** | Oumar Touré |
| **Security Analyst** | Rodney |
| **Backend Developer & Tester** | Fresnel |

---

## What is this project?

SecureApp is a web application for managing user accounts. Users can register, log in, edit their profile, and there is an admin panel to manage other users.

The main goal was to apply what we learned in class about security: password hashing, injection protection, session management, etc.

## Requirements

- **Node.js** (v18 or higher)
- **MongoDB** (local or Atlas)

## Installation

```bash
# Clone the repository
git clone https://github.com/oumar771/tamycs-shield.git
cd tamycs-shield/src

# Install dependencies
npm install

# Create the .env file (see below)
cp .env.example .env

# Start the server
npm start
```

The app will be running at `http://localhost:3000`

## Configuration (.env)

Create a `.env` file in the `src/` folder with:

```
PORT=3000
MONGODB_URI=mongodb://localhost:27017/secureapp
JWT_SECRET=put-a-real-secret-key-here
NODE_ENV=development
```

**Important**: In production, always change `JWT_SECRET` and set `NODE_ENV=production` to enable secure cookies.

## Tech Stack

- **Backend**: Node.js with Express
- **Database**: MongoDB (with Mongoose for schemas)
- **Auth**: JWT stored in an httpOnly cookie
- **Hashing**: bcrypt (12 rounds)
- **Security headers**: Helmet
- **Frontend**: Vanilla HTML/CSS/JS (no framework)

## Features

### For all users
- Registration with field validation
- Login / Logout
- Edit name and email
- Change password
- View account security info (last login, etc.)

### For admins
- View list of all users
- Change a user's role (user ↔ admin)
- Delete an account

## How to create an admin?

By default everyone is a "user". To create an admin, update the database manually:

```javascript
// In mongosh or MongoDB Compass
db.users.updateOne(
  { email: "your-email@example.com" },
  { $set: { role: "admin" } }
)
```

## File Structure

```
├── public/
│   ├── css/style.css       # App styles
│   ├── js/app.js           # Frontend logic
│   └── index.html          # Main page (SPA)
└── src/
    ├── controllers/
    │   └── authController.js   # Business logic (register, login, etc.)
    ├── middleware/
    │   ├── auth.js             # JWT verification
    │   ├── rateLimit.js        # Limits login attempts
    │   └── validators.js       # Input validation rules
    ├── models/
    │   └── User.js             # User schema + password hashing
    ├── routes/
    │   └── auth.js             # API route definitions
    ├── utils/
    │   └── jwt.js              # Token generation/verification
    ├── .env.example
    ├── package.json
    └── index.js                # Server entry point
```

## API Routes

### Public routes

| Method | URL | Description |
|--------|-----|-------------|
| POST | /api/auth/register | Create an account |
| POST | /api/auth/login | Log in |
| POST | /api/auth/logout | Log out |

### Protected routes (must be logged in)

| Method | URL | Description |
|--------|-----|-------------|
| GET | /api/auth/me | Get current user info |
| PUT | /api/auth/profile | Update name/email |
| PUT | /api/auth/password | Change password |

### Admin routes

| Method | URL | Description |
|--------|-----|-------------|
| GET | /api/auth/users | List all users |
| PUT | /api/auth/users/:id/role | Change a user's role |
| DELETE | /api/auth/users/:id | Delete an account |

## Security Measures

Full details are in the **Checklist_Securite_Developpeur.pdf**, but in summary:

- Passwords hashed with bcrypt (never stored in plain text)
- JWT token in an httpOnly cookie (not accessible via JavaScript)
- SameSite=strict cookie against CSRF
- Rate limiting on login (5 attempts / 15 min)
- Server-side validation with express-validator
- Security headers with Helmet (CSP, X-Frame-Options, etc.)
- HTML escaping on the client side against XSS
- Generic error messages ("Invalid credentials" instead of "Unknown email")

## Possible Improvements

If we had more time:

- Add 2FA (two-factor authentication)
- A "forgot password" system via email
- Password complexity rules (uppercase, digits, etc.)
- Audit logs for sensitive actions
- A captcha on forms

## Challenges Encountered

- **Oumar**: Initially stored the JWT in localStorage, had to switch to httpOnly cookies (more secure against XSS)
- **Rodney**: Helmet's CSP configuration was tricky — had to allow the right scripts
- **Fresnel**: Rate limiting wasn't working at first because it wasn't applied to the correct route

---

Project completed as part of the Secure Programming course - ESAIP 2026
