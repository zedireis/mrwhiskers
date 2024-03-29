const Discord = require("discord.js");
const {prefix} = require("./config.json");
const token = process.env.token;
const bad_words = process.env.badwords.split(',');
const weather = process.env.weather;
const client = new Discord.Client();
const fetch = require("node-fetch");

client.once("ready", () => {
	console.log("Ready!");
});

function dataAtualFormatada(data){
    var dia  = data.getDate().toString().padStart(2, '0'),
        mes  = (data.getMonth()+1).toString().padStart(2, '0'), //+1 pois no getMonth Janeiro começa com zero.
        ano  = data.getFullYear();
    return dia+"-"+mes+"-"+ano;
}

var interval = client.setInterval (function () {
        var data = new Date();
		// if(!data){
		// 	console.log("First Time");
		// 	data=new Date();
		// }
		var sdata = dataAtualFormatada(data);

		if(client.hasOwnProperty('todaysChannel')){
			console.log("Antigo "+client.todaysChannel.name);
			console.log("Refreshed Todays Channel "+sdata);
			if(sdata != client.todaysChannel.name){
				console.log("A destruir "+client.todaysChannel.name);
				client.todaysChannel.delete("Porque sim")
				.then(console.log("Channel Deleted"))
				.catch(console.error);



				sleep(10*1000).then(() => {
					console.log("Vou criar")
				})

				client.guilds.cache.first().channels.create(sdata,{type:"text", nsfw:true})
				.then(channel => {
					console.log("Created "+sdata);
					client.todaysChannel = channel;
					updateWeather(channel);
				})
				.catch(console.error);
			}
		}else{
			console.log("First time " + sdata);
			var channel = client.channels.cache.find(channel => channel.name === sdata);
			if(channel){
				client.todaysChannel = channel;
				console.log("Já existia");
			}else{
				client.guilds.cache.first().channels.create(sdata,{type:"text", nsfw:true})
				.then(channel => {
					//console.log("Created "+sdata);
					client.todaysChannel = channel;
					updateWeather(channel);
				})
				.catch(console.error);
			}
		}
      }, 20*60*1000);

var interval_2 = client.setInterval(cleaner, 600*1000);

function cleaner() {
	console.log("Cleaning");
	client.guilds.cache.first().channels.cache.forEach(channel => {
		if(channel.type === "category"){
			channel.children.forEach(ch => {
				if(ch.type === "text"){
					ch.messages.fetch().then( fetched => {
						if(fetched.size>0){
							//console.log(ch.name+" Mensagem "+fetched.first().createdAt+"\n"+fetched.first().content);
							var old_date = fetched.first().createdAt;
							var new_date = new Date();
							var seconds = (new_date.getTime() - old_date.getTime()) / 1000;
							//console.log(seconds);
							if(seconds>120*60){
								console.log(ch.name + " Deleting "+fetched.size);
								ch.bulkDelete(fetched).then(console.log("Tided up"))
								.catch(console.error);
							}
						}
					})
				}
			})
		}
	});
}

client.on("message", message =>{
	
	if(client.todaysChannel){
		//console.log("Checking");
		nWordCheck(message,client.todaysChannel)
	}

	// if(message.content.startsWith("${prefix}")){
	// 	console.log(message.content)
	// }

})

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function updateWeather(channel){
	fetch("http://api.openweathermap.org/data/2.5/weather?q=Coimbra,pt&lang=pt&appid="+weather)
		.then(response => response.json())
		.then(data => {
			var nameValue = data['name'];
			var min = Math.round(data['main']['temp_min']-273.15);
			var max = Math.round(data['main']['temp_max']-273.15);
  			var descValue = data['weather'][0]['description'];
  			str = "Hoje o tempo em " + nameValue + "\nTemperatura mínima: " + String(min) + "ºC\nTemperatura máxima: " + String(max) + "ºC\n" + descValue;
			channel.send(str);
			sleep(5000).then(() => {
				console.log("Weather Updated");
			})
		})
	.catch(err => console.log("Erro na cidade!"))
}

function nWordCheck(message, channel){
	for (let i=0; i<bad_words.length; i++){
		if(message.content.toUpperCase().includes(bad_words[i])){
			channel.send(message.author.username+" acabou de dizer a NWord! :poo:")
		}
	}
}

client.login(token);
