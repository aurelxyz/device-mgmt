# device-mgmt

Demo backend and frontend application to manage a set of devices

## Quick Start with docker-compose

Pre-requisites:
- Docker 

Steps:
1. `git clone https://github.com/aurelxyz/device-mgmt`
1. `cd device-mgmt`
1. make a copy of the ".env-template" file and name it ".env"
1. edit the .env file if you wish to change the postgres password or the api keys
1. `docker-compose up`
    - docker-compose will start 3 containers: the postgres db, the backend api and the frontend web app
    - on startup, the postgres database will automatically run the sql script /device-mgmt/database/init.sql to create db tables and seed with some initial data
1. open a browser at <http://localhost:8080> to view the frontend app
    - to use the app, find the api key in the .env file and enter it in the dedicated text box in the web page
1. open a browser at <http://localhost:3001/api-docs> to access swagger-ui, view the api doc and test this api

## Developers

Pre-requisites:
- Node.js >= 24.4
- Docker

Steps:
1. Clone the code:
```sh
git clone https://github.com/aurelxyz/device-mgmt
cd device-mgmt
```

2. Install dependencies:
```sh
cd frontend
npm install
cd ../backend
npm install
```

4. Run postgres in a docker container:
```sh
cd device-mgmt
# - make a copy of the ".env-template" file located in the "device-mgmt" folder and name it ".env"
# - edit the .env file if you wish to change the postgres password
docker-compose up db
```

3. Run the backend app in dev mode:
```sh
cd backend
# - make a copy of the ".env-template" file located in the "backend" folder and name it ".env"
# - edit the .env file if you wish to change the postgres password or the api keys for your dev environment
npm run dev
```

4. Run the front end app in dev mode:
```sh
cd frontend
npm run dev
```

5. Run the functional tests of the backend api:
```sh
# note that the tests require:
# - the postgres database to be running
# - the environment variables in /device-mgmt/backend/.env to be configured for your environment
cd backend
npm run test
```