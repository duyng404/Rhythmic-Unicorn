var balance;

window.onload = function() {
	balance = localStorage.getItem('balance');
	if (balance == null){
		localStorage.clear();
		localStorage.setItem('balance',0);
		balance = 0;
	} else {
		balance = parseInt(balance);
		localStorage.clear();
		localStorage.setItem('balance',balance);
	}
	$('#balance').html('You currently have '+balance+' Tokens');
	displayFooter();
}

function scrollToInfo(){
	document.querySelector('#infoo').scrollIntoView({ 
		block: "start",
		inline: "nearest",
		behavior: 'smooth' 
	});
}

function scrollToExtra(){
	document.querySelector('#extraa').scrollIntoView({ 
		block: "start",
		inline: "nearest",
		behavior: 'smooth' 
	});
}

function play(){
	localStorage.clear();
	localStorage.setItem('balance',balance);
	localStorage.setItem('current','play-1.html');
	localStorage.setItem('next','play-2.html');
	localStorage.setItem('finished','false');
	window.location.href = "/play-1.html";
}

function displayFooter(){
	var balance = parseInt(localStorage.getItem('balance'));
	var current = localStorage.getItem('current');
	$('#footer').empty();
	$('#footer').append('<p>Current Tokens: '+balance+'</p>');
	if (current == 'play-1.html'){
		$('#footer').append('<p>Current Stage: 1 out of 2</p>');
		$('#footer').append('<p>Hint: Using Google or other music databases is encouraged</p>');
		$('#footer').append('<p><a href="/">Exit to homepage</a></p>');
	}
	if (current == 'play-2.html'){
		$('#footer').append('<p>Current Stage: 2 out of 2</p>');
		$('#footer').append('<p>Questions left: '+quizList.length+'</p>');
		$('#footer').append('<p><a href="/">Exit to homepage</a></p>');
	}
}