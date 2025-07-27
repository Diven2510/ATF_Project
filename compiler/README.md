# Online Judge Compiler Service

A secure, containerized code execution service for the Online Judge platform. This service handles code compilation and execution for multiple programming languages in an isolated environment.

## Supported Languages

- **C++** (GCC)
- **Python** (Python 3.10)
- **Java** (OpenJDK 11)

## Features

- ✅ Secure code execution in isolated containers
- ✅ Support for multiple programming languages
- ✅ Custom input handling
- ✅ Test case evaluation
- ✅ Health monitoring
- ✅ Automatic cleanup of temporary files
- ✅ Non-root user execution for security

## Quick Start with Docker

### Option 1: Using Docker Compose (Recommended)

1. **Clone and navigate to the compiler directory:**
   ```bash
   cd compiler
   ```

2. **Build and run the service:**
   ```bash
   docker-compose up -d
   ```

3. **Check if the service is running:**
   ```bash
   docker-compose ps
   ```

4. **View logs:**
   ```bash
   docker-compose logs -f
   ```

### Option 2: Using Docker directly

1. **Build the Docker image:**
   ```bash
   docker build -t online-judge-compiler .
   ```

2. **Run the container:**
   ```bash
   docker run -d \
     --name online-judge-compiler \
     -p 7000:7000 \
     --restart unless-stopped \
     online-judge-compiler
   ```

## API Endpoints

### Health Check
```bash
GET http://localhost:7000/health
```

**Response:**
```json
{
  "status": "healthy",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "languages": ["cpp", "python", "java"]
}
```

### Run Code
```bash
POST http://localhost:7000/run
Content-Type: application/json

{
  "language": "cpp",
  "code": "#include <iostream>\nint main() { std::cout << \"Hello World\"; return 0; }",
  "input": ""
}
```

### Submit Code (with test cases)
```bash
POST http://localhost:7000/submit
Content-Type: application/json

{
  "language": "cpp",
  "code": "#include <iostream>\nint main() { int n; std::cin >> n; std::cout << n * 2; return 0; }",
  "testCases": [
    {
      "input": "5",
      "expectedOutput": "10",
      "description": "Basic multiplication test"
    }
  ]
}
```

## Configuration

### Environment Variables

- `PORT`: Server port (default: 7000)
- `NODE_ENV`: Environment mode (default: production)

### Security Features

- **Non-root user**: Code runs as user `coderunner` (UID 1000)
- **Read-only filesystem**: Container filesystem is read-only except for `/app/tmp`
- **Temporary filesystem**: `/app/tmp` is mounted as tmpfs with size limit
- **No new privileges**: Container cannot gain additional privileges
- **Automatic cleanup**: Temporary files are automatically removed after execution

## Monitoring

### Health Check
The service includes a built-in health check endpoint that monitors:
- Service availability
- Supported languages
- Timestamp of last check

### Logs
View container logs:
```bash
docker-compose logs -f compiler
```

### Resource Usage
Monitor container resources:
```bash
docker stats online-judge-compiler
```

## Troubleshooting

### Common Issues

1. **Port already in use:**
   ```bash
   # Check what's using port 7000
   lsof -i :7000
   
   # Stop the service
   docker-compose down
   
   # Change port in docker-compose.yml if needed
   ```

2. **Permission denied:**
   ```bash
   # Ensure Docker has proper permissions
   sudo usermod -aG docker $USER
   # Log out and back in
   ```

3. **Container won't start:**
   ```bash
   # Check logs for errors
   docker-compose logs compiler
   
   # Rebuild the image
   docker-compose build --no-cache
   ```

### Performance Tuning

- **Increase tmpfs size** if you need more temporary storage
- **Adjust timeout values** in the server.js file for longer-running programs
- **Monitor memory usage** and adjust container limits if needed

## Development

### Local Development

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Run locally:**
   ```bash
   node server.js
   ```

3. **Test endpoints:**
   ```bash
   curl http://localhost:7000/health
   ```

### Building for Production

```bash
# Build optimized image
docker build -t online-judge-compiler:latest .

# Tag for registry
docker tag online-judge-compiler:latest your-registry/online-judge-compiler:latest

# Push to registry
docker push your-registry/online-judge-compiler:latest
```

## Integration with Main Application

Update your main application's environment variables to point to the compiler service:

```env
COMPILER_URL=http://localhost:7000
```

Or if using Docker Compose for the entire stack, add the compiler service to your main `docker-compose.yml`:

```yaml
services:
  # ... your other services
  
  compiler:
    build: ./compiler
    ports:
      - "7000:7000"
    # ... other configuration
```

## License

This project is part of the Online Judge platform. 