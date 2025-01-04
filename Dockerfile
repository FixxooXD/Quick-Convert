# Stage 1: Frontend build
FROM node:18 AS build
WORKDIR /app

# Copy package.json files to install dependencies
COPY package*.json ./
COPY server/package*.json ./server/

# Install frontend dependencies
RUN npm install

# Copy all files and build the frontend
COPY . .
RUN npm run build

# Stage 2: Backend setup
FROM node:18

WORKDIR /app/server

# Install LibreOffice
RUN apt-get update && apt-get install -y libreoffice && apt-get clean

# Copy backend package.json and install backend dependencies
COPY --from=build /app/server/package*.json ./  
RUN npm install

# Copy the backend files (if any)
COPY server/ ./server/

# Copy the frontend build output into the server's dist folder
COPY --from=build /app/dist ./server/dist

# Expose port for the backend to run
EXPOSE 3000

# Start the app using npm
CMD ["node", "server/server.js"]