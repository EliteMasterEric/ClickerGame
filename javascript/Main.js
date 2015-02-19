//HTML elements, as variables for ease of use.
//underscores_between_words designate DOM elements, while lowerCamelCase repressents JavaScript variables.
//Text Fields
var money_current;
var money_per_click;
var money_per_second;
var money_all_time;
var clicks_all_time;
//Columns
var column_upgrades;
var column_workers;

var workers = [];
var upgrades = [];
var upgradesByPrice = [];

//Values for the current game.
var Game = { };

//Initialization
$(document).ready( function(){
    log('Initializing Clicker Game...');
	Game.version = "v0.1";
    Game.moneyCurrent = 0;
    Game.moneyAllTime = 0;
	//This one's only a Big for consistency.
	Game.clicksAllTime = 0;

	
    log('Initializing variables...');
    //Set elements to variables for convenience.
    //Text Fields
    money_current = document.getElementById("money_current");
    money_per_click = document.getElementById("money_per_click");
    money_per_second = document.getElementById("money_per_second");
    money_all_time = document.getElementById("money_all_time");
    clicks_all_time = document.getElementById("clicks_all_time");
	//Columns
    column_upgrades = document.getElementById("column_upgrades");
    column_workers = document.getElementById("column_workers");
    log('Initializing workers...');
	createWorkers();
    log('Initializing upgrades...');
	createUpgrades();
	
    quickUpdate();
    update();
});

Game.Upgrade = function(name, readablename, price, isunlocked) {
	this.name = name;
	this.readableName = readablename;
	this.price = price;
	this.unlocked = isunlocked;
	this.bought = 0;
	this.getPrice = function() {
		return this.price;	
	}
	upgrades[this.name] = this;
	this.buy = function() {
		log("buy:"+this.name);
		if(Game.moneyCurrent >= this.getPrice()) {
			Game.moneyCurrent -= this.getPrice();
			this.bought = 1;
		}
	}
	return this;
}

Game.Worker = function(name, readablename, baseefficiency, price, isunlocked) {
	this.name = name;
	this.readableName = readablename;
	this.basePrice = price;
	this.unlocked = isunlocked;
	this.baseefficiency = baseefficiency;
	this.efficiency = -1;
	this.bought = 0;
	this.getPrice = function() {
		return Math.ceil(this.basePrice*Math.pow(1.5, this.bought));
	}
	workers[this.name] = this;
	this.buy = function() {
		log("buy:"+this.name);
		if(Game.moneyCurrent >= this.getPrice()) {
			Game.moneyCurrent -= this.getPrice();
			this.bought += 1;
		}
	}
	return this;
}

function createUpgrades() {
	new Game.Upgrade('doubleclick','x2 Click Power', 25, function() { return (Game.moneyAllTime >= 10); });
	new Game.Upgrade('tripleclick','x3 Click Power', 100, function() { return (Game.moneyAllTime >= 50); });
	new Game.Upgrade('quadrupleclick','x4 Click Power', 250, function() { return (Game.moneyAllTime >= 100); });
	
	new Game.Upgrade('doubleworker','x2 Worker Efficiency', 25, function() { return (workers['worker'].bought >= 5); });
	new Game.Upgrade('doublebuilder','x2 Builder Efficiency', 100, function() { return (workers['builder'].bought >= 5); });
	new Game.Upgrade('doublefactory','x2 Factory Efficiency', 250, function() { return (workers['factory'].bought >= 5); });	
	new Game.Upgrade('doublelargefactory','x2 Large Factory Efficiency', 250, function() { return (workers['largefactory'].bought >= 5); });
	//Sort the list of upgrades by price.
	upgradesByPrice = upgrades.sort(function(a,b) { log("Sort"); return (a.getPrice() - b.getPrice()) } );
}

function createWorkers() {
	new Game.Worker('worker','Worker', 1, 10, function() { return (Game.moneyAllTime >= 5); });
	new Game.Worker('builder','Builder', 3, 25, function() { return (Game.moneyAllTime >= 25); });
	new Game.Worker('factory','Factory', 10, 100, function() { return (Game.moneyAllTime >= 75); });
	new Game.Worker('largefactory','Large Factory', 50, 250, function() { return (Game.moneyAllTime >= 150); });
}

//Timed updates, occur each second
update = function() {    
    //Add the dollars per second to the current dollars value.
    Game.moneyCurrent += getMoneyPerSecond();
    Game.moneyAllTime += getMoneyPerSecond();
	
    //Run the update loop again in 1 second.
    setTimeout(update, 1000);
}

//Important timed updates, occur each 1/10 second
quickUpdate = function() {
    draw();
	createStore();
    //Run the update loop again in 1 second.
    setTimeout(quickUpdate, 100);
}

function formatNumber(number) {
	var format = [ "" ];
	switch(selectedFormat) {
		case 0:
			return (number.toString());
			break;
		case 1:
			return (number.toString());
			break;
		case 2:
			return (number.toString());
			break;
		default:
			return (number.toString());
			break;
	}
}

//Ran when the dollar button is clicked.
function onMoneyClicked() {
    Game.moneyCurrent += getMoneyPerClick();
    Game.moneyAllTime += getMoneyPerClick();
	Game.clicksAllTime++;
}

function getMoneyPerClick() {
	return 1
		*((upgrades['doubleclick'].bought==1) ? 2 : 1)
		*((upgrades['tripleclick'].bought==1) ? 3 : 1)
		*((upgrades['quadrupleclick'].bought==1) ? 4 : 1);
}

function getMoneyPerSecond() {
	return 0
		+(workers['worker'].bought*workers['worker'].efficiency)
		+(workers['builder'].bought*workers['builder'].efficiency)
		+(workers['factory'].bought*workers['factory'].efficiency);
}

//Render stuff, change numbers, etc.
function draw() {
    //Edit the text to show current stats.
	money_current.innerHTML = formatNumber(Game.moneyCurrent);
	money_per_click.innerHTML = getMoneyPerClick();
	money_per_second.innerHTML = getMoneyPerSecond();
	money_all_time.innerHTML = formatNumber(Game.moneyAllTime);
	clicks_all_time.innerHTML = Game.clicksAllTime;
}

function calculateEfficiency() {
	workers['worker'].efficiency = workers['worker'].baseefficiency * ((upgrades['doubleworker'].bought==1) ? 2 : 1)
	workers['builder'].efficiency = workers['builder'].baseefficiency * ((upgrades['doublebuilder'].bought==1) ? 2 : 1)
	workers['factory'].efficiency = workers['factory'].baseefficiency * ((upgrades['doublefactory'].bought==1) ? 2 : 1)	
	workers['largefactory'].efficiency = workers['largefactory'].baseefficiency * ((upgrades['doublelargefactory'].bought==1) ? 2 : 1)
}

function createStore() {
	//Calculate efficiency of workers before displaying them.
	calculateEfficiency();
	for(var i in upgrades) {
		if(upgrades[i].unlocked()) {
			if(document.getElementById("button_buy_"+upgrades[i].name) == undefined) {
				var element = document.createElement("button");
				element.id = "button_buy_"+upgrades[i].name;
				element.classList.add("buybuttonleft");
				var name = upgrades[i].name;
				element.addEventListener('click',function(what){return function(){upgrades[what].buy()};}(i), false);
				column_upgrades.appendChild(element);
			}
			document.getElementById("button_buy_"+upgrades[i].name).innerHTML = "<b>$"+upgrades[i].getPrice() + "</b> " + upgrades[i].readableName;
			if(upgrades[i].bought == 1) {
				document.getElementById("button_buy_"+upgrades[i].name).style = "display:none";
			}
			if(Game.moneyCurrent < upgrades[i].getPrice()) {
				document.getElementById("button_buy_"+upgrades[i].name).classList.add("buybuttonlocked");
			} else {
				document.getElementById("button_buy_"+upgrades[i].name).classList.remove("buybuttonlocked");
			}
		}
	}
	for(var i in workers) {
		if(workers[i].unlocked()) {
			if(document.getElementById("button_buy_"+workers[i].name) == undefined) {
				var element = document.createElement("button");
				element.innerHTML = "<b>$"+workers[i].getPrice() + "</b> " + workers[i].readableName;
				element.id = "button_buy_"+workers[i].name;
				element.classList.add("buybuttonleft");
				var name = workers[i].name;
				element.addEventListener('click',function(what){return function(){workers[what].buy()};}(i), false);
				column_workers.appendChild(element);
			}
			document.getElementById("button_buy_"+workers[i].name).innerHTML = "<b>$"+workers[i].getPrice() + "</b> " + workers[i].readableName+
																			   "<b style=\"float:right\">"+workers[i].bought+"</b>"+
																			   "<br>&nbsp;&nbsp;&nbsp;(+$"+workers[i].efficiency+" per sec)";
			if(Game.moneyCurrent < workers[i].getPrice()) {
				document.getElementById("button_buy_"+workers[i].name).classList.add("buybuttonlocked");
			} else {
				document.getElementById("button_buy_"+workers[i].name).classList.remove("buybuttonlocked");
			}
		}
	}
}

function cheat() {
	log("Fine, if you really want to cheat,");
	log("here's some free money. Go wild.");
	Game.moneyCurrent += 999999999;
	Game.moneyAllTime += 999999999;	
}

function log(input) {
	//Game is still loading.
	if(Game.version == undefined) {
		console.log(input);	
	} else {
		console.log("Clicker Game "+Game.version+": "+input);
	}
}