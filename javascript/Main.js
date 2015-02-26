//HTML elements, as variables for ease of use.
//underscores_between_words designate DOM elements, while lowerCamelCase repressents JavaScript variables.
var jQuery;

var workers = [];
var upgrades = [];
var upgradesByID = [];

var updateRequired = {
	moneyPerSecond : true,
	moneyPerClick : true,
	clicksAllTime : true,
	workerEfficiency: true,
	storeUpgrades : true,
	storeWorkers : true,
	workerPrices : true,
	upgradePrices : true,
	totalWorkers : true,
	currentUpgrades : true
}

var currentValues = {
	moneyPerSecond : -1,
	moneyPerClick : -1,
	unlockedWorkers : [],
	unlockedUpgrades : [],
	unlockedUpgradesByID : [],
	workerEfficiency : [],
	workerPrices : [],
	upgradePrices : [],
	totalWorkers : -1,
	currentUpgrades : -1
}

//Values for the current game.
var Game = { };

//Initialization
$(document).ready( function(){
    log('Initializing Clicker Game...');
	Game.version = "v0.2";
    Game.moneyCurrent = 0;
    Game.moneyAllTime = 0;
	Game.clicksAllTime = 0;

	//Change page title.
	jQuery = jQuery(this);

    log('Initializing upgrades...');
	createUpgrades();
    log('Initializing workers...');
	createWorkers();
	
    update();
});

var upgradeID = -1;
Game.Upgrade = function(name, readableName, price, type, isUnlocked, description) {
	this.name = name;
	this.readableName = readableName;
	//0 = worker
	//1 = click
	//2 = worker cost
	this.type = type;
	this.unlocked = isUnlocked;
	this.description = description;
	upgradeID++;
	this.id = upgradeID;
	currentValues.unlockedUpgrades[this.name] = {name : this.name, id : workerID, unlocked : false};
	currentValues.unlockedUpgradesByID[upgradeID] = {name : this.name, id : workerID, unlocked : false};
	this.bought = 0;
	
	this.updatePrice = function() {
		//While upgrades are being defined, these are undefined and cause errors during execution.
		if(upgrades['fiveupgradecost'] == undefined || upgrades['tenupgradecost'] == undefined || upgrades['fifteenupgradecost'] == undefined)
			//The above things are rechecked when prices are updated again,
			//so the cost upgrades are affected
			return price;
		
		currentValues.upgradePrices[this.name] = Math.ceil(price
												*((upgrades['fiveupgradecost'].bought==1) ? 0.95 : 1)
												*((upgrades['tenupgradecost'].bought==1) ? 0.9 : 1)
												*((upgrades['fifteenupgradecost'].bought==1) ? 0.85 : 1));
	}
	
	this.buy = function() {
		if(Game.moneyCurrent >= currentValues.upgradePrices[this.name] && this.bought == 0) {
			Game.moneyCurrent -= currentValues.upgradePrices[this.name];
			this.bought = 1;
			updateRequired.currentUpgrades = true;
			switch(this.type) {
				case 0:
					updateRequired.workerEfficiency = true;
					updateRequired.moneyPerSecond = true;
					break;
				case 1:	
					updateRequired.moneyPerClick = true;
					break;
				case 2:
					updateRequired.workerPrices = true;
				case 3:
					updateRequired.upgradePrices = true;
			}
		}
	}
	
	//Add to list of upgrades.
	upgrades[this.name] = this;
	upgradesByID[upgradeID] = this;
	this.updatePrice();
	
	return this;
}

var workerID = -1;
Game.Worker = function(name, readableName, baseEfficiency, price, isUnlocked) {
	this.name = name;
	this.readableName = readableName;
	this.basePrice = price;
	this.unlocked = isUnlocked;
	workerID++;
	this.id = workerID;
	currentValues.unlockedWorkers[this.name] = {name : this.name, id : this.workerID, unlocked : false};
	this.baseEfficiency = baseEfficiency;
	currentValues.workerEfficiency[this.name] = -1;
	this.bought = 0;
	
	this.updatePrice = function() {		
		currentValues.workerPrices[this.name] = Math.ceil(this.basePrice * Math.pow(1.2, this.bought)
												*((upgrades['fiveworkercost'].bought==1) ? 0.95 : 1)
												*((upgrades['tenworkercost'].bought==1) ? 0.9 : 1)
												*((upgrades['fifteenworkercost'].bought==1) ? 0.85 : 1));
	}
	
	this.buy = function() {
		if(Game.moneyCurrent >= currentValues.workerPrices[this.name]) {
			Game.moneyCurrent -= currentValues.workerPrices[this.name];
			this.bought++;
			updateRequired.moneyPerSecond = true;
			updateRequired.workerPrices = true;
			updateRequired.totalWorkers = true;
		}
	}
	
	workers[this.name] = this;
	this.updatePrice();
	
	return this;
}

function createUpgrades() {
	new Game.Upgrade('fiveworkercost', '5% Lower Worker Costs', 250, 2, function() { return (currentValues.totalWorkers >= 10); }, 'multiplicative');
	new Game.Upgrade('tenworkercost', '10% Lower Worker Costs', 500, 2, function() { return (currentValues.totalWorkers >= 50); }, 'multiplicative');
	new Game.Upgrade('fifteenworkercost', '15% Lower Worker Costs', 1000, 2, function() { return (currentValues.totalWorkers >= 100); }, 'multiplicative');

	new Game.Upgrade('doubleclick','x2 Click Power', 50, 1, function() { return (Game.moneyCurrent >= 35); }, 'multiplicative');
	new Game.Upgrade('tripleclick','x3 Click Power', 125, 1, function() { return (Game.moneyCurrent >= 95); }, 'multiplicative');
	new Game.Upgrade('quadrupleclick','x4 Click Power', 500, 1, function() { return (Game.moneyAllTime >= 275); }, 'multiplicative');
	new Game.Upgrade('quintupleclick','x5 Click Power', 2500, 1, function() { return (Game.moneyAllTime >= 1750); }, 'multiplicative');
	
	new Game.Upgrade('fiveupgradecost', '5% Lower Upgrade Costs', 250, 2, function() { return (currentValues.currentUpgrades >= 3); }, 'multiplicative');
	new Game.Upgrade('tenupgradecost', '10% Lower Upgrade Costs', 500, 2, function() { return (currentValues.currentUpgrades >= 8); }, 'multiplicative');
	new Game.Upgrade('fifteenupgradecost', '15% Lower Upgrade Costs', 1000, 2, function() { return (currentValues.currentUpgrades >= 15); }, 'multiplicative');
	
	new Game.Upgrade('doubleworker','x2 Worker Efficiency', 100, 0, function() { return (workers['worker'].bought >= 5); }, 'multiplicative');
	new Game.Upgrade('tripleworker','x3 Worker Efficiency', 500, 0, function() { return (workers['worker'].bought >= 25); }, 'multiplicative');
	new Game.Upgrade('doublebuilder','x2 Builder Efficiency', 250, 0, function() { return (workers['builder'].bought >= 5); }, 'multiplicative');
	new Game.Upgrade('triplebuilder','x3 Builder Efficiency', 1250, 0, function() { return (workers['builder'].bought >= 25); }, 'multiplicative');
	new Game.Upgrade('doublefactory','x2 Factory Efficiency', 500, 0, function() { return (workers['factory'].bought >= 5); }, 'multiplicative');	
	new Game.Upgrade('triplefactory','x2 Factory Efficiency', 2500, 0, function() { return (workers['factory'].bought >= 25); }, 'multiplicative');
	new Game.Upgrade('doublelargefactory','x2 Large Factory Efficiency', 1000, 0, function() { return (workers['largefactory'].bought >= 5); }, 'multiplicative');
	new Game.Upgrade('triplelargefactory','x2 Large Factory Efficiency', 5000, 0, function() { return (workers['largefactory'].bought >= 25); }, 'multiplicative');
	new Game.Upgrade('doublehugefactory','x2 Huge Factory Efficiency', 7500, 0, function() { return (workers['hugefactory'].bought >= 5); }, 'multiplicative');
	new Game.Upgrade('triplehugefactory','x2 Huge Factory Efficiency', 25000, 0, function() { return (workers['hugefactory'].bought >= 25); }, 'multiplicative');
}

function createWorkers() {
	new Game.Worker('worker','Worker', 1, 10, function() { return (Game.moneyCurrent >= 5); });
	new Game.Worker('builder','Builder', 3, 25, function() { return (Game.moneyCurrent >= 15); });
	new Game.Worker('factory','Factory', 10, 100, function() { return (Game.moneyCurrent >= 75); });
	new Game.Worker('largefactory','Large Factory', 25, 250, function() { return (Game.moneyCurrent >= 175); });
	new Game.Worker('hugefactory','Huge Factory', 100, 2500, function() { return (Game.moneyCurrent >= 1500); });
}

var updateTimer = {
	secondsElapsed : 0,
	lastFrame : Date.now()
}

//Timed updates, occur each second
update = function() {
	//Probe for new upgrades that have unlocked.
	updateFunctions.probeUnlocks();
	//Update values in currentValues.
	if(updateRequired.moneyPerSecond) {
		updateFunctions.moneyPerSecond();
		$('#money_per_second').html(formatNumber(currentValues.moneyPerSecond));
	}
	if(updateRequired.moneyPerClick) {
		updateFunctions.moneyPerClick();
		$('#money_per_click').html(currentValues.moneyPerClick);
	}
	//Update the alltime clicks counter in the stats page, if needed.
 	if(updateRequired.clicksAllTime) {
		$('#clicks_all_time').html(Game.clicksAllTime);
		updateRequired.clicksAllTime = false;
	}
	if(updateRequired.workerEfficiency) {
		updateFunctions.workerEfficiency();
	}
	if(updateRequired.storeWorkers) {
		updateFunctions.storeWorkers();
	}
	if(updateRequired.storeUpgrades) {
		updateFunctions.storeUpgrades();
	}
	if(updateRequired.workerPrices) {
		updateFunctions.workerPrices();
	}
	if(updateRequired.upgradePrices) {
		updateFunctions.upgradePrices();	
	}
	if(updateRequired.totalWorkers) {
		updateFunctions.totalWorkers();	
	}
	if(updateRequired.currentUpgrades) {
		updateFunctions.currentUpgrades();
	}
	if(updateRequired.totalWorkers) {
		updateFunctions.totalWorkers();
	}
	updateFunctions.storeUpgradesPurchasable();
	updateFunctions.storeWorkersPurchasable();
	
	//Time since last update, in decimals of a second.
	updateTimer.secondsElapsed = (Date.now() - updateTimer.lastFrame) / 1000;

	//Increase current money by fractions of money per second,
	//based on current tick rate.
    Game.moneyCurrent += currentValues.moneyPerSecond * updateTimer.secondsElapsed;
    Game.moneyAllTime += currentValues.moneyPerSecond * updateTimer.secondsElapsed;
	
	//Draw the player's new money quantities.
	$('#money_current').html(formatNumber(Game.moneyCurrent));
	$('#money_all_time').html(formatNumber(Game.moneyAllTime));
	jQuery.attr("title", "$"+formatNumber(Game.moneyCurrent)+" - Clicker Game "+Game.version);
	
	
	//Set the current time for the next iteration of the timer.
    updateTimer.lastFrame = Date.now();
	
	//Run 20 times a second.
    setTimeout(update, 1000/20);
}

//Ran when the dollar button is clicked.
function onMoneyClicked() {
    Game.moneyCurrent += currentValues.moneyPerClick;
    Game.moneyAllTime += currentValues.moneyPerClick;
	Game.clicksAllTime++;
	updateRequired.clicksAllTime = true;
}

function formatNumber(number) {
	switch(selectedFormat) {
		case 0:
			if(number >= 1e12) {
				//Trillion
				return (number/1e12).toFixed(2) + " trillion";		
			} else if(number >= 1e9) {
				//Billion
				return (number/1e9).toFixed(2) + " billion";
			} else if(number >= 1e6) {
				//Million
				return (number/1e6).toFixed(2) + " million";
			} else if(number >= 1e3) {
				//Thousand
				return (number/1e3).toFixed(2) + " thousand";
			}
			return number.toFixed(2);
			break;
		case 1:
			if(number >= 1e12) {
				//Trillion
				return (number/1e12).toFixed(2).toString() + " T";		
			} else if(number >= 1e9) {
				//Billion
				return (number/1e9).toFixed(2).toString() + " B";
			} else if(number >= 1e6) {
				//Million
				return (number/1e6).toFixed(2).toString() + " M";
			} else if(number >= 1e3) {
				//Thousand
				return (number/1e3).toFixed(2).toString() + " K";
			}
			return number.toFixed(2);
			break;
		case 2:
			for(var i = 0; i<99; i++) {
					if(number <= Math.pow(10, i))
						return (number/Math.pow(10, i-1)).toFixed(3).toString() + "e"+(i-1);
			}
			break;
		case 3:
			//Fall through to default case.
		default:
			//Round to 2 decimal places.
			return number.toFixed(2);
			break;
			
	}
}

//Array of functions to update values like worker efficiency
//and money per click, when they need to be updated.

var updateFunctions = {
	probeUnlocks: function() {
		for(var i in currentValues.unlockedUpgrades) {
			//If it's already unlocked we don't need to check it.
			if(!currentValues.unlockedUpgrades[i].unlocked) {
				//If we haven't seen it's been unlocked, but it has...
				if(upgrades[i].unlocked()) {
					//Upgrade has been unlocked, redraw store.
					currentValues.unlockedUpgrades[i].unlocked = true;
					currentValues.unlockedUpgradesByID[upgrades[i].id].unlocked = true
				
					updateRequired.storeUpgrades = true;
				}
			}
		}
		for(var i in currentValues.unlockedWorkers) {
			//If it's already unlocked we don't need to check it.
			if(!currentValues.unlockedWorkers[i].unlocked) {
				//If we haven't seen it's been unlocked, but it has...
				if(workers[i].unlocked()) {
					//Upgrade has been unlocked, redraw store.
					currentValues.unlockedWorkers[i].unlocked = true;
					updateRequired.storeWorkers = true;
				}
			}
		}
	},
	moneyPerClick : function() {
		updateRequired.moneyPerClick = false;
		currentValues.moneyPerClick = 1
			*((upgrades['doubleclick'].bought==1) ? 2 : 1)
			*((upgrades['tripleclick'].bought==1) ? 3 : 1)
			*((upgrades['quadrupleclick'].bought==1) ? 4 : 1)
			*((upgrades['quintupleclick'].bought==1) ? 5 : 1);
	},
	moneyPerSecond : function() {
		updateRequired.moneyPerSecond = false;

		var moneyPerSecond = 0;
		for(var i in workers) {
			if(workers[i].bought >= 1) {
				moneyPerSecond += (workers[i].bought * currentValues.workerEfficiency[i]);
			}
		}
		currentValues.moneyPerSecond = moneyPerSecond;
	},
	storeWorkers : function() {
		//Empty the store, we're starting over.
		//This method is only run when something is changed,
		//so we're okay.
		$('#column_workers').empty();
		
		var workersArray = [];
		for(var i in currentValues.unlockedWorkers) {
			if(currentValues.unlockedWorkers[i].unlocked) {
				workersArray[i] = workers[i];
			}
		}
		//If there are actually unlocked workers...
		if(workersArray != undefined) {
			workersArray.sort(updateFunctions.sortWorkers);
			for(var i in workersArray) {
				$('#column_workers').append(
					$("<button>Test</button>")
						.html("<b>$"+currentValues.workerPrices[i] + "</b> " + workers[i].readableName)
						.attr("id", "button_buy_"+workers[i].name)
						.addClass("buybuttonright")
						.click(function(i){ return function(){ workers[i].buy(); }; } (i)
					)
				);
			}
		}
		updateRequired.storeWorkers = false;
	},
	sortWorkers : function(a,b) {
		console.log("SortWorkers");
		return currentValues.workerPrices[b.name] - currentValues.workerPrices[a.name];
	},
	storeUpgrades : function() {
		//Empty the store, we're starting over.
		//This method is only run when something is changed,
		//so we're okay.
		$('#column_upgrades').empty();
		
		var upgradesArray = [];
		for(var i in currentValues.unlockedUpgrades) {
			if(currentValues.unlockedUpgrades[i].unlocked) {
				upgradesArray[i] = upgrades[i];
			}
		}
		//If there are actually unlocked upgrades...
		if(upgradesArray != undefined) {
			upgradesArray.sort(updateFunctions.sortUpgrades);
			for(var i in upgradesArray) {
				$('#column_upgrades').append(
					$("<button>Test</button>")
						.html("<b>$"+currentValues.upgradePrices[i] + "</b> " + upgrades[i].readableName
							  +"<br><b style=\"font-size: 50%\">"+upgrades[i].description+"</b>")
						.attr("id", "button_buy_"+upgrades[i].name)
						.addClass("buybuttonleft")
						.click( function(i){ return function(){ upgrades[i].buy(); }; }(i)
					)
				);
			}
		}

		updateRequired.storeUpgrades = false;			
	},
	sortUpgrades : function(a,b) {
		console.log("SortUpgrades");
		return currentValues.upgradePrices[a.name] - currentValues.upgradePrices[b.name];
	},
	storeUpgradesPurchasable : function() {
		for(var i in upgrades) {
			if(currentValues.unlockedUpgrades[i].unlocked) {
				if(upgrades[i].bought == 0) {
					if(Game.moneyCurrent < currentValues.upgradePrices[i]) {
						$("#button_buy_"+i).addClass("buybuttonlocked");
					} else {
						$("#button_buy_"+i).removeClass("buybuttonlocked");	
					}
				} else {
					$("#button_buy_"+i).removeClass("buybuttonlocked");	
					$("#button_buy_"+i).addClass("buybuttonhidden");	
				}
				$("#button_buy_"+i).html("<b>$"+currentValues.upgradePrices[i] + "</b> " + upgrades[i].readableName
							  +"<br><b style=\"font-size: 50%\">"+upgrades[i].description+"</b>")
			}
		}
	},
	storeWorkersPurchasable : function() {
		for(var i in workers) {
			if(currentValues.unlockedWorkers[i].unlocked) {
				if(Game.moneyCurrent < currentValues.workerPrices[i]) {
					$("#button_buy_"+workers[i].name).addClass("buybuttonlocked");
				} else {
					$("#button_buy_"+workers[i].name).removeClass("buybuttonlocked");	
				}
				//Update the workers bought count on the button.
				$("#button_buy_"+workers[i].name).html("<b>$"+currentValues.workerPrices[i] + "</b> " + workers[i].readableName+
												       "<b style=\"float:right\">"+workers[i].bought+"</b>"+
													   "<br>&nbsp;&nbsp;&nbsp;(+$"+currentValues.workerEfficiency[i]+" per sec)");
			}
		}
	},
	workerEfficiency : function() {
		currentValues.workerEfficiency['worker'] = workers['worker'].baseEfficiency
													 * (upgrades['doubleworker'].bought==1 ? 2 : 1)
 													 * (upgrades['tripleworker'].bought==1 ? 3 : 1);	
		currentValues.workerEfficiency['builder'] = workers['builder'].baseEfficiency
													 * (upgrades['doublebuilder'].bought==1 ? 2 : 1)
 													 * (upgrades['triplebuilder'].bought==1 ? 3 : 1);
		currentValues.workerEfficiency['factory'] = workers['factory'].baseEfficiency
													 * (upgrades['doublefactory'].bought==1 ? 2 : 1)
 													 * (upgrades['triplefactory'].bought==1 ? 3 : 1);
		currentValues.workerEfficiency['largefactory'] = workers['largefactory'].baseEfficiency
													 * (upgrades['doublelargefactory'].bought==1 ? 2 : 1)
													 * (upgrades['triplelargefactory'].bought==1 ? 3 : 1);
 		currentValues.workerEfficiency['hugefactory'] = workers['hugefactory'].baseEfficiency
													 * (upgrades['doublehugefactory'].bought==1 ? 2 : 1)
													 * (upgrades['triplehugefactory'].bought==1 ? 3 : 1);
		updateRequired.workerEfficiency = false;
		updateRequired.moneyPerSecond = true;
		updateRequired.storeWorkers = true;
	},
	workerPrices : function() {
		for(var i in workers) {
			workers[i].updatePrice();	
		}
		updateRequired.workerPrices = false;
	},
	upgradePrices : function() {
		for(var i in upgrades) {
			upgrades[i].updatePrice();	
		}
		updateRequired.upgradePrices = false;
	},
	totalWorkers : function() {
		var num = 0;
		for(var i in workers) {
			num += workers[i].bought;
		}
		$('#total_workers').html(num);
		currentValues.totalWorkers = num;
		updateRequired.totalWorkers = false;
	},
	currentUpgrades : function() {
		var currentUpgrades = 0;
		var totalUpgrades = 0;
		for(var i in upgrades) {
			currentUpgrades += upgrades[i].bought;
			totalUpgrades++;	
		}
		currentValues.currentUpgrades = currentUpgrades;
		$('current_upgrades').html(currentUpgrades);
		$('total_upgrades').html(totalUpgrades);
			
	}
};

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