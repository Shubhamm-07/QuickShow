# 🍿 Quick Show - Movie Ticket Booking Platform

![React](https://img.shields.io/badge/react-%2320232a.svg?style=for-the-badge&logo=react&logoColor=%2361DAFB)
![NodeJS](https://img.shields.io/badge/node.js-6DA55F?style=for-the-badge&logo=node.js&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-%234ea94b.svg?style=for-the-badge&logo=mongodb&logoColor=white)
![Docker](https://img.shields.io/badge/docker-%230db7ed.svg?style=for-the-badge&logo=docker&logoColor=white)

A modern, full-stack movie ticket booking web application. Quick Show allows users to browse movies, select theaters and showtimes, choose seats via an interactive map, and seamlessly book tickets. 

## 🎬 Live Demo
**[View Live Project](https://quick-show-eight.vercel.app)**

## ✨ Key Features

**User Experience**
- **Movie Browsing**: Browse current movies with details, ratings, and trailers.
- **Interactive Seat Selection**: Real-time seat map availability to prevent double-booking.
- **Secure Payments**: Integrated Stripe payment gateway for seamless transactions.
- **Smart Notifications**: Automated booking confirmations, new show alerts, and an 8-hour countdown reminder via email.
- **Authentication**: Secure user registration and session management powered by Clerk.

**System Architecture**
- **Containerized Infrastructure**: Fully containerized backend, frontend, and database environments using Docker and Docker Compose.
- **Isolated Networking**: Secure internal bridge networks for microservice communication.
- **Automated Scheduling**: Node-cron implementation for precise, time-delayed email dispatching.

## 🛠️ Technologies Used

- **Frontend**: React.js, Tailwind CSS, Vite, Context API
- **Backend**: Node.js, Express.js
- **Database**: MongoDB (with Docker Volume Persistence)
- **Infrastructure**: Docker, Docker Compose
- **Third-Party Integrations**: Stripe (Payments), Clerk (Auth), NodeMailer (SMTP), TMDB API (Movie Data)
- **Deployment**: Vercel (Frontend), Render (Backend)

## 📱 Screenshots

<img width="1899" height="928" alt="Home Page" src="https://github.com/user-attachments/assets/d0669d8a-aa03-4328-844d-f68b5577e9f8" />
<img width="1761" height="914" alt="Movie Details" src="https://github.com/user-attachments/assets/5075e39d-26b2-4d8e-b6fc-c72cbdde4e8e" />
<img width="1887" height="884" alt="Theater Selection" src="https://github.com/user-attachments/assets/6a43f41b-1226-48f1-ab9b-219422999d1b" />
<img width="1898" height="904" alt="Seat Map" src="https://github.com/user-attachments/assets/060b010e-7098-44ba-838f-70f2126e013a" />
<img width="1849" height="917" alt="Payment Gateway" src="https://github.com/user-attachments/assets/395a3f49-4b41-4efc-872d-ea57803c3600" />
<img width="1335" height="917" alt="Booking Confirmation" src="https://github.com/user-attachments/assets/e4b22170-e777-4609-929b-532e2be32ed7" />

## 🚀 Local Development Setup (Docker)

The easiest way to run this project locally is by using Docker, which will automatically orchestrate the frontend, backend, and database environments.

### Prerequisites
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) installed and running.
- Git

### 1. Clone the repository
```bash
git clone [https://github.com/shubhamm-07/QuickShow.git](https://github.com/shubhamm-07/QuickShow.git)
cd QuickShow
```
### 2. Environment Variables
Create a `.env` file in the `server` directory and populate it with your API keys:

```env
# /server/.env
MONGO_URI=mongodb://mongodb:27017/quickshow
CLERK_PUBLISHABLE_KEY=your_clerk_pub_key
CLERK_SECRET_KEY=your_clerk_secret_key
STRIPE_SECRET_KEY=your_stripe_key
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password
```
### 3. Spin up the Containers
Run the following command from the root directory to build the images and start all services:

```bash
docker compose up -d
```
### 4. Access the App
```bash
Frontend: http://localhost:5173

Backend API: http://localhost:3000
```

To stop the application and clean up resources, run: docker compose down

### 📖 Usage
1. Browse Movies: View current and upcoming movies with details.

2. Select Showtime: Choose your preferred theater and showtime.

3. Choose Seats: Select available seats using the interactive seat map.

4. Secure Payment: Complete payment using the integrated Stripe gateway.

5. Email Confirmation: Receive instant booking confirmation via email.

6. Show Reminders: Get an automated countdown email 8 hours before your show.

7. New Show Alerts: Stay updated with email notifications for newly added movies.



**Shubham Gupta**
- GitHub: (https://github.com/shubhamm-07)
- LinkedIn: (www.linkedin.com/in/shubham-gupta-8173a925a)

   
## 🙏 Acknowledgments

- Movie data provided by [TMDB API](https://www.themoviedb.org/documentation/api)
- Icons from [React Icons](https://react-icons.github.io/react-icons/)
- Deployed on [Vercel](https://vercel.com/)

