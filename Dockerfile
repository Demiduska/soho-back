FROM node:18-alpine

# Install Yarn
RUN apk add --no-cache --update yarn

WORKDIR /app

# Copy package.json and yarn.lock for dependency installation
COPY package.json yarn.lock ./

# Install app dependencies
RUN yarn install

# Copy the rest of the app's source code
COPY . .

# Build the Nest.js app
RUN yarn build

# Expose the port the app runs on
EXPOSE 7777

# Command to run the app with environment variables
CMD ["yarn", "start:prod"]