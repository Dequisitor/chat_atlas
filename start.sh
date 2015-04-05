#!/bin/bash
sudo nodemon --ignore 'public/*.*' server.js
sudo mongod --dbpath data/ --shutdown
