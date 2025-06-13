# 💪 Vibe_Gym – Web-Based Fitness Management System

**Vibe_Gym** is a modular, component-driven PHP & MySQL web application built for academic purposes.  
It simulates a real-world gym management system, with client-side interactions, media assets, and a lightweight backend API.

---

## 📌 Overview

This project was developed using modern WAMP stack tooling:

- Local server environment: **Laragon 6.0**
- Backend: **PHP 8.4.7**, **MySQL 8.4.5**
- Server: **Apache 2.4.63**
- GUI DB Client: HeidiSQL_12.10_64
- Frontend: Plain **HTML, CSS, JS** with modular components

It is structured to **separate public and private logic**, organize front-end assets by component/page, and follow best practices in environment configuration and modular code reuse.

---

## 🚀 Getting Started

To run **Vibe_Gym** locally using Laragon:

### 1. Clone the Repository

    git clone https://github.com/chfreis/vibe_gym_release.git

### 2. Configure Environment

    Place the project folder inside Laragon’s web root:
    C:\laragon\www\vibe_gym

    Launch Laragon and ensure Apache & MySQL are running.

### 3. Import the Database

    Open HeidiSQL

    Connect to 127.0.0.1 (default: root, no password)

    Create a new database named: vibe_gym

    Import:

    \vibe_gym\database\vibe_gym_dbscript.sql

### 4. Set Environment Variables

    Copy and edit the .env file:

    \vibe_gym\private\backend\.env

    Example:
    DB_HOST=localhost
    DB_NAME=vibe_gym
    DB_USER=root
    DB_PASS=*****

### 5. Run the App

    Access it via:
    http://localhost/vibe_gym/public/index.html

### 6. 🗂️ Project Structure
🔒 Private (Server-side logic)

    /private
    ├── backend
    │   ├── .env                      # Environment variables
    │   ├── api-router.php           # Entry point for API requests
    │   ├── config/
    │   │   ├── constants.php
    │   │   ├── db-session.php
    │   │   └── env-loader.php
    │   ├── handlers/
    │   │   └── customer-handler.php
    │   └── helpers/
    │       ├── data-validators.php
    │       └── request-utils.php
    

🌐 Public (Frontend & assets)

    /public
    ├── index.html
    ├── my-profile.html
    ├── plans.html
    ├── signup.html
    
    ├── api/
    │   └── entrypoint.php           # Public endpoint bridging to backend
    
    ├── components/
    │   ├── access-modal.html
    │   ├── confirm-modal.html
    │   ├── navbar.html
    │   └── user-register-form.html
    
    ├── assets/
    │   ├── images/
    │   └── videos/
    
    ├── css/
    │   ├── main.css
    │   ├── layout.css
    │   ├── animations.css
    │   ├── media.css
    │   ├── components/
    │   │   ├── access-modal.css
    │   │   ├── confirm-modal.css
    │   │   ├── navbar.css
    │   │   └── user-register-form.css
    │   └── page-specific/
    │       ├── index.css
    │       ├── my-profile.css
    │       ├── plans.css
    │       └── signup.css
    
    ├── js/
    │   ├── page-setup.js
    │   ├── my-profile.js
    │   ├── api/
    │   │   └── customer-requests.js
    │   ├── components/
    │   │   ├── access-modal.js
    │   │   ├── confirm-modal.js
    │   │   ├── navbar.js
    │   │   └── user-register-form.js
    │   └── tools/
    │       ├── form-utils.js
    │       ├── screen-debug.js
    │       └── status-toast.js

### 7. 📸 Key Features

    ✅ User registration with validation

    ✅ Modular front-end components (navbar, modals, forms)

    ✅ Responsive design with dedicated CSS per page/component

    ✅ Structured API-like backend routing (api-router.php)

    ✅ Environment-based config loading


### 8. ⚠️ Academic Use Disclaimer

    All trademarks, logos, images, names, or brand references used in this project belong to their respective owners.
    They are used strictly for educational, academic, and demonstration purposes in a simulated environment.
    This project is not affiliated with, sponsored by, or representative of any real gym or brand.

### 9. 📄 License

    Distributed under the MIT License.
    
### 10.🙏 Acknowledgments

    Built with Laragon, Apache, PHP, MySQL, and raw frontend stack.

    Inspired by real gym web platforms for academic UI/UX modeling.

    Thanks to the open-source tools used during development.

    
