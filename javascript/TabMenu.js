//HTML elements, as variables for ease of use.
//underscores_between_words designate DOM elements, while lowerCamelCase repressents JavaScript variables.
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
				$('#button_menu_stats').addClass("menubutton");
				$('#button_menu_stats').addClass("menubuttonselected");
				$('#button_menu_options').addClass("menubutton");
				$('#button_menu_options').removeClass("menubuttonselected");
				$('#menucontents_stats').attr("style", "display:block");
				$('#menucontents_options').attr("style", "display:none");
				break;
			case 1:
				$('#button_menu_stats').addClass("menubutton");
				$('#button_menu_stats').removeClass("menubuttonselected");
				$('#button_menu_options').addClass("menubutton");
				$('#button_menu_options').addClass("menubuttonselected");
				$('#menucontents_stats').attr("style", "display:none");
				$('#menucontents_options').attr("style", "display:block");
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