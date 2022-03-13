const request = require('request');
require("dotenv").config();
const fs = require('fs');

function getCCUser(user){
    return new Promise(function(resolve, reject){
        const options = {
            method: 'GET',
            url: `${process.env.CC_URL}/api/data/user/${user}`,
            qs: { auth: process.env.CC_AUTH }
        };

        request(options, function (error, response, body) {
            if (error) reject(error);

            if(response.statusCode == 200){
                resolve(JSON.parse(body));
            }else if(response.statusCode == 404){
                resolve(null);
            }else{
                reject("Bad Response Code")
            }
        });
    })
    
}

function camelize(str) {
    return str.replace(/(?:^\w|[A-Z]|\b\w)/g, function (word, index) {
        return index === 0 ? word.toLowerCase() : word.toUpperCase();
    }).replace(/\s+/g, '');
}

function retrieveUserReg(){
    return JSON.parse(fs.readFileSync(`${__dirname}/users.json`));
}

function writeUserReg(data){
    return fs.writeFileSync(`${__dirname}/users.json`, JSON.stringify(data));
}

function retrieveRankReg() {
    return JSON.parse(fs.readFileSync(`${__dirname}/roles.json`));
}

function writeRankReg(data) {
    return fs.writeFileSync(`${__dirname}/roles.json`, JSON.stringify(data));
}

function retrieveHistoryReg() {
    return JSON.parse(fs.readFileSync(`${__dirname}/history.json`));
}

function writeHistoryReg(data) {
    return fs.writeFileSync(`${__dirname}/history.json`, JSON.stringify(data));
}

module.exports = {
    getCCUser, camelize,
    registry:{
        read: {
            users: retrieveUserReg,
            ranks: retrieveRankReg,
            history: retrieveHistoryReg
        },
        write: { 
            users: writeUserReg,
            ranks: writeRankReg,
            history: writeHistoryReg
        }
    }
}


