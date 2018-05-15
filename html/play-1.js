const questions = [
"How many songs can you name that is similar to ...",
"What other songs remind you of ...",
"What songs would you put in the same playlist with ...",
"What songs sound just like ...",
"How may songs have the same genre with ...",
"What other artists wrote songs like ...",
"What songs convey the same meaning as ...",
"What other songs made you feel like ...",
"What genre of songs does ... belong to ?",
"What are in the same ballpark with ..."
]
var ytToken = "AIzaSyBI9Fv5kTKSAymabcCHL0K9dJsTHAzC2hA";
var seedId = "";
var gCount = 1;
var timeLeft = 300;
var timeElapsed = 0;

// --------------- UI BEHAVIORS -------------------

// collapsible question song
$("#question-title,#question-artist,#question-play").hover(
	function(){
		$("#question-title").css("color","#00d8f4");
		$("#question-artist").css("color","#00d8f4");
		$("#question-play").css("color","#00d8f4");
	}, function(){
		$("#question-title").css("color","#00b6ce");
		$("#question-artist").css("color","#00b6ce");
		$("#question-play").css("color","#666");
	})
	.click(function(){
		if ($("#question-video").css("display") == "none")
			$("#question-video").css("display","block");
		else
			$("#question-video").css("display","none");
	}
);

// when pressing enter in searchbox
$("#query").on('keyup', function (e) {
	if (e.keyCode == 13) {
		performSearch();
	}
});

// when search button is clicked, send a request to spotify
$('#search').click(performSearch);

function assignBehaviorForResults(path){
	$(path).hover(
		function(){
			var aa = $(".select-button",this);
			aa.css("opacity","1");
		}, function(){
			var aa = $(".select-button",this);
			aa.css("opacity",".1");
		}
	);

	// click on a song play/pause it
	$(path+" .albumcover").click( function(){
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

	// click on select button to add
	$(path+' .select-button').click(function(){
		$.jPlayer.pause();
		$(path+' iframe').remove();
		var data = $(this).parent().data('songinfo');
		// unbind everything
		$(path+' *').unbind();
		// fadein overlay
		$(path+' .select-overlay').fadeIn(300);

		$('.hideAtFirst').removeClass('hideAtFirst');

		// add to current selection
		$('#current').append('\
			<div class="selected" id="selected-'+data.count+'">\
				<div class="albumcover">\
					<div class="songtitle">'+data.title+'</div>\
					<div class="artist">'+data.artist+'</div>\
					<div class="album">'+data.album+'</div>\
				</div>\
				<button class="select-button">remove</button>\
				<div class="select-overlay">Song Removed</div>\
			</div>');
		// modify the background to album cover
		var ss = "#selected-"+data.count+" > .albumcover";
		$(ss).css("background-image", $(ss).css("background-image") + ",url('"+data.img+"')");
		$(ss).css("background-size", "cover");
		$(ss).css("background-position", "center center");
		// add data
		$('#selected-'+data.count).data('songinfo',data);
		// behaviors
		assignBehaviorForSelected('#selected-'+data.count);
	});
}

function assignBehaviorForSelected(path){
	$(path).hover(
		function(){
			var aa = $(".select-button",this);
			aa.css("opacity","1");
		}, function(){
			var aa = $(".select-button",this);
			aa.css("opacity",".1");
		}
	);

	// click on remove button to remove
	$(path+' .select-button').click(function(){
		var data = $(this).parent().data('songinfo');
		// unbind everything
		$(path+' *').unbind();
		// fadein overlay
		$(path).fadeOut(300,function(){
			$(path).remove();
		});
	});
}

$('#finish').click(gameOver);

// ------------------ ON LOAD -------------------

window.onload = function(){
	// make sure in the right place
	var current = localStorage.getItem('current');
	var next = localStorage.getItem('next');
	var finished = localStorage.getItem('finished');
	if (finished == 'true') window.location.href = "/play-result.html";
	if (current === null) window.location.href = "/";
	else if (current != 'play-1.html' || next != 'play-2.html'){
		window.location.href = "/"+current;
	}
	// get a seed song
	$.ajax({
		url: '/api/getSeed',
		type: "GET",
		success: function(data){
			seedId = data.spotId;
			$('#question-title').html(data.title);
			$('#question-artist').html('by '+data.artist);
			var query = data.title + ' ' + data.artist;
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
					$("#question-video .aspect-ratio").append('<iframe type="text/html" src="https://www.youtube.com/embed/'+id+'" frameborder="0"></iframe>');
				}
			});
			window.setInterval(gameLoop,1000);
		}
	});
	displayFooter();
}

// ----------------- GAME LOOP ------------------------

function gameLoop(){
	if (timeElapsed == 0){
		$('#loading').remove();
		$('#question-text').animate({opacity:1},400);
	}
	if (timeElapsed == 1){
		$('#spotlight').animate({opacity:1},400);
		$('#question-play').animate({opacity:1},400);
	}
	if (timeElapsed == 2){
		$('#search-bar').animate({opacity:1},400);
		$('#results').animate({opacity:1},100);
		window.setInterval(changeQuestion,7000);
	}
	if (timeElapsed == 3){
		$('#timer').animate({opacity:1},300);	
	}
	if (timeLeft <= 0){
		console.log('BRO');
		gameOver();
	}
	console.log(timeLeft);
	
	var min = Math.floor(timeLeft/60);
	var sec = ("0" + timeLeft % 60).slice(-2);
	$('#minLeft').html(min);
	$('#secLeft').html(sec);
	
	if (timeElapsed > 3){
		timeLeft -= 1;	
	}
	timeElapsed += 1;
}

function changeQuestion(){
	var rand = Math.floor(Math.random() * questions.length);
	$('#question-text').animate({opacity:0},100,function(){
		$('#question-text').html(questions[rand]);
		$('#question-text').animate({opacity:1},100);
	});
}

function gameOver(){
	if ( $.trim( $('#current').html() ).length ){
		var listOfId = [];
		$('#current').children('.selected').each(function(){
			var data = $(this).data('songinfo');
			listOfId.push( {"spotId":data.spotId,"rating":"up"} );
		});
		$.ajax({
				url: '/api/relation',
				data:{
					seedSongId: seedId,
					relatedSongs: JSON.stringify(listOfId)
				},
				type: "POST",
				headers: {
					'Content-Type': 'application/x-www-form-urlencoded',
				},
				success: function(data){
					localStorage.setItem('survey-result',JSON.stringify(data));
					var next = localStorage.getItem('next');
					localStorage.setItem('current','play-2.html');
					localStorage.setItem('next','play-result.html');
					localStorage.setItem('seedId',seedId);
					window.location.href = "/"+next;
				},
				error: function(jqxhr, err, ex){
					console.log(err);
					console.log(ex);
				}
			});
	} else {
		localStorage.setItem('survey-result','[]');
		var next = localStorage.getItem('next');
		localStorage.setItem('current','play-2.html');
		localStorage.setItem('next','play-result.html');
		localStorage.setItem('seedId',seedId);
		window.location.href = "/"+next;
	}
}

// ----------------- DATA HANDLING --------------------

function displayFooter(){
	var balance = parseInt(localStorage.getItem('balance'));
	var current = localStorage.getItem('current');
	$('#footer').empty();
	$('#footer').append('<p>Current Tokens: '+balance+'</p>');
	if (current == 'play-1.html'){
		$('#footer').append('<p>Current Mode: Survey Mode (1 out of 2)</p>');
		$('#footer').append('<p><span style="color:yellow">Hint:</span> Using Google or other music database is encouraged</p>');
		$('#footer').append('<p><span style="color:yellow">Hint:</span> Refresh page to get a new song</p>');
		$('#footer').append('<p><a href="/">Exit to homepage</a></p>');
	}
	if (current == 'play-2.html'){
		$('#footer').append('<p>Current Mode: Confirmation Mode (2 out of 2)</p>');
		$('#footer').append('<p>Questions left: '+quizList.length+'</p>');
		$('#footer').append('<p><a href="/">Exit to homepage</a></p>');
	}
}

function performSearch(){
	var query = $('#query').val();
	$('#results').html("Waiting for response ...");
	$.ajax({
		url: '/api/search/'+query,
		type: "GET",
		success: populateResult
	});
};

// putting the data collected to #results
function populateResult(data){
	//ytQ = data.tracks.items.slice(0,5);
	//searchYoutube();
	$('#results').empty();
	data.forEach(function(i){
		var title = i.title;
		var artist = i.artist;
		var album = i.album;
		var img = i.img;
		var preview = i.preview;
		var spotId= i.spotId;
		//console.log(i);
		if (preview === null) preview = "";
		addResult(gCount, title, artist, album, img, preview, spotId);
		gCount++;
	});
}

// helper function to add an entry to #results
function addResult(count, title, artist, album, img, preview, spotId){
	// all the jplayer shit
	var jpplayer = "";
	if (preview != ""){
		jpplayer = '\
			<div id="jplayer-player-'+count+'" class="jp-jplayer"></div>\
			<div id="jplayer-wrapper-'+count+'" class="jp-audio player" role="application" aria-label="media player">\
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
	$("#results").append('\
	<div class="song" id="song-'+count+'">\
		<div class="albumcover">\
			<div class="songtitle">'+title+'</div>\
			<div class="artist">'+artist+'</div>\
			<div class="album">'+album+'</div>'+jpplayer+'\
		</div>\
		<button class="select-button">add</button>\
		<div class="select-overlay">Song Added<br /><i class="fa fa-arrow-down" aria-hidden="true"></i></div>\
	</div>');

	// add identifying data
	$('#song-'+count).data('songinfo',{count:count, title:title, artist:artist, album:album, img:img, preview:preview, spotId: spotId});

	// modify the background to album cover
	var ss = "#song-"+count+" > .albumcover";
	$(ss).css("background-image", $(ss).css("background-image") + ",url('"+img+"')");
	$(ss).css("background-size", "cover");
	$(ss).css("background-position", "center center");

	// link jplayer
	if (preview !== ""){
		$("#jplayer-player-"+count).jPlayer( {
		ready: function () {
		  $(this).jPlayer("setMedia", {
			mp3: preview // Defines the mp3 url
		  });
		},
			play: function () { $(this).addClass("playing").jPlayer("pauseOthers"); },
			cssSelectorAncestor: "#jplayer-wrapper-"+count,
			useStateClassSkin: true,
			preload: "none"
		});
	} else {
		// if preview not available, load youtube on click
		$(ss).click(function(){
			var query = title + ' ' + artist;
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
	assignBehaviorForResults("#song-"+count);
}
