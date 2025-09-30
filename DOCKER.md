# AI Interview Assistant - Docker Deployment Guide

This guide explains how to run the AI Interview Assistant using Docker containers.

## Prerequisites

- Docker and Docker Compose installed
- Gemini API key from Google AI Studio

## Quick Start

1. **Clone the repository and navigate to the project directory:**
   ```bash
   cd AIQuizz
   ```

2. **Set up your environment:**
   - Copy `.env.docker` and update your Gemini API key:
   ```bash
   # Edit .env.docker and replace 'your-gemini-api-key-here' with your actual API key
   GEMINI_API_KEY=your-actual-gemini-api-key
   ```

3. **Build and start all services:**
   ```bash
   docker-compose --env-file .env.docker up --build
   ```

4. **Access the application:**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000
   - MongoDB: localhost:27017

## Services

### Frontend (Next.js)
- **Port:** 3000
- **Container:** ai-interview-frontend
- **Features:** React-based UI, SSR, optimized for production

### Backend (Node.js/Express)
- **Port:** 5000
- **Container:** ai-interview-backend
- **Features:** REST API, Gemini AI integration, file upload

### Database (MongoDB)
- **Port:** 27017
- **Container:** ai-interview-mongodb
- **Features:** Document storage, automatic indexing, data persistence

## Docker Commands

### Development
```bash
# Start services in foreground
docker-compose --env-file .env.docker up

# Start services in background
docker-compose --env-file .env.docker up -d

# View logs
docker-compose logs -f

# View specific service logs
docker-compose logs -f backend
docker-compose logs -f frontend
```

### Management
```bash
# Stop all services
docker-compose down

# Stop and remove volumes (clean reset)
docker-compose down -v

# Rebuild specific service
docker-compose up --build backend

# Check running containers
docker ps

# Execute commands in containers
docker-compose exec backend sh
docker-compose exec mongodb mongo
```

### Troubleshooting
```bash
# Check container status
docker-compose ps

# Inspect container logs
docker-compose logs backend

# Restart specific service
docker-compose restart backend

# Clean rebuild everything
docker-compose down -v
docker system prune -f
docker-compose up --build
```

## Environment Variables

### Required
- `GEMINI_API_KEY`: Your Google Gemini AI API key

### Optional
- `MONGO_ROOT_USERNAME`: MongoDB admin username (default: admin)
- `MONGO_ROOT_PASSWORD`: MongoDB admin password (default: password123)
- `NODE_ENV`: Environment mode (default: production)

## Data Persistence

- MongoDB data is persisted in a Docker volume named `mongodb_data`
- Upload files are stored in `./backend/uploads` (mounted to container)
- Data survives container restarts but is removed with `docker-compose down -v`

## Health Checks

All services include health checks:
- **Backend:** Checks `/api/health` endpoint
- **Frontend:** Checks root path availability
- **MongoDB:** Built-in health monitoring

## Security Features

- Non-root users in all containers
- Network isolation between services
- Environment variable management
- Proper file permissions

## Production Considerations

1. **Change default passwords** in `.env.docker`
2. **Use Docker secrets** for sensitive data
3. **Set up reverse proxy** (nginx) for SSL/TLS
4. **Configure backup strategy** for MongoDB
5. **Monitor container resources** and logs
6. **Use specific image tags** instead of latest

## Port Configuration

Default ports can be changed in `docker-compose.yml`:
```yaml
ports:
  - "3001:3000"  # Frontend on port 3001
  - "5001:5000"  # Backend on port 5001
  - "27018:27017" # MongoDB on port 27018
```

## Scaling

Scale specific services:
```bash
# Run multiple backend instances
docker-compose up --scale backend=3

# Load balance with nginx (additional configuration needed)
```

## Backup and Restore

### Backup MongoDB
```bash
docker-compose exec mongodb mongodump --out /backup
docker cp ai-interview-mongodb:/backup ./mongodb-backup
```

### Restore MongoDB
```bash
docker cp ./mongodb-backup ai-interview-mongodb:/backup
docker-compose exec mongodb mongorestore /backup
```

## Support

For issues:
1. Check container logs: `docker-compose logs`
2. Verify environment variables
3. Ensure all required ports are available
4. Check Docker and Docker Compose versions