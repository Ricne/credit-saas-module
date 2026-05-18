# Credit SaaS

## Run Project

### 1. Clone project

git clone <repo-url>

cd credit-saas

### 2. Create `.env`

#### Linux / Mac

cp .env.example .env

#### Windows PowerShell

copy .env.example .env

### 3. Run Docker

docker compose up --build

---

# URLs

Frontend:

http://localhost:5173

Backend:

http://localhost:8000

Swagger:

http://localhost:8000/docs

---

# Test Accounts

## Admin

[user@example.com](mailto:user@example.com)

123456

## User

[buyer@example.com](mailto:buyer@example.com)

123456

---

# Reset Database

docker compose down -v

docker compose up --build
