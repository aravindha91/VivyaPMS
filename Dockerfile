# Use a Node.js base image
FROM node:14

# Set working directory inside the container
WORKDIR /usr/src/app

# Copy package.json and package-lock.json to install dependencies
COPY package*.json ./

# Install npm dependencies
RUN npm install

# Copy application source code to the container
COPY . .

# Expose the port your app runs on
EXPOSE 3000

# Command to run your application
CMD [ "npm", "start" ]
