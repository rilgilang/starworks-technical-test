FROM node:current-alpine3.17

WORKDIR /app

COPY package*.json .

RUN npm install

COPY . .

EXPOSE 4000

# Start your Express app when the container starts
CMD [ "npm", "run", "start" ]