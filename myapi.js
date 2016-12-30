/**
 * myapi.js
 * 
 * @version 0.1 Express 4.x : Jan 2016
 *
 * 
 * DESCRIPTION:
 * Server-side application running a node 
 * API Appserver on a Raspberry Pi to access IOs
 * Uses the Express and node packages. 

 * 
 *  EW Jan 2016
 */

//var http      = require('http');
var express   = require('express');
var app       = express();
var server	  = require('http').createServer(app);
var io 		  = require('socket.io')(server);

var PythonShell = require('python-shell');

var options = {			//options for Python sinewave program parameters
	mode: 'text',
	pythonPath: '',
	pythonOptions: ['-u'],
	scriptPath: '',
	args: ['10-2']
};

var GPIO 	= require('onoff').Gpio,		//object constructors for I/O
    red 	= new GPIO(18,'out'),
    blue	= new GPIO(16,'out');
    yellow	= new GPIO(25,'out');
    button 	= new GPIO(17,'in', 'both');
    button2 = new GPIO(23,'in', 'both');  

//array to hold I/O names
var ew = ['red', 'blue', 'yellow','button', 'button2']  
    
//  array of input port values
var inputs = [    { pin: '11', gpio: '17', value: 1 },	//button
                  { pin: '16', gpio: '23', value: 1 }	//button2
                ];
//  array of output port values
var outputs = [   { pin: '12', gpio: '18', value: 0 },	//red LED
  		          { pin: '36', gpio: '16', value: 0 },	//blue LED
                  { pin: '22', gpio: '25', value: 0 }	//yellow LED
                ];
//  object to hold config values
var config = {cname: 'EW', 
			  onoff: 'no',
			  single: 'no',
			  double: 'no',
			  triple: 'no',
			  alarm: 'efi'};                
                
        
button.watch(function(err, value){
   console.log('read pin ' + inputs[0].pin + ' value = ' + value);
   inputs[0].value = value.toString();  // update the inputs object.  Store value as a string    
   red.writeSync(value);				// switch red LED on/off
});

// ------------------------------------------------------------------------
// configure Express to serve index.html and any other static pages stored 
// in the home directory
app.use(express.static(__dirname));

// Express route for a single input
app.get('/inputs/:id', function (req, res) {
  // send an object as a JSON string
  //console.log('Input id = ' + req.params.id);
  res.status(200).send(inputs[req.params.id]);
});

// Express route for all inputs
app.get('/inputs', function (req, res) {
  // send an object as a JSON string
  console.log('all inputs');
  res.status(200).send(inputs);
}); 

// Express route for all outputs
app.get('/outputs', function (req, res) {
  // send an object as a JSON string
  //console.log('all outputs');
  res.status(200).send(outputs);
}); 

// Express route for single outputs
app.get('/outputs/:id', function (req, res) {
  // send an object as a JSON string
  //console.log('Output id = ' + req.params.id);
  res.send(outputs[req.params.id]);
}); 

// Express route for red output
app.get('/redled', function (req, res) {
	//console.log('red led request');
    Number(outputs[0].value) === 1 ? red.writeSync(0):red.writeSync(1);
    res.send(outputs[0]);
}); 

// Express route for blue output
app.get('/blueled/', function (req, res) {
	//console.log('blue led request');
    Number(outputs[1].value) === 1 ? blue.writeSync(0):blue.writeSync(1);
    res.send(outputs[1]);
}); 

// Express route for yellow output
app.get('/yellowled/', function (req, res) {
	//console.log('yellow led request');
    Number(outputs[2].value) === 1 ? yellow.writeSync(0):yellow.writeSync(1);
    res.send(outputs[2]);
 });

// Express route for sinewave output
app.get('/sinewave/', function (req, res) {
    res.sendStatus(200);
    var size = req.query.amplitude;
    var length = req.query.duration;
    options.args = (size + '-' + length);
    console.log('options.args = ' + options.args);
    PythonShell.run('sine6', options, function(err, results){
	    if(err) throw err;
	      console.log('results: %j', results);
        }); 
}); 

// Express route for config - store setup in config array
app.get('/config/', function (req, res) {
	res.sendStatus(200);
    var cname = req.query.customername;
    config.cname = cname;
    var onoff = req.query.onoff;
    config.onoff = onoff;
    var single = req.query.single;
    config.single = single;
    var double = req.query.double;
    config.double = double;
    var triple = req.query.triple;
    config.triple = triple;
    var alarm = req.query.alarm;
    config.alarm = alarm;
    console.log(config);
}); 

// Express route for any other unrecognised incoming requests
app.get('*', function (req, res) {
  res.status(404).send('Unrecognised API call');
});

// Express route to handle errors
app.use(function (err, req, res, next) {
  if (req.xhr) {
    res.status(500).send('Oops, Something went wrong!');
  } else {
    next(err);
  }
}); 

// ------------------------------------------------------------------------
// Start Express App Server
//

io.on('connection', function(client){
	console.log('Client connected');
	//client.emit('message', outputs[0]);
	setInterval(function(){
		client.emit('message', outputs);		
	},5000);
});

server.listen(3000);
console.log('App Server is listening on port 3000');

function exit(){			//release I/O pins before shutdown
    red.unexport();
    blue.unexport();
    yellow.unexport();
    button.unexport();
    button2.unexport();
};
process.on('SIGINT', exit);

//timer loop to read each GPIO and store the latest value in the inputs & outputs array. 
setInterval(function () {
      inputs[0].value = button.readSync().toString(); // store value as a string 
      inputs[1].value = button2.readSync().toString(); 
      outputs[0].value = red.readSync().toString();  
      outputs[1].value = blue.readSync().toString();      
      outputs[2].value = yellow.readSync().toString(); 
}, 1000);


