# TAMYCS Shield — Secure PassVault

**Secure Password Manager** — Bachelor 3 Cybersecurity Project (ANSSI compliant)  
ESAIP La Salle — 2026

| Role | Name |
|------|------|
| **Full-Stack Developer** | Oumar Touré |
| **Security Analyst** | Rodney |
| **Backend Developer & Tester** | Fresnel |

---

## What is this project?

TAMYCS Shield is a secure password manager web application. Users can generate strong passwords, store them encrypted in a personal vault, organize them by category, and export them.

The project was built as part of a Secure Programming course and emphasizes security best practices: AES-256-GCM encryption, bcrypt hashing, ANSSI-compliant password policy, JWT authentication, rate limiting, and XSS/CSRF protection.

## Features

- **Password generator** — Random and Memorable modes (entropy display, crack time estimate)
- **Secure vault** — AES-256-GCM encrypted credential storage
- **Secure authentication** — JWT + bcrypt (12 rounds), ANSSI-compliant master password
- **Categories** — Organize passwords by Social, Email, Banking, Work, Shopping, Other
- **Search & filter** — Real-time search and category filtering
- **Export** — CSV and JSON formats
- **Gamification** — Points and badges system
- **Modern UI** — Inspired by Proton Pass

## Requirements

- **Node.js** v18 or higher
- **MongoDB** (local or Atlas)

## Installation

```bash
# Clone the repository
git clone https://github.com/oumar771/tamycs-shield.git
cd tamycs-shield

# Install dependencies
npm install

# Create the .env file
cp src/.env.example src/.env
# Edit src/.env with your settings

# Start
npm start
```

App runs at `http://localhost:3000`

## Configuration (src/.env)

```
PORT=3000
MONGODB_URI=mongodb://localhost:27017/tamycs-shield
JWT_SECRET=put-a-real-secret-key-here
ENCRYPTION_KEY=put-a-32-char-encryption-key-here
NODE_ENV=development
```

**Important**: In production, always change `JWT_SECRET` and `ENCRYPTION_KEY`, and set `NODE_ENV=production`.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Backend | Node.js + Express |
| Database | MongoDB + Mongoose |
| Authentication | JWT (Bearer token) |
| Encryption | AES-256-GCM (Node.js crypto) |
| Password hashing | bcrypt (12 rounds) |
| Security headers | Helmet |
| Rate limiting | express-rate-limit |
| Input validation | express-validator |
| Frontend | Vanilla HTML/CSS/JS |

## API Routes

### Public
| Method | URL | Description |
|--------|-----|-------------|
| POST | /api/auth/register | Create account |
| POST | /api/auth/login | Login |

### Protected (JWT required)
| Method | URL | Description |
|--------|-----|-------------|
| GET | /api/passwords | List passwords |
| POST | /api/passwords | Add password |
| PUT | /api/passwords/:id | Update password |
| DELETE | /api/passwords/:id | Delete password |
| POST | /api/generator/generate | Generate one password |
| POST | /api/generator/multiple | Generate suggestions |
| POST | /api/export/passwords/csv | Export as CSV |
| POST | /api/export/passwords/json | Export as JSON |
| GET | /api/gamification | Get gamification data |

## Security Measures

- Passwords encrypted with AES-256-GCM (never stored in plain text)
- Master password hashed with bcrypt, 12 rounds
- JWT Bearer token authentication
- Rate limiting on login (5 attempts / 15 min)
- ANSSI-compliant password policy (12+ chars, upper, lower, digit, symbol)
- Server-side validation with express-validator
- Security headers with Helmet (CSP, X-Frame-Options, etc.)
- HTML escaping on the client side against XSS
- Generic error messages to prevent user enumeration

## Team Contributions

- **Oumar** — Full-stack implementation, authentication system, frontend UI
- **Rodney** — Security analysis, AES-256-GCM encryption layer, Helmet configuration
- **Fresnel** — Backend API routes, password CRUD, testing and validation

---

Project completed as part of the Secure Programming course — ESAIP 2026
