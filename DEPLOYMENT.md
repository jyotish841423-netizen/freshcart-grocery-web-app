# 🌐 Step-by-Step Deployment Guide for FreshCart

This guide explains how to deploy **FreshCart** to the internet for free so anyone with the link can visit and use the website.

---

## 🚀 Recommended Cloud Platforms:
* **Option A: [Vercel](https://vercel.com)** (Instant, Serverless, Super Fast)
* **Option B: [Render.com](https://render.com)** (Standard Python Web Service)
* **Database**: [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) (Free 512MB Cloud MongoDB Cluster)
* **Code Repository**: [GitHub](https://github.com)

---

## Step 1: Push Your Code to GitHub

1. Open PowerShell / Command Prompt in your project folder (`e:\grocery store web application`).
2. Initialize Git and commit your files:
   ```bash
   git init
   git add .
   git commit -m "Initial commit of FreshCart full-stack grocery app"
   ```
3. Go to [github.com](https://github.com) and create a **New Repository** named `freshcart`.
4. Link and push your local code:
   ```bash
   git remote add origin https://github.com/<your-username>/freshcart.git
   git branch -M main
   git push -u origin main
   ```

---

## Step 2: Set Up Free Cloud MongoDB (MongoDB Atlas)

*(If you skip this step, FreshCart will automatically use its built-in in-memory database mock on Render!)*

1. Go to [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas) and sign up for a free account.
2. Click **Create Deployment** and select the **Free Shared (M0)** tier.
3. Choose a cloud provider (AWS) and the region closest to you.
4. **Create a Database User**:
   * Set a Username (e.g., `freshcart_user`) and a Password (e.g., `SecurePassword123!`).
5. **Set Network Access (IP Whitelist)**:
   * Go to **Network Access** → Click **Add IP Address**.
   * Choose **Allow Access from Anywhere** (`0.0.0.0/0`) so Render can connect to it.
6. **Get Connection String**:
   * Click **Database** → **Connect** → **Drivers** (Python).
   * Copy the connection string:
     ```
     mongodb+srv://freshcart_user:<password>@cluster0.abcde.mongodb.net/freshcart?retryWrites=true&w=majority
     ```
   * Replace `<password>` with your actual password.

---

## Step 3A: Deploy on Vercel (Recommended)

1. Go to [vercel.com](https://vercel.com) and log in with your **GitHub** account.
2. On your Vercel dashboard, click **Add New...** → **Project**.
3. Under **Import Git Repository**, find your `freshcart` repository and click **Import**.
4. In the project settings:
   * **Framework Preset**: Leave as **Other** (Vercel automatically detects Python via `vercel.json` and `api/index.py`).
   * **Root Directory**: `./` (default)
5. **Environment Variables** (Optional, for Cloud MongoDB):
   * Expand **Environment Variables**:
     * Name: `MONGO_URI`
     * Value: *Your MongoDB Atlas connection string from Step 2*
     * Name: `SECRET_KEY`
     * Value: `freshcart-secret-key-production`
   *(If not provided, FreshCart runs with its built-in in-memory database mock).*
6. Click **Deploy**.
7. In about 30–60 seconds, Vercel will complete the build and give you your live URL:
   ```text
   https://freshcart-xxx.vercel.app
   ```
   🎉 **You can now share this URL with anyone!**

---

## Step 3B: Deploy on Render.com (Alternative)

1. Sign up / Log in to [render.com](https://render.com) using your GitHub account.
2. Click the **New +** button in the dashboard and select **Web Service**.
3. Choose **Build and deploy from a Git repository** and connect your `freshcart` GitHub repository.
4. Fill in the following settings:
   * **Name**: `freshcart` (or your chosen name)
   * **Region**: Oregon (US West) or Frankfurt (EU)
   * **Branch**: `main`
   * **Runtime**: `Python 3`
   * **Build Command**: `pip install -r requirements.txt`
   * **Start Command**: `gunicorn app:app`
   * **Instance Type**: **Free**
5. **Add Environment Variables (Optional for MongoDB Atlas)**:
   * Click **Environment Variables** → **Add Environment Variable**:
     * Key: `MONGO_URI`
     * Value: *Your MongoDB Atlas connection string from Step 2*
     * Key: `SECRET_KEY`
     * Value: *Any random string (e.g. `freshcart-prod-secret`)*
6. Click **Create Web Service**.
7. Render will build and deploy the app in 1–2 minutes. When it finishes, you will see a public URL like:
   ```
   https://freshcart.onrender.com
   ```
   **Share this URL with anyone!**

---

## ⚡ Alternative: Share Instantly from Your Computer (No Cloud Setup)

If you only need to show the website to someone **right now** while it's running on your computer:

1. Download **[ngrok](https://ngrok.com/download)** (free).
2. Open a terminal and run:
   ```bash
   ngrok http 5000
   ```
3. ngrok will give you an instant public forwarding link like:
   ```
   Forwarding: https://abc-123.ngrok-free.app -> http://localhost:5000
   ```
4. Send that `https://...` link to anyone. As long as your computer is on and `python app.py` is running, they can open the website from their phone or computer!
