/**
* MYCLIENT.JS
* an example of a JSON request - an ajax request which returns a JSON object 
* 
* When a user browses to http://localhost:3000, index.html is loaded, which then 
* loads and executes this code
*/

	
var $responses;

var localio = { button: 1, button2: 1, redoutput: 0, blueoutput: 0, yellowoutput: 0 };

// Get multiple data points
function GETDATA() {
    var i;

    for (i = 0; i < 2; i++) {
        GETSINGLE(i);
    }
}

//Get a single data point
function GETSINGLE(i) {
    var url;

    url = document.URL + 'inputs/' + i;
    $.getJSON(url, function (data) {
        $('#status').prepend('input gpio port ' + data.gpio + ' on pin ' + data.pin + ' has current value ' + data.value + '<BR>');
    });
}

// Get all data output points
function GETALLOUTPUTS() {
    var i;

    for (i = 0; i < 3; i++) {
        GETSINGLEOUTPUT(i);
    }
}

//Get a single output data point
function GETSINGLEOUTPUT(i) {
    var url;

    url = document.URL + 'outputs/' + i;
    $.getJSON(url, function (data) {
        $('#status').prepend('output gpio port ' + data.gpio + ' on pin ' + data.pin + ' has current value ' + data.value + '<BR>');
    });
}

/**
 * Everything wrapped in a document ready callback
 */
$(document).ready(function(){

//Start websocket to receives output data
        var socket = io.connect('192.168.1.17:3000');
	    socket.on('message', function(data){  
			$.each(data, function(i, data){
			  $('#status').prepend('op array = ' + i + ' ' + data.gpio + ' ' + data.pin + ' ' + data.value + '<BR>');  
		   });
        });

    // Caching the H1 element in the page that we use to display messages
    $responses = $('#responses');

    $('.data').on('click', function(){
		$responses.text('Data requested'); 
        //GETDATA();
        //GETALLOUTPUTS();
             
       var url;
       url = document.URL + 'outputs';
       $.getJSON(url, function (data) {
		   $.each(data, function(i, data){
			  $('#status').prepend('op array = ' + i + ' ' + data.gpio + ' ' + data.pin + ' ' + data.value + '<BR>'); 
			  //var a = i + 1;
			  //var btn = $("#input button:eq("+a+")"); //select the current button
			  //alert('data.value = ' + data.value + ' a = ' + a);
			  switch(i)
			  {
				  case 0: Number(data.value) ? $('.red-led').css({"background-color": "green"}) : $('.red-led').css({"background-color": "red"}); 		break;
				  case 1: Number(data.value) ? $('.blue-led').css({"background-color": "green"}) : $('.blue-led').css({"background-color": "blue"}); 	break;
				  case 2: Number(data.value) ? $('.yellow-led').css({"background-color": "green"}) : $('.yellow-led').css({"background-color": "yellow"}); break;
			  }
		   });
       });
   });

    $('.red-led').on('click', function(){
        var url;
        // Add the text 'redLED pressed' to the h1 element with the id "responses"
        url = document.URL + 'redled';
        $responses.text(url);       
        $.get(url, function (data) {
        //Number(data.value) ? $('.red-led').css({"background-color": "red"}) : $('.red-led').css({"background-color": "green"});
        });  
    });

    $('.blue-led').on('click', function(){
        var url;
        // Add the text 'blueLED pressed' to the h1 element with the id "responses"     
        url = document.URL + 'blueled';
        $responses.text(url);
        $.getJSON(url, function (data) {
        //Number(data.value) === 1 ? $('.blue-led').css({"background-color": "blue"})  :  $('.blue-led').css({"background-color": "green"});
        });
    });

    $('.yellow-led').on('click', function(){
        var url;
        // Add the text 'yellowLED pressed' to the h1 element with the id "responses"    
        url = document.URL + 'yellowled';
        $responses.text(url);
        $.getJSON(url, function (data) {
         //Number(data.value) === 1 ? $('.yellow-led').css({"background-color": "yellow"})   :  $('.yellow-led').css({"background-color": "green"});
        });
    });

});
