# Ogaga Enterprise

**Ogaga Enterprise** is a modern service platform that provides **Plumbing**, **Electrical**, and **Solar Energy** solutions, along with a comprehensive **technical training program** for aspiring professionals in these fields.  

The platform allows users to explore available services, register for training programs, make online payments, and receive automated reminders about training milestones and balance payments — all from one seamless web application.

---

## 🔧 Core Services

### ⚡ Electrical Installations
- Residential and commercial wiring
- Maintenance and fault detection
- Inverter and power backup setup
- Smart metering and energy monitoring

### 🔆 Solar Energy Solutions
- Solar panel installation and design
- Battery and inverter integration
- System maintenance and performance checks
- Energy auditing and upgrade recommendations

### 💧 Plumbing Services
- Water supply and pipe installations
- Bathroom, kitchen, and drainage systems
- Leak detection and repair
- Borehole and water tank installations

---

## 🎓 Training Programs

Ogaga Enterprise offers professional hands-on training across the **Electrical**, **Solar**, and **Plumbing** disciplines.  
Each program runs for flexible durations depending on your commitment:

| Duration | Cost (₦) | Payment Mode |
|-----------|-----------|--------------|
| 4 Months  | ₦250,000 | 60% upfront, 40% before graduation |
| 8 Months  | ₦450,000 | 60% upfront, 40% before graduation |
| 12 Months | ₦700,000 | 60% upfront, 40% before graduation |

Trainees learn through practical sessions, supervised field experience, and access to modern tools and equipment.

---

## 🧰 Features

- User registration with passport & guarantor photo upload (via Cloudinary)  
- Secure payment integration via **Paystack**  
- Automated **email reminders** for installment balances  
- Admin dashboard for managing students, payments, and media uploads  
- Gallery for public viewing of uploaded project photos/videos  
- Real-time filtering, pagination, and export to Excel for admin data views  
- Structured API architecture (Node.js & MongoDB)  
- Tailwind CSS frontend with responsive design

---

## 🕓 Automated Reminders (Cron)

The system includes an automatic email reminder feature that runs daily using Vercel’s scheduled functions.

```json
{
  "crons": [
    {
      "path": "/api/admin/reminder",
      "schedule": "0 8 * * *"
    }
  ]
}
````

This triggers the `/api/admin/reminder` endpoint every morning at **09:00 Lagos time (08:00 UTC)** to send payment reminders.

---

## 📫 Contact

**Ogaga Enterprise**
Plumbing • Electrical • Solar Energy • Training
📍 Delta, Nigeria
📧 [ogagaenterprise@gmail.com](mailto:support@ogagaenterprise.com)
🌐 [www.ogagaenterprise.com](https://www.ogagaenterprise.com)

---

> *Ogaga Enterprise – Empowering technical skills, powering a sustainable future.*

