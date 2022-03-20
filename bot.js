//@ts-check
const { Client, Intents } = require('discord.js');
const { mode } = require('./utils.js');
const botIntents = new Intents();
const utils = require("./utils.js");
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
                    const currentPilotRegister = utils.registry.read.users();
                    const currentRoleRegister = utils.registry.read.ranks();
                    const currentHistory = utils.registry.read.history();
                    msg.channel.send("__**Listing content of registries:**__");
                    msg.channel.send("**Pilot Register**```json\n" + JSON.stringify(currentPilotRegister, null, 2) + "```");
                    msg.channel.send("**Role Register**```json\n" + JSON.stringify(currentRoleRegister, null, 2) + "```");
                    msg.channel.send("**History Register**```json\n" + JSON.stringify(currentHistory, null, 2) + "```");
                    refreshRoles();
                }else{
                    msg.reply("**Command Failed:** User not authorised to use command.")
                }   
                break;
            case "theirStats":
                if (parseInt(process.env.STATS_ACCESS) == 1) {
                    if(getUserFromMention(args[0])){
                        const targetDiscord = getUserFromMention(args[0]);
                        const currentPilotRegister = utils.registry.read.users();
                        if (currentPilotRegister[targetDiscord.id] || currentPilotRegister[targetDiscord.id] === 0) {
                            const authorCC = await utils.getCCUser(currentPilotRegister[targetDiscord.id]);
                            //Calculate Common
                            let vics = [];
                            let routes = [];
                            authorCC.pireps.forEach(pirep => {
                                vics.push(pirep.vehiclePublic)
                                routes.push(pirep.route);
                            });
                            msg.reply({ content: `**${authorCC.display}'s Stats**`, embeds: [utils.createEmbed(process.env.BOT_COLOR, `${authorCC.display}'s Stats`, null, client.user.username, "", null, [['Flight Hours', `${parseFloat(authorCC.hours).toFixed(2)}hrs`], ['# of PIREPS', `${authorCC.pireps.length}`], ['Most Used Aircraft', mode(vics) ? mode(vics) : "None"], ['Most Flown Route', mode(routes) ? mode(routes) : "None"], ['Rank', authorCC.rank]], null, null)] })
                        } else {
                            msg.reply("**Command Failed:** User not paired. Contact a staff member to pair them!")
                        }
                    }else{
                        msg.reply("**Command Failed:** Argument 1 must be a Discord user");
                    }
                } else {
                    msg.reply("**Command Failed:** You are unable to execute this command since the 'stats' module has not be purchased for this VA.")
                }
                break;
            case "myStats":
                if (parseInt(process.env.STATS_ACCESS) == 1){
                    const authorDiscord = msg.author.id.toString();
                    const currentPilotRegister = utils.registry.read.users();
                    if(currentPilotRegister[authorDiscord] || currentPilotRegister[authorDiscord] === 0){
                        const authorCC = await utils.getCCUser(currentPilotRegister[authorDiscord]);
                        //Calculate Common
                        let vics = [];
                        let routes = [];
                        authorCC.pireps.forEach(pirep => {
                            vics.push(pirep.vehiclePublic)
                            routes.push(pirep.route);
                        });
                        msg.reply({ content: `**${authorCC.display}'s Stats**`, embeds: [utils.createEmbed(process.env.BOT_COLOR, `${authorCC.display}'s Stats`, null, client.user.username, "", null, [['Flight Hours', `${parseFloat(authorCC.hours).toFixed(2)}hrs`], ['# of PIREPS', `${authorCC.pireps.length}`], ['Most Used Aircraft', mode(vics) ? mode(vics) : "None"], ['Most Flown Route', mode(routes) ? mode(routes) : "None"], ['Rank', authorCC.rank]], null, null)]})
                    }else{
                        msg.reply("**Command Failed:** User not paired. Contact a staff member to become paired!")
                    }
                }else {
                    msg.reply("**Command Failed:** You are unable to execute this command since the 'stats' module has not be purchased for this VA.")
                }
                break;
            case "top":
                if (parseInt(process.env.STATS_ACCESS) == 1){
                    const hoursTop = new Map();
                    const pilotRegister = utils.registry.read.users();
                    const pirepsTop = new Map();
                    let pilotTicker = 0;
                    let pilotTotal = 0;

                    for (let properties in pilotRegister) {
                        pilotTotal = pilotTotal + 1
                    }


                    Object.entries(pilotRegister).forEach(async ([key, value]) => {
                        const CCUser = await utils.getCCUser(value);
                        hoursTop.set(value, CCUser.hours);
                        pirepsTop.set(value, CCUser.pireps.length);
                        pilotTicker++;
                    });
                    let checker = setInterval(() => {
                        if (pilotTicker == pilotTotal) {
                            clearInterval(checker);
                            const hoursSort = new Map([...hoursTop.entries()].sort((a, b) => b[1] - a[1]));
                            const pirepsSort = new Map([...pirepsTop.entries()].sort((a, b) => b[1] - a[1]));

                            const mostHours = hoursSort.entries().next().value;
                            const mostPIREPS = pirepsSort.entries().next().value;

                            msg.reply({ content: "**Top VA Stats**", embeds: [utils.createEmbed(process.env.BOT_COLOR, `Top VA Stats`, null, client.user.username, "", null, [['Most Hours', `${process.env.VA_CODE}${mostHours[0]} - ${mostHours[1].toFixed(2)}hrs`], ['Most PIREPS', `${process.env.VA_CODE}${mostPIREPS[0]} - ${mostPIREPS[1]}`]], null, null)] })
                        }
                    }, 25);
                }else{
                    msg.reply("**Command Failed:** You are unable to execute this command since the 'stats' module has not be purchased for this VA.")
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
                                const currentPilotRegister = utils.registry.read.users();
                                const currentHistory = utils.registry.read.history();
                                currentPilotRegister[targetDiscord.id] = targetPilot.username;
                                currentHistory[targetDiscord.id] = null;
                                utils.registry.write.users(currentPilotRegister);
                                utils.registry.write.history(currentHistory);
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
    const pilotRegister = utils.registry.read.users();
    const rolesRegister = utils.registry.read.ranks();
    const historyRegister = utils.registry.read.history();
    Object.keys(pilotRegister).forEach(async function (k) {
        const CCUser = await utils.getCCUser(pilotRegister[k]);
        const DiscordUser = await guild.members.fetch(k);
        if(historyRegister[k]){
            if(CCUser.rank != historyRegister[k]){
                console.log(`Changing roles for ${CCUser.display}`);
                Object.keys(rolesRegister).forEach(async function (rk) {
                    const roleID = rolesRegister[rk];
                    DiscordUser.roles.remove(roleID);
                });
                DiscordUser.roles.add(rolesRegister[utils.camelize(CCUser.rank)]);
            }else{
                console.log(`Not updating for ${CCUser.display}`);
            }
        }else{
            console.log(`Changing roles for ${CCUser.display}`);
            Object.keys(rolesRegister).forEach(async function (rk) {
                const roleID = rolesRegister[rk];
                DiscordUser.roles.remove(roleID);
            });
            DiscordUser.roles.add(rolesRegister[utils.camelize(CCUser.rank)]);
            console.log(`Updating history register for ${CCUser.display}`);
            historyRegister[k] = CCUser.rank;
            utils.registry.write.history(historyRegister);
        }
    });
}

setInterval(refreshRoles, 1000 * 60 * 5);