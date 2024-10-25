# Use an official Node.js image from Docker Hub
FROM node:14

# Set the working directory in the container
WORKDIR /app

# Copy your server.js file into the working directory
COPY server.js .

# Install socket.io as a direct dependency
RUN npm install socket.io

# Expose the port that your server will run on
EXPOSE 3000

# Command to start the server
CMD ["node", "server.js"]
