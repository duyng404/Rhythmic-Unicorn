window.onload = function(){
	localStorage.setItem('mode','normal');
	localStorage.setItem('next','play-1.html');
	$('#start').click(function(){
		var next = localStorage.getItem('next');
		localStorage.setItem('next','play-2.html')
		window.location.href = "/"+next;
	})
}