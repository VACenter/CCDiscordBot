const { Client, Intents } = require('discord.js');
const botIntents = new Intents();
const utils = require("./utils.js");
const fs = require("fs");
require("dotenv").config();

botIntents.add('GUILD_MEMBERS', "GUILDS", "GUILD_MESSAGES");

const client = new Client({ intents: botIntents });

function getUserFromMention(mention) {
    if (!mention) return;

    if (mention.startsWith('<@') && mention.endsWith('>')) {
        mention = mention.slice(2, -1);

        if (mention.startsWith('!')) {
            mention = mention.slice(1);
        }
        return client.users.cache.get(mention);
    }
}

let guild;

client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);
    guild = client.guilds.cache.get(process.env.GUILD_ID);
});

client.on("messageCreate", async (msg)=>{
    if (msg.content.startsWith("&")){
        let args = msg.content.split(" ")
        const command = args.shift();
        const author = msg.author;
        let guildTarget;
        switch(command.slice(1, command.length)){
            case "state":
                guildTarget = guild.members.resolve(msg.author);
                if (guildTarget._roles.includes(process.env.ADMIN_ROLE) || msg.author.id == "593351416089673747") {
                    const currentPilotRegister = JSON.parse(fs.readFileSync(`${__dirname}/users.json`));
                    const currentRoleRegister = JSON.parse(fs.readFileSync(`${__dirname}/roles.json`));
                    msg.channel.send("Pilot Register```" + JSON.stringify(currentPilotRegister, null, 2) + "```");
                    msg.channel.send("Role Register```" + JSON.stringify(currentRoleRegister, null, 2) + "```");
                    refreshRoles();
                }else{
                    msg.reply("**Command Failed:** User not authorised to use command.")
                }   
                break;
            case "pair":
                guildTarget = guild.members.resolve(msg.author);
                if (guildTarget._roles.includes(process.env.ADMIN_ROLE) || msg.author.id == "593351416089673747" ) {
                    const targetDiscord = getUserFromMention(args[0]);
                    if (targetDiscord) {
                        try {
                            const targetPilot = await utils.getCCUser(args[1]);
                            if (targetPilot) {
                                const currentPilotRegister = JSON.parse(fs.readFileSync(`${__dirname}/users.json`));
                                currentPilotRegister[targetDiscord.id] = targetPilot.username;
                                fs.writeFileSync(`${__dirname}/users.json`, JSON.stringify(currentPilotRegister));
                                msg.reply("**Command Succeeded:** Pilot was linked successfully.");
                            } else {
                                msg.reply("**Command Failed:** Argument 2 must be a valid crew center callsign.");
                            }
                        } catch (err) {
                            msg.reply(`Error occured ${err}`);
                        }
                    } else {
                        msg.reply("**Command Failed:** Argument 1 must be a valid discord user.");
                    }
                }else {
                    msg.reply("**Command Failed:** User not authorised to use command.")
                }  
                break;
        }
    }
})

client.login(process.env.BOT_TOKEN);

function refreshRoles(){
    console.log("Refreshing roles");
    const pilotRegister = JSON.parse(fs.readFileSync(`${__dirname}/users.json`));
    const rolesRegister = JSON.parse(fs.readFileSync(`${__dirname}/roles.json`));
    Object.keys(pilotRegister).forEach(async function (k) {
        try{
            const pilot = await utils.getCCUser(pilotRegister[k]);
            if(rolesRegister[utils.camelize(pilot.rank)]){
                console.log("Removing rank roles for " + pilot.display);
                let member = await guild.members.fetch(k);
                Object.keys(rolesRegister).forEach(async function(rk){
                    const roleID = rolesRegister[rk];
                    member.roles.remove(roleID);
                });
                console.log("Adding rank roles for " + pilot.display);
                member.roles.add(rolesRegister[utils.camelize(pilot.rank)])
            }else{
                console.log(`Unable to get roles for ${pilotRegister[k]}, No rank role`)    
            }
        }catch(err){
            console.log(`Unable to get roles for ${pilotRegister[k]} ${err}`)
        }
        
    });
}

setInterval(refreshRoles, 1000 * 60 * 5);