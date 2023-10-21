FROM node:14

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

# Expose the port your Express app is running on (e.g., 3000)
EXPOSE 4000

# Start your Express app when the container starts
CMD [ "npm", "run", "start" ]