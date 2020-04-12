const Discord = require("discord.js");
const axios = require('axios')
require('dotenv').config()
const bot = new Discord.Client();

var pre = '$'

bot.on("ready", () => {
  bot.user.setActivity('$help', {type:"WATCHING"})
  console.log("Prêt !");
})

bot.on("message", message => {
  if (message.author.bot) return;
  if(!message.content.startsWith(pre)) return;

	const args = message.content.slice(pre.length).trim().split(/ +/g);
	const command = args.shift().toLowerCase();
  const allargs = message.content.slice(pre.length + command.length).trim();

  if(command === 'p' || command === 'ping') {
    message.channel.send("Pong ! 🏓" + `(${Date.now() - message.createdTimestamp} ms)`);
  }
  else if (command === 'e' || command === 'eval') {
    if(message.author.id !== "432508632370774026") return
    function clean(text) {
      if (typeof(text) === "string") 
        return text.replace(/`/g, "`" + String.fromCharCode(8203)).replace(/@/g, "@" + String.fromCharCode(8203));
      else
        return text;
    }
    try {
      const code = allargs
      let evaled = eval(code)
      if (typeof evaled !== "string") 
        evaled = require("util").inspect(evaled);
        message.channel.send(clean(evaled), {code:"xl"});
    } catch (err) {
      message.channel.send(`\`ERROR\` \`\`\`xl\n${clean(err)}\n\`\`\``)
    }
  }
  else if(command === 'a' || command === 'h' || command === 'aide' || command === 'help') {
    const embed = {
      "title": "**Liste des commandes**",
      "description": "Voici la liste de toutes les commandes du bot CaliPay.",
      "color": 3265343,
      "footer": {
        "icon_url": "https://lasagna.cf/icon.png",
        "text": "Créé par Lasagna#1019"
      }
    };
    message.channel.send({ embed: embed });
    message.channel.send(`**$help** - Affiche la liste des commandes\n**$creer** ($c) *montant* *pseudo* *motif* - Crée une page de paiement\n**$verifier** ($v) *URL du paiement* - Vérifie le statut d'un paiement\n**$invit** - Affiche le lien d'invitation du bot\n**$github** - Affiche le lien du repo GitHub du bot (code source)`)
  }
  else if(command === 'c' || command === 'créer' || command === 'creer' || command === 'create') {
    const amount = args[0]
    const receiver = args[1]
    const details = allargs.slice(args[0].length+args[1].length+2)
    if(!amount || !receiver || !details) {
      message.channel.send('❌ Veuillez renseigner le montant, le pseudo du récepteur du paiement et le motif du paiement.')
      return
    }

    const params = {
      amount: amount,
      receiver: receiver,
      redirect_to: 'https://califorcraft.eu',
      callback_url: 'https://calipay.requestcatcher.com'
    };
    if(details) params.label = details
    const data = Object.entries(params)
      .map(([key, val]) => `${key}=${encodeURIComponent(val)}`)
      .join('&');
    const options = {
      method: 'POST',
      headers: { 'content-type': 'application/x-www-form-urlencoded' },
      data,
      url: 'https://califorcraft.eu/api/initPayment',
    };

    axios(options).then(res => {
      message.channel.send(`Page de paiement créée : <https://califorcraft.eu/api/payment/${res.data.data.token}>`)
    })
  }
  else if(command === 'v' || command === 'vérifier' || command === 'verifier' || command === 'check') {
    const url = args[0]
    if(!url) {
      message.channel.send("❌ Veuillez renseigner l'URL de la page de paiement.")
    }

    const params = {
      token: url.slice('https://califorcraft.eu/api/payment/'.length)
    }
    const data = Object.entries(params)
      .map(([key, val]) => `${key}=${encodeURIComponent(val)}`)
      .join('&');
    const options = {
      method: 'POST',
      headers: { 'content-type': 'application/x-www-form-urlencoded' },
      data,
      url: 'https://califorcraft.eu/api/status',
    };

    axios(options).then(res => {
      const status = res.data.data.status
      if(status === 'paid') {
        var msg = 'Paiement effectué ✅'
      }
      else if(status === 'pending') {
        var msg = 'Paiement en attente 🕙'
      }
      else if(status === 'expired') {
        var msg = 'Paiement expiré ❌'
      }
      message.channel.send(msg)
    })
  }
  else if(command === 'i' || command === 'invit' || command === 'invite' || command === 'invitation') {
    message.channel.send('<https://discordapp.com/api/oauth2/authorize?client_id=694002979287728241&permissions=2048&scope=bot>')
  }
  else if(command === 'g' || command === 'github') {
    message.channel.send('https://github.com/WebLasagna/calipay')
  }
});

bot.login(process.env.BOT_TOKEN);