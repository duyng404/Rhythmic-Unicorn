var gCount = 1;
var ytToken = "AIzaSyBI9Fv5kTKSAymabcCHL0K9dJsTHAzC2hA";

window.onload = function(){
	theSong = JSON.parse(localStorage.getItem('viewSong'));
	$('#search-bar').animate({opacity:1},400);
	$('#spotlight').animate({opacity:1},400);
	$('#question-play').animate({opacity:1},400);

	var query = theSong.title + ' ' + theSong.artist;
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

	$('#question-title').html(theSong.title);
	$('#question-artist').html('by '+theSong.artist);

	displayRelated(theSong.relations);

	displayFooter();
}

$('#finish').click(function(){
	window.location.href = "/";
})

function displayRelated(array){
	for (const i of array){
		var ss = '#rel-'+gCount;
		var ss1 = ss+'-song1';
		var ss2 = ss+'-song2';
		$('#view').append('<div id="'+ss.substring(1)+'" class="view-relation"></div>');
		$(ss).append('<div id="'+ss1.substring(1)+'" class="view-relation-song1"></div>');
		displaySong(i.songs[0],ss1);
		$(ss).append('<div id="'+ss2.substring(1)+'" class="view-relation-song1"></div>');
		displaySong(i.songs[1],ss2);
		var ratio = '<span class="songName">'+i.ratio+'%</span> Related.';
		if (i.total < 10) ratio = '<span class="songName">New Relation.</span>';
		$('#view').append('<p>'+ratio+'</p>');
		gCount+=1;
	}
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

	// helper function to display song
function displaySong(song, element){
	// all the jplayer shit
	var jpplayer = "";
	if (song.preview !== ""){
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
	if (song.preview !== ""){
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
					$(ss).append('<iframe type="text/html" src="https://www.youtube.com/embed/'+id+'?autoplay=1&controls=0&fs=0&modestbranding=1&rel=0&showinfo=1&disablekb=1&start=30" frameborder="0"></iframe>');
				}
			});
			//$(ss).append()
		});
	}
}