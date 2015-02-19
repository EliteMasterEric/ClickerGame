//HTML elements, as variables for ease of use.
//underscores_between_words designate DOM elements, while lowerCamelCase repressents JavaScript variables.
//Buttons
var button_menu_stats; //Option 0
var button_menu_options; //Option 1
//Menu Contents
var menucontents_stats; //Option 0
var menucontents_options; //Option 1
//Stats fields
var current_upgrades;
var total_upgrades;
//Options fields
var selectedMenuOption;
var selectedMenuOptionLast;
var selectedFormat = 0;

//Initialization
$(document).ready(function(){
    log('Initializing tab menu...');
	selectedMenuOption = 0;
    
    log('Initializing tab menu variables...');
    //Set elements to variables for convenience.
    //Buttons
    button_menu_stats = document.getElementById("button_menu_stats");
    button_menu_options = document.getElementById("button_menu_options");
	//Menus
	menucontents_stats = document.getElementById("menucontents_stats");
	menucontents_options = document.getElementById("menucontents_options");
	//Stats fields
	current_upgrades = document.getElementById("current_upgrades");
	total_upgrades = document.getElementById("total_upgrades");
	//Run methods.
	drawMenu();

});

//Function used by buttons to set the current menu option.
function setCurrentOption(option) {
	selectedMenuOption = option;	
}

//Render stuff, change numbers, etc.
function drawMenu() {
	//If the menu option has changed...
	if(selectedMenuOption != selectedMenuOptionLast) {
		//Set what to display.
		switch(selectedMenuOption) {
			case 0:
				button_menu_stats.className = "menubutton menubuttonselected";
				button_menu_options.className = "menubutton";
				menucontents_stats.style = "display:block";
				menucontents_options.style = "display:none";
				break;
			case 1:
				button_menu_stats.className = "menubutton";
				button_menu_options.className = "menubutton menubuttonselected";
				menucontents_stats.style = "display:none";
				menucontents_options.style = "display:block";
				break;
			default:
				button_menu_stats.className = "menubutton menubuttonselected";
				button_menu_options.className = "menubutton";
				menucontents_stats.style = "display:none";
				menucontents_options.style = "display:block";
				break;
		}
	}
	//This is for checking if the menu option has changed,
	//to prevent running lots of code every 1/10 of a second.
	selectedMenuOptionLast = selectedMenuOption;
	selectedFormat = getRadioValue("formatType");
	
	var currentUpgrades = 0;
	var totalUpgrades = 0;
	//Set the current/total upgrades.
	for(var i in upgrades) {
		if(upgrades[i].bought == 1) {
			currentUpgrades += 1;	
		}
		totalUpgrades += 1;
	}
	current_upgrades.innerHTML = currentUpgrades;
	total_upgrades.innerHTML = totalUpgrades;
	
	//Run the code again in 1/10 of a second.
    setTimeout(drawMenu, 100);
}

function getRadioValue(radioGroup) {
    var elements = document.getElementsByName(radioGroup);
    for (var i = 0, l = elements.length; i < l; i++) {
        if (elements[i].checked) {
            return i;
        }
    }
}