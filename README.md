# SocialMediaMarketPlace

## Project Overview
Social Media Marketplace is a platform that connects buyers and sellers in a social media-like environment. Users can post products, interact with others, and make purchases seamlessly.

## Features
- User authentication and verification
- Marketplace for buying and selling products
- Real-time chat functionality
- Admin dashboard for managing users and posts
- Secure payment integration

## Technologies Used
### Backend
- Node.js
- Express.js
- MongoDB

### Frontend
- React.js
- CSS

### Others
- Nginx for server configuration
- PM2 for process management

## Installation
### Prerequisites
- Node.js
- MongoDB

### Steps
1. Clone the repository:
   ```bash
   git clone https://github.com/laxman-gupta1006/SocialMediaMarketPlace.git
   ```
2. Navigate to the project directory:
   ```bash
   cd SocialMediaMarketPlace
   ```
3. Install dependencies for the backend:
   ```bash
   cd backend
   npm install
   ```
4. Install dependencies for the frontend:
   ```bash
   cd ../frontend
   npm install
   ```
5. Start the backend server:
   ```bash
   cd ../backend
   npm start
   ```
6. Start the frontend server:
   ```bash
   cd ../frontend
   npm start
   ```

## Usage
1. Open the frontend in your browser at `http://localhost:3000`.
2. Register or log in to your account.
3. Explore the marketplace, post products, and interact with other users.

## Folder Structure
```
SocialMediaMarketPlace/
├── backend/
│   ├── certs/
│   ├── config/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── uploads/
│   └── utils/
├── frontend/
│   ├── public/
│   └── src/
└── deploy.sh
```

## Architecture

The Social Media Marketplace project is divided into two main components: the backend and the frontend. Below is a detailed explanation of the architecture:

### Backend
The backend is built using Node.js and Express.js. It handles the following functionalities:
- **Authentication and Authorization**: Secure user login and role-based access control.
- **Database Management**: MongoDB is used to store user data, posts, chats, and transactions.
- **API Endpoints**: RESTful APIs are provided for frontend communication.
- **Real-time Communication**: Socket.io is used for real-time chat functionality.
- **Admin Controls**: Admin-specific routes and middleware for managing users and posts.

#### Key Files and Directories
- `server.js`: Entry point for the backend server.
- `routes/`: Contains route files for different functionalities (e.g., `auth.js`, `marketplace.js`).
- `models/`: Defines MongoDB schemas for entities like `User`, `Post`, and `Message`.
- `middleware/`: Includes middleware for authentication and admin verification.
- `config/dbConfig.js`: Database connection configuration.
- `uploads/`: Stores uploaded files such as images.

### Frontend
The frontend is built using React.js. It provides the user interface for interacting with the platform.
- **Component-based Architecture**: React components are used to build reusable UI elements.
- **State Management**: Context API is used for managing global state.
- **Routing**: React Router is used for navigation between pages.
- **API Integration**: Axios is used to communicate with backend APIs.

#### Key Files and Directories
- `src/App.js`: Main application file.
- `src/pages/`: Contains pages like `Home`, `Marketplace`, and `Chat`.
- `src/components/`: Reusable components like `Navbar` and `Footer`.
- `public/`: Static files like `index.html` and images.

### Flow Diagram
Below is a simplified flow of the project:
1. **User Interaction**: Users interact with the frontend.
2. **API Requests**: Frontend sends API requests to the backend.
3. **Backend Processing**: Backend processes the requests, interacts with the database, and returns responses.
4. **Real-time Updates**: Socket.io enables real-time communication for chat and notifications.
5. **Data Storage**: MongoDB stores all data securely.

### Deployment
The project is deployed using Nginx and PM2:
- **Nginx**: Acts as a reverse proxy to handle requests and serve static files.
- **PM2**: Manages the Node.js processes for the backend.

### Security
- **SSL Certificates**: Used for secure communication.
- **Firewall**: Configured using `secure-firewall.sh`.
- **Data Validation**: Middleware ensures data integrity and prevents malicious inputs.

This architecture ensures scalability, security, and a seamless user experience.

## Contributing
1. Fork the repository.
2. Create a new branch:
   ```bash
   git checkout -b feature-name
   ```
3. Make your changes and commit them:
   ```bash
   git commit -m "Description of changes"
   ```
4. Push to your branch:
   ```bash
   git push origin feature-name
   ```
5. Create a pull request.

## License
This project is licensed under the MIT License.
