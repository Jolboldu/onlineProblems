# Online Problems app

## Main backend for the app 
Backend - App for solving algorythmic puzzles (ru).<br>

link: http://app.balatech.asia/

At the moment there are 15000+ users and about 24 solved problems for each user

To run this project
1) make sure to add .env file with such properties :
MONGODB_URI, TELEGRAM_BOT_TOKEN, JWT_SECRET_KEY

2) `npm install`

3) `npm start`

To build from `src` folder to `build` folder:

`npm run build`

Run dev enviornment:

`npm run dev`

Run tests by jest 'filename'
but firstly uncomment fake signup and erase routes in auth.js
