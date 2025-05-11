# Use Node.js 16
FROM node:16-slim

# Set working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package.json vite.config.js ./

# Install dependencies
RUN npm install

# Copy the rest of the app
COPY . .

# Expose port
EXPOSE 3000

# Start Vite server
CMD ["npm", "start"]