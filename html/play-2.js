var ytToken = "AIzaSyBI9Fv5kTKSAymabcCHL0K9dJsTHAzC2hA";
var seedId = "";
var quizList = [];
var answer = [];
var result = [];
var song1, song2;

window.onload = function(){
	// make sure in the right place
	var current = localStorage.getItem('current');
	var next = localStorage.getItem('next');
	var finished = localStorage.getItem('finished');
	if (finished == 'true') window.location.href = "/play-result.html";
	if (current === null) window.location.href = "/";
	else if (current != 'play-2.html' || next != 'play-result.html'){
		window.location.href = "/"+current;
	}
	seedId = localStorage.getItem('seedId');
	// get relations
	$.ajax({
		url: '/api/relation',
		type: "GET",
		success: function(data){
			quizList = data;
			nextQuiz();
		}
	});
}

function nextQuiz(){
	if (quizList.length > 0){
		var question = quizList.shift();
		song1 = question.songs[0];
		song2 = question.songs[1];
		displaySong(song1,"#quiz-song1");
		displaySong(song2,"#quiz-song2");
		displayFooter();
	} else {
		gameOver();
	}
}

$("#quiz-yes").click(function(){
	var tmp = [];
	tmp.push({"spotId":song2.spotId,"rating":"up"});
	answer.push({"seedSongId":song1.spotId, "relatedSongs":JSON.stringify(tmp)});
	nextQuiz();
});

$("#quiz-no").click(function(){
	var tmp = [];
	tmp.push({"spotId":song2.spotId,"rating":"down"});
	answer.push({seedSongId:song1.spotId, relatedSongs:JSON.stringify(tmp)});
	nextQuiz();
});

async function gameOver(){
	for (const i of answer){
		await sendOneRelation(i).
			then(function(data){
				result.push(data[0]);
			});
	}
	localStorage.setItem('quiz-result',JSON.stringify(result));
	var next = localStorage.getItem('next');
	localStorage.removeItem('next');
	localStorage.setItem('current','play-result.html');
	window.location.href = "/"+next;
}

function sendOneRelation(rel){
	return new Promise((resolve,reject) => {
		$.ajax({
			url: '/api/relation',
			data:rel,
			type: "POST",
			headers: {
				'Content-Type': 'application/x-www-form-urlencoded',
			},
			success: function(data){
				resolve(data);
				// localStorage.setItem('quiz-answer',JSON.stringify(data));
				// var next = localStorage.getItem('next');
				// localStorage.removeItem('next');
				// window.location.href = "/"+next;
			},
			error: function(jqxhr, err, ex){
				reject(err+' '+ex);
			}
		});
	});
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
		$('#footer').append('<p>Current Mode: Quiz Mode (2 out of 2)</p>');
		$('#footer').append('<p>Questions left: '+quizList.length+'</p>');
		$('#footer').append('<p><a href="/">Exit to homepage</a></p>');
	}
}

// helper function to display song
function displaySong(song, element){
	// all the jplayer shit
	var jpplayer = "";
	if (song.preview !== "" && song.preview != null){
		jpplayer = '\
			<div id="jplayer-player-'+song.spotId+'" class="jp-jplayer"></div>\
			<div id="jplayer-wrapper-'+song.spotId+'" class="jp-audio player" role="application" aria-label="media player">\
				<button class="jp-play"><i class="fa fa-play" aria-hidden="true"></i><i class="fa fa-pause" aria-hidden="true"></i></button><!--\
				--><div class="progress-bar">\
					<div class="jp-seek-bar">\
						<div class="jp-play-bar"></div>\
						<div class="time">\
						</div>\
					</div>\
				</div>\
			</div>';
	}

	// add the HTML
	$(element).empty();
	$(element).append('\
		<div class="albumcover">\
			<div class="songtitle">'+song.title+'</div>\
			<div class="artist">'+song.artist+'</div>\
			<div class="album">'+song.album+'</div>'+jpplayer+'\
		</div>');

	// add identifying data
	$(element).data('songinfo',song);

	// modify the background to album cover
	var ss = element+" > .albumcover";
	$(ss).css("background-image", $(ss).css("background-image") + ",url('"+song.img+"')");
	$(ss).css("background-size", "cover");
	$(ss).css("background-position", "center center");

	// link jplayer
	if (song.preview !== "" && song.preview != null){
		$("#jplayer-player-"+song.spotId).jPlayer( {
		ready: function () {
		  $(this).jPlayer("setMedia", {
			mp3: song.preview // Defines the mp3 url
		  });
		},
			play: function () { $(this).addClass("playing").jPlayer("pauseOthers"); },
			cssSelectorAncestor: "#jplayer-wrapper-"+song.spotId,
			useStateClassSkin: true,
			preload: "none"
		});

		// click on a song play/pause it
		$(ss).click( function(){
			var aa = $(this).children(".jp-jplayer");
			if (aa.length == 0) return;
			if (aa.hasClass("playing")){
				aa.jPlayer( "pause" );
				aa.removeClass("playing");
			}
			else{
				aa.jPlayer( "play" );
				aa.addClass("playing");
			}
		});
	} else {
		// if preview not available, load youtube on click
		$(ss).click(function(){
			var query = song.title + ' ' + song.artist;
			$.ajax({
				url: 'https://www.googleapis.com/youtube/v3/search',
				data:{
					part: 'snippet',
					maxResults: 1,
					q: query,
					type: 'video',
					key: ytToken
				},
				type: "GET",
				headers: {
					'Accept': 'application/json',
					'Content-Type': 'application/json',
				},
				success: function(data){
					var id = data.items[0].id.videoId;
					$(ss).append('<iframe type="text/html" src="https://www.youtube.com/embed/'+id+'?autoplay=1&controls=1&fs=0&modestbranding=1&rel=0&showinfo=1&disablekb=1&start=30" frameborder="0"></iframe>');
				}
			});
			//$(ss).append()
		});
	}
}
