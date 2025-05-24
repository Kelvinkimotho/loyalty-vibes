# 💈 Loyalty Vibes – A Phone-Based Loyalty Rewards App

🎉 Built for the Vibe Coding Hackathon – #1MillionDevs Movement  
🚀 Theme: *"Building Human-Centered, Joy-Driven Solutions Using AI and Low-Code Tools"*

---

## 📱 Overview

**Loyalty Vibes** is a lightweight, mobile-friendly web app that empowers local salons, barbershops, and eateries to **track customer visits** and **reward loyalty** — all using just phone numbers.  
No complex setups, no hardware, no apps to install — just vibes and value.

---

## 🌟 Problem Statement

> **Local businesses lack systems to retain loyal customers.**  
> Many can't afford or manage traditional loyalty systems, resulting in lost repeat business.

---

## 💡 Solution

We’ve created an easy-to-use loyalty tracking system that:
- Registers customers using just their **phone numbers**
- Automatically **tracks visits** with timestamps
- Rewards customers after a set number of visits (e.g., every 5th visit)
- Notifies staff or customers when a **reward is unlocked**

---

## 🛠️ Tech Stack

| Tool        | Purpose |
|-------------|---------|
| **Supabase**  | Auth, database, and backend |
| **Cursor AI / Rork.app** | Rapid prototyping and frontend |
| **MGX** | Lightning-fast UI design |
| **Bolt.new (optional)** | Backend logic, deployable functions |

---

## 🧱 Database Schema (Supabase)

### `users` Table
| Field         | Type     | Description             |
|---------------|----------|-------------------------|
| `id`          | UUID     | Primary key             |
| `phone_number`| Text     | Unique identifier       |
| `created_at`  | Timestamp | User registration date  |

### `visits` Table
| Field       | Type     | Description                   |
|-------------|----------|-------------------------------|
| `id`        | UUID     | Primary key                   |
| `user_id`   | UUID     | Foreign key to `users`        |
| `visit_date`| Timestamp| Automatically set on visit    |

### `rewards` Table *(Optional)*
| Field       | Type     | Description                 |
|-------------|----------|-----------------------------|
| `id`        | UUID     | Primary key                 |
| `user_id`   | UUID     | Foreign key to `users`      |
| `reward_name`| Text    | e.g. "Free Haircut"         |
| `redeemed`  | Boolean  | Reward claimed or not       |

---

## ⚙️ App Logic

1. **Enter Phone Number**
2. Check if user exists in DB:
   - If not: Create user and log visit
   - If yes: Just log a new visit
3. **Count total visits**
4. **If `visits % 5 === 0` → Show reward notification**

---

## 🎨 UI Design (via MGX)

- **Home Screen** – Enter phone number
- **Visit Summary** – "You have X visits. 1 more for a reward!"
- **Reward Screen** – "🎉 You've earned a reward!"
- **Admin Panel**  – View all customers, visits, and redemptions
---

## 🔐 Security & Fault Tolerance

- Supabase handles auth and data integrity
- Backend code has error handling and validation
- Sensitive logic like visit logging protected from abuse

---

## 🧪 Testing

- Manual testing of user flows
- Simulated phone numbers for demo
- Unit-tested core logic (visit counting, reward logic)

---

## 🚀 How to Run Locally

### 🔧 Prerequisites
- Node.js + npm/yarn
- Supabase project (create free at https://supabase.com)

### 🛠️ Setup

git clone https://github.com/your-username/loyalty-vibes.git
cd loyalty-vibes

# Install dependencies
npm install

# Add your Supabase keys to .env
touch .env

# Environment Variables (.env)
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key

# 🏁 Start the app
npm run dev
