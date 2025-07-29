# Sportify Backend

<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a>
</p>

<p align="center">
  <h1 align="center">Sportify Backend</h1>
  <p align="center">A modern sports platform backend built with NestJS, TypeScript, and Drizzle ORM</p>
</p>

## Description

Sportify Backend is a comprehensive sports platform API built with the NestJS framework. It provides robust authentication, user management, and sports-related functionalities including facility management, venue operations, and user profiles.

## Tech Stack

- **Framework**: [NestJS](https://nestjs.com/)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **ORM**: [Drizzle ORM](https://orm.drizzle.team/)
- **Package Manager**: [pnpm](https://pnpm.io/)
- **Database**: PostgreSQL
- **Testing**: [Jest](https://jestjs.io/)
- **Code Quality**: ESLint + Prettier

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v18 or higher)
- **pnpm** package manager
- **PostgreSQL** database server

## Installation & Setup

### 1. Clone the Repository

```bash
git clone https://github.com/zainraza2000/sportify-backend.git
cd sportify-backend
```

### 2. Install Dependencies

```bash
pnpm install
```

### 3. Environment Configuration

Create a `.env` file in the root directory:

```bash
cp .env.example .env
```

Edit the `.env` file with your configuration:

```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/sportify_db"

# JWT Configuration
JWT_SECRET="your-jwt-secret-key"
JWT_EXPIRES_IN="7d"

# Server Configuration
PORT=3000

# Other environment variables as needed
```

### 4. Database Setup

Generate and run database migrations:

```bash
# Generate database migrations
pnpm drizzle-kit generate

# Run database migrations
pnpm drizzle-kit migrate

# Optional: Push schema changes directly
pnpm drizzle-kit push
```

## Starting the Development Server

### Development Mode (Recommended)

```bash
pnpm run start:dev
```

The server will start with hot-reload enabled and be available at:
- **API Server**: `http://localhost:3000`
- **Swagger Documentation**: `http://localhost:3000/api/docs`

### Other Start Options

```bash
# Production mode
pnpm run start:prod

# Debug mode (with debugging enabled)
pnpm run start:debug

# Standard start
pnpm run start
```

## Verifying Your Setup

Once the server is running, you can verify everything is working:

1. **Health Check**: Visit `http://localhost:3000` in your browser
2. **API Documentation**: Access Swagger UI at `http://localhost:3000/api/docs`
3. **Database Connection**: Check the console logs for successful database connection

## Development Tools

### Database Management

```bash
# View database in Drizzle Studio
pnpm drizzle-kit studio

# Generate new migration after schema changes
pnpm drizzle-kit generate

# Push schema changes without migration files
pnpm drizzle-kit push
```

### Code Quality

```bash
# Lint your code
pnpm run lint

# Format code with Prettier
pnpm run format

# Type checking
pnpm run build
```

### Testing

```bash
# Run unit tests
pnpm run test

# Run tests in watch mode
pnpm run test:watch

# Run end-to-end tests
pnpm run test:e2e

# Generate test coverage report
pnpm run test:cov
```

## Project Structure

```
src/
├── auth/              # Authentication module
├── users/             # User management module
├── facility/          # Facility management
├── venue/             # Venue operations
├── profile/           # User profiles
├── operating-hour/    # Operating hours management
├── database/          # Database configuration and schema
│   └── schema/        # Database schema definitions
├── app.module.ts      # Main application module
└── main.ts           # Application entry point

drizzle/
├── migrations/        # Database migration files
└── schema.ts         # Generated schema file
```

## Quick Start Checklist

- [ ] Node.js (v18+) installed
- [ ] pnpm installed
- [ ] PostgreSQL running
- [ ] Repository cloned
- [ ] Dependencies installed (`pnpm install`)
- [ ] Environment variables configured (`.env` file)
- [ ] Database migrations run (`pnpm drizzle-kit migrate`)
- [ ] Development server started (`pnpm run start:dev`)
- [ ] Server accessible at `http://localhost:3000`

## Troubleshooting

### Common Issues

**Database Connection Failed**
- Verify your `DATABASE_URL` in `.env`
- Ensure PostgreSQL server is running
- Check database credentials and permissions

**Port Already in Use**
- Change the `PORT` in your `.env` file
- Kill the process using port 3000: `lsof -ti:3000 | xargs kill`

**Migration Errors**
- Ensure database exists and is accessible
- Run `pnpm drizzle-kit push` to sync schema manually
- Check migration files in `drizzle/migrations/`

You're now ready to start developing with Sportify Backend! The development server will automatically reload when you make changes to your code.
