# This is now a single-stage build

FROM node:18-alpine
LABEL maintainer="Amitabh Soni <amitabhdevops2024@gmail.com>"       app="gemini"       stage="build"

WORKDIR /app

# Copy package files and install dependencies
COPY package.json package-lock.json* ./
RUN npm ci

# Copy the rest of the application code
COPY . .

# Build the application
RUN npm run build

# Set the command to start the app
CMD ["npm", "start"]
