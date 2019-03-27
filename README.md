<<<<<<< HEAD
# chatbotframework
=======
# This system uses some techniques:

Frontend: 
- react.js
- bootstrap theme
- axios (call api) use CoreUI-react open source

Backend:
- nodejs + express.js (web platform)
- postgres (relate db) + sequelize.js (ORM)
- jsonwebtoken for api

## How to run project:

### Frontend

```sh
npm install

# For developing : webpack + self host port 3000 (check .env file)
npm run start

# For release: deploy source on backend public folder
# create a "backend/public" folder
# change INIT_DB=true in .env 
npm run build
```

### Backend
Using node 10 lastest LTS (nvm use v10.14.2   (Latest LTS: Dubnium))
```sh
npm install
node index.js # Run on port: 3333 check on .env file

middlewares>capcha #secretKey = SECRETCAPCHA_SERVER or SECRETCAPCHA_LOCAL
```

> Structure base on MVC

### DB

1. create user postgres password 12345
2. create database auto_grading

### Code style
ES6

### Features

Register:
    sign in: for student work
    login: for student, admin, ta work
    reset pass
    change pass: work
Admin:
    set role
    create teacher account: work (need implement email notification)
    assign teacher to course: work
    create course: work
TA:
    Add/remove exercise: add, view work
    Add/remove question: add, view work (but need question title)
    Add/remove group (add themselve) work
    Import student user (csv): work
    Add permission
Student
    submit
    report view: work (but need show more data)

### pm2 config
create file ecosystem.config.js

```
module.exports = {
  apps : [{
    name: 'backend',
    script: 'cd backend && node index.js',
    instances : 'max',
    exec_mode : 'cluster',
    error_file: 'logs/backend.err.log',
    out_file: 'logs/backend.out.log'
  }, {
    name: 'frontend',
    script: 'cd frontend && npm start',
    instances : 'max',
    exec_mode : 'cluster',
    error_file: 'logs/frontend.err.log',
    out_file: 'logs/frontend.out.log'
  }]
};
```

pm2 start ecosystem.config.js

    
         
>>>>>>> first init
