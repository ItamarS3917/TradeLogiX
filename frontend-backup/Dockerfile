# Use a specific Node.js 16 version
FROM node:16.20.0-slim

# Set working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package.json ./

# Install dependencies with specific flags to resolve conflicts
RUN npm install --legacy-peer-deps --force

# Copy the rest of the app
COPY . .

# Expose port
EXPOSE 3000

# Start app
CMD ["npm", "start"]