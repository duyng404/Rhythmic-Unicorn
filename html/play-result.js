var quizResult;
var finished;

window.onload = function() {
	// make sure in the right place
	var current = localStorage.getItem('current');
	var next = localStorage.getItem('next');
	if (current === null) window.location.href = "/";
	else if (current != 'play-result.html'){
		window.location.href = "/"+current;
	}
	finished = localStorage.getItem('finished');
	
	var total = 0;
	surveyResult = JSON.parse(localStorage.getItem('survey-result'));
	total += displaySurveyResult(surveyResult);
	quizResult = JSON.parse(localStorage.getItem('quiz-result'));
	total += displayQuizResult(quizResult);
	displayTotal(total);

	if (finished == 'false'){
		finished == 'true';
		localStorage.setItem('balance',parseInt(localStorage.getItem('balance'))+total);
		localStorage.setItem('finished','true');
	}
	displayFooter();
}

$('#finish').click(function(){
	window.location.href = "/";
})

function displaySurveyResult(data){
	// You listed 8 songs in the survey, 5 of which are new relations!
	// Here is the summary:
	// <seed song> is related to:
	// - <song id>
	//    80% Related. +1 Contribution Token
	// - <song id>
	//    New relation. +5 Contribution Token
	var totalRelations = data.length;
	var newRelations = 0;
	var totalReward = 0;
	var seedSongName = data[0].songs[0].title + ' by ' + data[0].songs[0].artist;
	$('#result-survey').append('<p><span class="songName">' + seedSongName + '</span> is related to:</p>');
	$('#result-survey').append('<ul></ul>');
	for (const i of data){
		var songName = i.songs[1].title + ' by ' + i.songs[1].artist;
		var ratio = i.ratio;
		var reward = i.reward;
		if (reward == 5) newRelations+=1;
		totalReward += reward;
		$('#result-survey ul').append('<li><span class="songName">'+songName+'</span><br />'
			+'<span class="songName">'+ratio+'%</span> Related. <span class="songName">+'+reward+'</span> Contribution Token(s)</li>');
	}
	$('#result-survey').prepend('<p>You listed <span class="songName">'+totalRelations+'</span> songs in the survey, '
		+'<span class="songName">'+newRelations+'</span> of which are new relations!</p>'
		+'<p>You gained <span class="songName">'+totalReward+'</span> Contribution Tokens in total.</p>'
		+'<p>You gained an additional <span class="songName">25</span> Contribution Tokens for playing Exploration Mode!</p>'
		+'<p>Here is the summary:</p>');
	return totalReward+25;
}

function displayQuizResult(data){
	console.log(data);
	var totalRelations = data.length;
	var newRelations = 0;
	var totalReward = 0;
	$('#result-quiz').append('<ul></ul>');
	for (const i of data){
		var songName1 = i.songs[0].title + ' by ' + i.songs[0].artist;
		var songName2 = i.songs[1].title + ' by ' + i.songs[1].artist;
		var ratio = i.ratio;
		var reward = i.reward;
		if (reward == 5) newRelations+=1;
		totalReward += reward;
		$('#result-quiz ul').append('<li>\
			<p><span class="songName">' + songName1 + '</span> is related to <br/>\
			<span class="songName">'+songName2+'</span><br />'
			+'<span class="songName">'+ratio+'%</span> Related. <span class="songName">+'+reward+'</span> Contribution Token(s)\
			</li>');
	}
	$('#result-quiz').prepend('<p>You rated <span class="songName">'+totalRelations+'</span> relations in total, '
		+'<span class="songName">'+newRelations+'</span> of which are newly added relations!</p>'
		+'<p>You gained <span class="songName">'+totalReward+'</span> Contribution Tokens in total.</p>'
		+'<p>You gained an additional <span class="songName">10</span> Contribution Tokens for playing Confimation Mode!</p>'
		+'<p>Here is the summary:</p>');
	return totalReward+10;
}

function displayTotal(total){
	$('#total').html('Total Reward: '+total+' Contribution Tokens');
}

function displayFooter(){
	var balance = parseInt(localStorage.getItem('balance'));
	var current = localStorage.getItem('current');
	$('#footer').empty();
	$('#footer').append('<p>Current Tokens: '+balance+'</p>');
	if (current == 'play-1.html'){
		$('#footer').append('<p>Current Mode: Exploration Mode (1 out of 2)</p>');
		$('#footer').append('<p>Hint: Using Google or other music database is encouraged</p>');
		$('#footer').append('<p><a href="/">Exit to homepage</a></p>');
	}
	if (current == 'play-2.html'){
		$('#footer').append('<p>Current Mode: Confirmation Mode (2 out of 2)</p>');
		$('#footer').append('<p>Questions left: '+quizList.length+'</p>');
		$('#footer').append('<p><a href="/">Exit to homepage</a></p>');
	}
}