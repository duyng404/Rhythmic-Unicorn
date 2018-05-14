var gCount = 1;
var ytToken = "AIzaSyBI9Fv5kTKSAymabcCHL0K9dJsTHAzC2hA";

window.onload = function(){
	$('#search-bar').animate({opacity:1},400);
	displayFooter();
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

// when pressing enter in searchbox
$("#query").on('keyup', function (e) {
	if (e.keyCode == 13) {
		performSearch();
	}
});

// when search button is clicked, send a request to spotify
$('#search').click(performSearch);

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
		<button class="select-button">request</button>\
		<div class="select-overlay">Song Requested</div>\
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
					$(ss).append('<iframe type="text/html" src="https://www.youtube.com/embed/'+id+'?autoplay=1&controls=0&fs=0&modestbranding=1&rel=0&showinfo=1&disablekb=1&start=30" frameborder="0"></iframe>');
				}
			});
			//$(ss).append()
		});
	}
	assignBehaviorForResults("#song-"+count);
}

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
		var data = $(this).parent().data('songinfo');
		// unbind everything
		$(path+' *').unbind();
		// fadein overlay
		$(path+' .select-overlay').fadeIn(300);

		// check balance
		var balance=0;
		if (localStorage.getItem('balance') != null)
			balance = parseInt(localStorage.getItem('balance'));
		if (balance >= 700){
			$.ajax({
				url: '/api/setSeed/'+data.spotId,
				type: "GET",
				success: function(data){
					balance -= 700;
					localStorage.setItem('balance',balance);
					showResult('success');
				}
			});
		} else {
			showResult('error');
		}
	});
}

function showResult(aa){
	if (aa == 'success'){
		$('#content *').not(':first').remove();
		$('#content').append('<div class="h2">Song Requested Successfully!</p>');
		$('#content').append('<button id="finish">return</button>');
		$('#finish').click(function(){
			window.location.href = "/";
		});
	} else {
		$('#content *').not(':first').remove();
		$('#content').append('<div class="h2">You don&apos;t have enough Contribution Tokens</p>');
		$('#content').append('<button id="finish">return</button>');
		$('#finish').click(function(){
			window.location.href = "/";
		});
	}
}