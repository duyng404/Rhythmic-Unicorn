var ytToken = "AIzaSyBI9Fv5kTKSAymabcCHL0K9dJsTHAzC2hA";
var gCount = 1;

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

// hovering over a song makes the Add button appear
function assignHover(){
	$(".song, .selected").unbind();
	$(".song, .selected").hover(
		function(){
			var aa = $(".select-button",this);
			aa.css("opacity","1");
		}, function(){
			var aa = $(".select-button",this);
			aa.css("opacity",".1");
		}
	)
}

function assignClick(){
	// click on a song play/pause it
	$(".albumcover").unbind();
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

	// click on select button to add
	$('#results .select-button').unbind();
	$('#results .select-button').click(function(){
		var data = $(this).parent().data('songinfo');
		// unbind everything
		$('#song-'+data.count+' *').unbind();
		// fadein overlay
		$('#song-'+data.count+' .select-overlay').fadeIn(300,function(){
			console.log('lol');
		});

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
		assignHover();
		assignClick();
	});

	// click on remove button to remove
	$('#current .select-button').unbind();
	$('#current .select-button').click(function(){
		var data = $(this).parent().data('songinfo');
		// unbind everything
		$('#selected-'+data.count+' *').unbind();
		// fadein overlay
		$('#selected-'+data.count).fadeOut(300,function(){
			$('#selected-'+data.count).remove();
		});
	});
}
// ------------------ DATA HANDLING -------------------

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
	assignHover();
	assignClick();
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
		<div class="select-overlay">Song Added</div>\
	</div>');

	// add identifying data
	$('#song-'+count).data('songinfo',{count:count, title:title, artist:artist, album:album, img:img, preview:preview});

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
