# SplitWise Clone

A full-stack web application for splitting expenses among friends and groups, built with React and Node.js.

## Features

- **User Authentication**: Register, login, and secure user sessions
- **Group Management**: Create groups, invite members, and manage group settings
- **Expense Tracking**: Add expenses with multiple split options:
  - Equal split among all members
  - Split by exact amounts
  - Split by shares/percentages
- **Settlement Calculation**: Automatic calculation of who owes whom
- **Payment Tracking**: Mark settlements as paid
- **Responsive Design**: Modern UI that works on all devices

## Tech Stack

### Backend
- Node.js with Express.js
- MongoDB with Mongoose
- JWT for authentication
- bcryptjs for password hashing

### Frontend
- React 18
- React Router for navigation
- Tailwind CSS for styling
- Axios for API calls
- React Hot Toast for notifications
- Lucide React for icons

## Prerequisites

- Node.js (v14 or higher)
- MongoDB (local installation or MongoDB Atlas)
- npm or yarn

## Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/SplitWebApp.git
   cd SplitWebApp
   ```

2. **Install dependencies**
   ```bash
   npm run install-all
   ```

3. **Set up environment variables**
   
   Copy the example environment files and configure them:
   ```bash
   # Backend environment
   cp server/env.example server/.env
   
   # Frontend environment (optional)
   cp client/env.example client/.env
   ```
   
   Edit `server/.env` with your configuration:
   ```env
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/splitwise
   JWT_SECRET=your_jwt_secret_key_here
   NODE_ENV=development
   ```

4. **Start MongoDB**
   
   Make sure MongoDB is running on your system. If using MongoDB Atlas, update the `MONGODB_URI` in your `.env` file.

5. **Run the application**
   ```bash
   npm run dev
   ```

   This will start both the backend server (port 5000) and frontend development server (port 3000).

## Deployment

This application can be deployed to various platforms:

- **GitHub Pages**: Frontend only (see [Deployment Guide](DEPLOYMENT.md))
- **Vercel**: Full-stack deployment (recommended)
- **Netlify**: Frontend with serverless functions
- **Heroku**: Full-stack deployment
- **Railway**: Full-stack deployment

For detailed deployment instructions, see [DEPLOYMENT.md](DEPLOYMENT.md).

## Usage

1. **Register/Login**: Create an account or login with existing credentials
2. **Create Groups**: Set up groups for different activities (roommates, trips, etc.)
3. **Add Members**: Invite friends to your groups via email
4. **Add Expenses**: Record expenses and choose how to split them
5. **Track Settlements**: View who owes whom and mark payments as complete

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user

### Groups
- `GET /api/groups` - Get user's groups
- `POST /api/groups` - Create new group
- `GET /api/groups/:id` - Get group details
- `PUT /api/groups/:id` - Update group
- `POST /api/groups/:id/members` - Add member to group
- `DELETE /api/groups/:id/members/:userId` - Remove member from group

### Expenses
- `GET /api/expenses/group/:groupId` - Get group expenses
- `POST /api/expenses` - Create new expense
- `PUT /api/expenses/:id` - Update expense
- `DELETE /api/expenses/:id` - Delete expense

### Settlements
- `GET /api/settlements/group/:groupId` - Get group settlements
- `GET /api/settlements/user/:userId` - Get user's settlements
- `PUT /api/settlements/:id/pay` - Mark settlement as paid

## Project Structure

```
SplitWebApp/
├── client/                 # React frontend
│   ├── public/
│   ├── src/
│   │   ├── components/     # Reusable components
│   │   ├── context/        # React context providers
│   │   ├── pages/          # Page components
│   │   ├── utils/          # Utility functions
│   │   └── index.js
│   └── package.json
├── server/                 # Node.js backend
│   ├── config/            # Database configuration
│   ├── middleware/        # Express middleware
│   ├── models/           # Mongoose models
│   ├── routes/           # API routes
│   ├── index.js          # Server entry point
│   └── package.json
└── package.json          # Root package.json
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

If you encounter any issues or have questions, please open an issue on GitHub.
