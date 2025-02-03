# Typeface.ai Assignment 🚀

### Steps to run locally
Prerequisite to run locally is ![Docker](https://www.docker.com/) and ![Docker Compose](https://docs.docker.com/compose/).

##### Clone this repo
```bash
git clone https://github.com/srn08/typeface-asgn.git
cd typeface-asgn
```
##### Run Docker Compose Command
```bash
docker-compose up -d
```
##### Navigate to localhost with browser `http://localhost:3000`


Here is the video demonstration:



https://github.com/user-attachments/assets/ef3f0625-2a6a-4f5b-b53c-6eac6835ccf8

### **🚀 Restaurant Finder Web App**

A **Full-Stack Web Application** built with **React (Frontend) & FastAPI (Backend)** using **SQLite Database**, containerized with **Docker**,and deployed on **Azure**. This app allows users to:  
✅ **Browse restaurants with pagination**  
✅ **Search restaurants within a radius of a location**  
✅ **Find restaurants by name**  
✅ **Upload food images to discover matching cuisines & restaurants**

---

## **🌟 Features**

### 📌 **1. Paginated Restaurant Listings**

- The app contains **9500+ restaurants** in the database.
- Implements **server-side pagination** for smooth browsing.

### 📌 **2. Search Restaurants by Location**

- Users can search for restaurants **within a given radius** of a location.
- Uses **latitude & longitude** with SQL spatial queries for filtering.

### 📌 **3. Search Restaurants by Name**

- Find restaurants **by name** with a **case-insensitive** search.
- Uses **SQL `LIKE` query** for partial name matching.

### 📌 **4. Upload Food Image & Find Restaurants**

- **Upload an image of food**, and the app will find **restaurants serving similar cuisine**.
- Uses **Cloudinary** to **temporarily store images**, then **Clarifai AI** to recognize the cuisine.
- This method ensures **efficiency & scalability** instead of running an AI model locally.

### 📌 **5. Fully Containerized with Docker 🐳**

- The entire app runs in **Docker containers** for easy deployment.
- Works across **different environments without dependency issues**.

### 📌 **6. 🚀 Deployed on Azure**
- If setting up locally isn't possible, you can access the app via `http://typeface-asgn.centralindia.cloudapp.azure.com/`.
- Runs **FastAPI backend** & **React frontend** seamlessly in the cloud.

---

## **🛠️ Tech Stack**

### **Frontend (React) 🎨**

- **React.js** for UI
- **React Paginate** for smooth pagination
- **CSS / Bootstrap** for styling

### **Backend (FastAPI) ⚡**

- **FastAPI** for high-performance API
- **SQLite** as a lightweight database
- **Raw SQL Queries** for optimized data access
- **Clarifai API** for cuisine recognition from images
- **Cloudinary API** for temporary image hosting

### **Deployment 🌍**
- **Docker**🐳 for containerization
- **Azure** for cloud hosting
