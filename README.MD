# Starwork E-Wallet Backend API

A simple E-Wallet backend service built with fully Javascript using framework ExpressJS and MySQL for storing the data. also this app use Redis for chaching

## Documentation

[API Documentation](https://documenter.getpostman.com/view/29535426/2s9YRCYCQh)

You can check the Flowchart diagram and ERD on this link
[Flowchart Diagram](https://whimsical.com/starworks-flowchart-diagram-HShWHu4Gn6K2UdNtRmXbWi)

### UML Diagram

[Login](https://swimlanes.io/d/Rp3ZS-4oG)

[Register](https://swimlanes.io/d/0ZNAejZSK)

[Get balance](https://swimlanes.io/d/k52msVcSU)

[Topup balance](https://swimlanes.io/d/n8gcJVInc)

[Pay/Create Payment](https://swimlanes.io/d/WgW8RBV7y)

[Confirm Payment](https://swimlanes.io/d/_vkaDfAkw)

## Installation

Install this project with npm simply run

```bash
  npm i
```

Create .env.development file in your root folder

```bash
MYSQL_USERNAME=root
MYSQL_PASSWORD=root
MYSQL_DATABASE=starwork_technical_test
MYSQL_HOST=localhost

JWT_SECRET=asdasdasd
JWT_EXPIRE=5m

REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=root
REDIS_USERNAME=root
REDIS_DB=0
REDIS_MAX_TIME_TRANSACTION_SECOND=900
```

You need to create and migrate the database before running simply run

```bash
  npm run sequelize db:create  //creating database
  npm run sequelize db:migrate //migrating
```

That's all you can run it using

```bash
  npm run dev
```

## Running Tests

To run tests, run the following command

```bash
  npm run test
```

## Tech Stack

**Server:** Node, Express, MySQL, Redis
