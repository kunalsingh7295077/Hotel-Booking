# booKit.com - Hotel Booking Website

booKit.com is a web-based Hotel Booking Website that allows users to view available properties, make bookings, and manage their reservations. The project is built using React for the frontend and Node.js with Express for the backend.

## Features

- View available properties with details such as name, destination, price and facilities.
- Book properties for your special occassion.
- View and manage booking history.
- Admin functionality to manage your properties, users, and bookings.

## Tech Stack

- **Frontend:**

  - React
  - Tailwind

- **Backend:**
  - Node.js
  - Express
  - MongoDB (Database)
  - Mongoose (ODM)

## Prerequisites

Before you begin, ensure you have the following installed:

- Node.js: [Download Node.js](https://nodejs.org/)
- MongoDB: [Download MongoDB](https://www.mongodb.com/try/download/community)

## Getting Started

1. **Clone the Repository:**

   ```bash
   git clone https://github.com/Shikherr04/booKit.com
   ```


2. **Install Dependencies:**

   #### Navigate to the project directory
   
   ```bash
   cd "booKit.com"
   ```
   
   #### Install frontend dependencies

   ```bash
   cd booKit.com
   npm install
   ```
   
   #### Install backend dependencies

   ```bash
   cd ..
   npm install
   ```
   

4. **Configure Environment Variables:**
   Create a .env file in the backend directory.
   Add the following environment variables:

   ```bash
   PORT=4000
   MONGO_URL=your_mongodb_connection_string
   JWT_SECRET = set_your_own_JWT_SECRET_KEY
   ```
   

5. **Run the Application:**

   #### Start the backend server
  
   ```bash 
   cd ..
   nodemon index.js or node index.js
   ```
  
   #### Start the frontend development server
  
   ```bash
   cd booKit.com
   npm run dev
   ```
  
5. **Access the Application:**
   Open your browser and visit `http://localhost:5173` to access the web application.

6. **Project Structure:**
   <br />
   booKit.com/: Contains the React frontend code. <br />
   api/: Contains the Node.js and Express backend code.
