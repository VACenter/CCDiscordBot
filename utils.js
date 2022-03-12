const request = require('request');
require("dotenv").config();

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


module.exports = {
    getCCUser, camelize
}
