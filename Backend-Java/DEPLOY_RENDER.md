# Deployment Guide: Java Spring Boot Backend to Render

This guide explains how to deploy the Java Spring Boot backend located in `Backend-Java/` to Render.

## Prerequisites
1. A **GitHub** account with your code pushed to a repository.
2. A **Render** account (Sign up at [render.com](https://render.com/) using your GitHub account).

---

## Step-by-Step Deployment

### Step 1: Create a New Web Service on Render
1. Log in to your [Render Dashboard](https://dashboard.render.com/).
2. Click the blue **New +** button in the top right and select **Web Service**.
3. Under **Connect a repository**, select your GitHub repository. (If you don't see it, click *Configure GitHub App* to grant Render permission to read your repositories).

### Step 2: Configure the Service Settings
Fill in the deployment form with the following details:

* **Name**: `online-resource-request-backend` (or any name you prefer)
* **Region**: Choose the region closest to you (e.g., `Singapore` or `Oregon`)
* **Branch**: `main` (or whatever branch contains your latest code)
* **Root Directory**: `Backend-Java`  *(This is critical! It tells Render to build inside the Java subfolder instead of the workspace root).*
* **Runtime**: `Docker` or `Java`. Select **Java**.
* **Build Command**: `mvn clean package -DskipTests`
* **Start Command**: `java -jar target/backend-java-0.0.1-SNAPSHOT.jar`
* **Instance Type**: Select the **Free** tier.

### Step 3: Add Environment Variables
Before clicking deploy, scroll down and click **Advanced** to add your database and API credentials. Click **Add Environment Variable** and add the following keys and values:

| Key | Value |
|---|---|
| `MONGODB_URI` | `mongodb+srv://adhithyanms:adhi%40123@cluster0.0047sok.mongodb.net/ORRS?retryWrites=true&w=majority&appName=Cluster0` |
| `JWT_SECRET` | `devconnect_jwt_secret_key_2024_secure_token` |
| `CLOUDINARY_CLOUD_NAME` | `dpwtohaz0` |
| `CLOUDINARY_API_KEY` | `555746737368663` |
| `CLOUDINARY_API_SECRET` | `QicpAD2347iApB_NxirYDsuEz6U` |

*(Note: Spring Boot will automatically detect the `PORT` variable set by Render, so you do not need to add it manually).*

### Step 4: Deploy the App
1. Click **Create Web Service** at the bottom of the page.
2. Render will spin up an environment, run the Maven build command, compile your Java files, and start the Spring Boot application.
3. Once the build completes, the logs will show:
   `Tomcat started on port 10000 (http) with context path ''`
4. Copy the live Web Service URL provided at the top left of the Render dashboard (e.g., `https://online-resource-request-backend.onrender.com`).

---

## Step 5: Update the Frontend
Once your backend is deployed, you must update the React frontend to communicate with the new Java backend URL:

1. Open [`Frontend/.env`](file:///p:/Online-Resource-Request-System/Frontend/.env) (or your hosting dashboard like Vercel if you deployed the frontend).
2. Change the `VITE_API_URL` to point to your new Render URL:
   ```env
   VITE_API_URL=https://online-resource-request-backend.onrender.com
   ```
3. Commit and push/redeploy the frontend.
