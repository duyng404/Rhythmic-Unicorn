var spToken = "";
var ytToken = "AIzaSyBI9Fv5kTKSAymabcCHL0K9dJsTHAzC2hA";
var ytQ = [];

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

// hovering over a song makes the Add button appear
function assignHover(){
	$(".song").hover(
		function(){
			var aa = $(".select-button",this);
			aa.css("opacity","1");
		}, function(){
			var aa = $(".select-button",this);
			aa.css("opacity",".1");
		}
	)
}

// click on a song play/pause it
function assignClick(){
	$(".albumcover").click( function(){
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
}

// ------------------ DATA HANDLING -------------------

// get the spotify token as soon as the script is loaded
$.get('/api/getSpotifyToken',function(data){
	spToken = data.token;
});

// when search button is clicked, send a request to spotify
$('#search').click(performSearch);

function performSearch(){
	//var query = encodeURIComponent($('#query').val());
	var query = $('#query').val();
	$('#result-spotify').html("Waiting for response ...");
	$('#result-youtube').html("Waiting for response ...");
	$.ajax({
		url: 'https://api.spotify.com/v1/search',
		data:{
			q: query,
			type: 'track',
			limit: 15,
			market: 'US'
		},
		type: "GET",
		headers: {
			'Accept': 'application/json',
			'Content-Type': 'application/json',
			'Authorization': spToken
		},
		success: populateResult
	});
};

// putting the data collected to #results
function populateResult(data){
	//ytQ = data.tracks.items.slice(0,5);
	//searchYoutube();
	$('#results').empty();
	var count=1;
	data.tracks.items.forEach(function(i){
		var title = i.name;
		var artist = i.artists[0].name;
		var album = i.album.name;
		var img = i.album.images[0].url;
		var sample = i.preview_url;
		//console.log(i);
		if (sample === null) sample = "";
		addResult(count, title, artist, album, img, sample);
		count++;
	});
	assignHover();
	assignClick();
}

// helper function to add an entry to #results
function addResult(count, title, artist, album, img, preview){
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
	</div>');

	// modify the background to album cover
	var ss = "#song-"+count+" > .albumcover";
	$(ss).css("background-image", $(ss).css("background-image") + ",url('"+img+"')");
	$(ss).css("background-size", "cover");
	$(ss).css("background-position", "center center");

	// link player
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
		$(ss).click(function(){
			var query = title + artist;
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
