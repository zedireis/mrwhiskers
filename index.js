const Discord = require("discord.js");
const {prefix} = require("./config.json");
const token = process.env.token;
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
    var minutes = data.getMinutes();
    return dia+"-"+mes+"-"+ano+"-"+minutes;
}

var interval = client.setInterval (function () {
        var data;
		if(!data){
			console.log("First Time");
			data=new Date();
		}
		var sdata = dataAtualFormatada(data);

		var channel = client.channels.cache.find(channel => channel.name === sdata);
		console.log("Antigo"+sdata);
		if(channel){
			var d = new Date();
			var string = dataAtualFormatada(d);
			console.log("Refreshed Todays Channel "+string);
			client.todaysChannel = channel;
			if(string != sdata){
				console.log("Destroy and create ");
				channel.delete();
				console.log("Deleted "+sdata);

				data = d;
				sdata = string;
				console.log(sdata);
				client.guilds.cache.first().channels.create(sdata,{type:"text"}).then(channel => {
					console.log("Created "+sdata);
					updateWeather(channel);
				})
			}
		}else{
			console.log(sdata);
			client.guilds.cache.first().channels.create(sdata,{type:"text"}).then(channel => {
				//console.log("Created "+sdata);
				client.todaysChannel = channel;
				updateWeather(channel);
			})
		}
      }, 125*1000);

var tempChannels = [];
var ntempChannels = [];

client.on("message", message =>{
	
	if(client.todaysChannel){
		//console.log("Checking");
		nWordCheck(message,client.todaysChannel)
	}

	if(message.content.startsWith("${prefix}")){
		console.log(message.content)
	}

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
				console.log(str);
			})
		})
	.catch(err => console.log("Erro na cidade!"))
}

function nWordCheck(message, channel){
	var bad_words = ["NIGGER", "NIGGA"];
	for (let i=0; i<bad_words.length; i++){
		if(message.content.toUpperCase().includes(bad_words[i])){
			channel.send(message.author.username+" acabou de dizer a NWord! :poo:")
		}
	}
}

client.login(token);