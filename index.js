const aspectRatio = 20 / 10;

// Get the width and height of the window
const width = window.innerWidth;
const height = window.innerHeight;

var scoreBoxDisplayTime=250

// Determine the width and height of the canvas based on the aspect ratio
let canvasWidth = width;
let canvasHeight = canvasWidth * aspectRatio;

if (canvasHeight > height) {
  canvasHeight = height;
  canvasWidth = canvasHeight / aspectRatio;
}

// Create the canvas element
const canvas = document.createElement('canvas');
const ctx = canvas.getContext('2d');

canvas.width = canvasWidth;
canvas.height = canvasHeight;

let started=false
let gameOver=false



function checkTarget(ballX, ballY, targetX, targetY, outerRadius, scores) {
	targetX*=canvas.width //convert as part of canvas relation
	targetY*=canvas.height
	outerRadius*=canvas.width
	let bullseye=.01 * canvas.width
	// Calculate distance between ball and target using Pythagorean theorem
	let distance = Math.sqrt(Math.pow(ballX - targetX, 2) + Math.pow(ballY - targetY, 2));
	layers=scores.length
	layers-=1 //the last layer is a fixed value
	let spacing=outerRadius*(1/layers)//space between each layer
	// Calculate radius of each layer
	let layer = distance/spacing //which layer is the ball in
	layer = Math.trunc(layer) //conver to layer number only
	if (layer>=layers){
		return 0; //out of layers, miss, zero score for target
	}else if(layer==0 && distance <= bullseye){
		return scores[0]; //bullseye score
	}else{
		return scores[layer+1]; //layer score
	}
}

function getScore(ballX, ballY){
	//white,blue,orange,green,yellowLeft,yellowRight,redLeft,redMidLeft,redMidRight,redRight
	targetsX=[.745,.362,.745,.555,.38,.73,.245,.453,.656,.865]
	targetsY=[.22,.3375,.451,.611,.75,.75,.866,.874,.874,.866]
	radii   =[.176,.176,.176,.176,.12,.12,.065,.065,.065,.065]
	scoring=[
			[50,10,10,9,9,8,7],//white
			[40,10,8,7,6,5,4],//blue
			[30,10,8,7,6,5,4],//orange
			[20,10,7,6,5,4,3],//green
			[15,8,5,4,3],//yellowLeft
			[15,8,5,4,3],//yellowRight
			[10,6,3],//redLeft
			[10,6,3],//redMidLeft
			[10,6,3],//redMidRight
			[10,6,3]//redRight
	]
	for (let i=0; i<targetsX.length; i++){
		point = checkTarget(ballX,ballY,targetsX[i],targetsY[i],radii[i],scoring[i]);
		if (point > 0){
			return point; //return the number of points if a target gets points
		}
	}
	return 0;//if no points were found this will be reached
}

//draws the complex target model using the multipliers based on the canvas width and height

function drawTarget(xMult,yMult,outerRadius,layers){
	xMult*=canvas.width
	yMult*=canvas.height
	outerRadius*=canvas.width
	layers-=1 //the last layer will not be generated in the loop because it is much smaller than the others
	let spacing=outerRadius*(1/layers)
	for (let i = 0; i < layers; i++){
		ctx.beginPath();
		ctx.arc(xMult, yMult, outerRadius-(i*spacing), 0, 2 * Math.PI);
		ctx.stroke();
	}
	ctx.beginPath();
	ctx.arc(xMult, yMult, .01*canvas.width, 0, 2 * Math.PI);
	ctx.stroke();
}

function drawWind(velocity){
	//draw the windWindow
	
	let rectHeight = canvas.height * 0.11;
	let rectWidth = canvas.width * 0.22;
	let rectX = canvas.width*.1;
	let rectY = canvas.height *.14 ;
	
	ctx.fillStyle = "lightgray";
	ctx.fillRect(rectX, rectY, rectWidth, rectHeight);
	
	ctx.font = `bold ${fontSize-9}px Arial`;
	ctx.textAlign = "center";
	ctx.textBaseline = "middle";
	ctx.fillStyle = "black";
	
	let direction=Math.sign(velocity)//direction of wind

	if (direction==-1){//arrow pointing left
		ctx.strokeStyle = "black";
		ctx.lineWidth = canvasHeight*.007;
		ctx.beginPath();
		ctx.moveTo(rectX + (rectWidth * .15), rectY+ (rectHeight*.5)); // x, y
		ctx.lineTo(rectX + (rectWidth * .85), rectY+ (rectHeight*.5)); // x, y
		ctx.stroke();
		ctx.beginPath();
		ctx.moveTo(rectX + (rectWidth * .4), rectY+ (rectHeight*.35)); //top of arrow
		ctx.lineTo(rectX + (rectWidth * .15), rectY+ (rectHeight*.5)); 
		ctx.stroke();
		ctx.beginPath();
		ctx.moveTo(rectX + (rectWidth * .4), rectY+ (rectHeight*.65)); // bottom of arrow
		ctx.lineTo(rectX + (rectWidth * .15), rectY+ (rectHeight*.5)); 
		ctx.stroke();
	}else if (direction==1){//arrow pointing right
		ctx.strokeStyle = "black";
		ctx.lineWidth = canvasHeight*.007;
		ctx.beginPath();
		ctx.moveTo(rectX + (rectWidth * .15), rectY+ (rectHeight*.5)); // x, y
		ctx.lineTo(rectX + (rectWidth * .85), rectY+ (rectHeight*.5)); // x, y
		ctx.stroke();
		ctx.beginPath();
		ctx.moveTo(rectX + (rectWidth * .6), rectY+ (rectHeight*.35)); //top of arrow
		ctx.lineTo(rectX + (rectWidth * .85), rectY+ (rectHeight*.5)); 
		ctx.stroke();
		ctx.beginPath();
		ctx.moveTo(rectX + (rectWidth * .6), rectY+ (rectHeight*.65)); // bottom of arrow
		ctx.lineTo(rectX + (rectWidth * .85), rectY+ (rectHeight*.5)); 
		ctx.stroke();
	}else if (direction==0){//there is no wind, just draw line
		ctx.strokeStyle = "black";
		ctx.lineWidth = canvasHeight*.007;
		ctx.beginPath();
		ctx.moveTo(rectX + (rectWidth * .15), rectY+ (rectHeight*.5)); // x, y
		ctx.lineTo(rectX + (rectWidth * .85), rectY+ (rectHeight*.5)); // x, y
		ctx.stroke();
	}
	let textX = rectX + (rectWidth * .5);
	let textY = rectY + (rectHeight*.18);
	ctx.fillText("WIND", textX, textY);
	
	let textMPHX = rectX + (rectWidth * .5);
	let textMPHY = rectY + (rectHeight*.85);
	ctx.fillText(Math.abs(velocity) + " MPH", textMPHX, textMPHY);
}
//load start screen image
const startScreen = new Image();
startScreen.src = 'topGolfStart.png';
startScreen.onload = function(){
}

const faces = [];
const faceSources = ["puff.png",  "sunglasses.gif",  "sweat.png",  "wink.png"];
let facesLoaded = 0;
for (let i = 0; i < faceSources.length; i++) {
  faces[i] = new Image();
  faces[i].src = faceSources[i];
  faces[i].onload = function() {
    facesLoaded++;
    if (facesLoaded === faceSources.length) {
    }
  };
}
let randomIndex = 0 ;
function drawRandomFace(x,y,width,height) {
	const face = faces[randomIndex];  // Get the face image at the random index
	ctx.drawImage(face, x, y,width,height);  // Draw the face image on the canvas at the random x and y coordinates
}

//load fieldImg image field.png
const fieldImg = new Image();
fieldImg.src = 'field.png';
fieldImg.onload = function(){
}
let fontSize = canvas.height * .03;

let golfballSize = canvas.height*0.013; // Initial size of the golf ball
let golfballX = canvas.width / 2; // Initial x position of the golf ball
let golfballY = canvas.height - (golfballSize*1.5); // Initial y position of the golf ball

let power = 50; // Initial value of power
let powerIncrement = 0.5; // Increment value for power

//PHYSICS SETTINGS
let golfballVelocityY = 0; // Initial vertical velocity of the golf ball
let golfballAcceleration = canvas.height*.00014; // Fixed negative acceleration (friction) of the golf ball
let powerRatio = -.00015//initial speed due to power

let isMouseClicked = false; // Flag to track whether the mouse has been clicked

let shotTitle=""
let scoreCurrent=0;
let score=0;
let topScore=0;
let round=0;
let totalRounds=1;
let wind=Math.round((Math.random() * 80)-40);

let ballLandCooldown = 0;

// Add an event listener to update the golf ball position, set the initial golf ball velocity, and set the isMouseClicked flag to true when the mouse is clicked
canvas.addEventListener('touchstart', (event) => {
	canvas.addEventListener("touchmove", updatePosition);
});
// Add an event listener to update the golf ball position when the mouse moves
function updatePosition(event){
	if (!isMouseClicked){
		golfballX = event.touches[0].clientX;// Update the golf ball x position to the mouse x position
	}
}

canvas.addEventListener('touchend', (event) => {
	releasing=true
	if (started && !gameOver && !isMouseClicked){//move the golfball with the mouse and register click
		canvas.removeEventListener("touchmove", updatePosition);
		golfballVelocityY = canvas.height*powerRatio*power; // Set the initial golf ball velocity according to the current value of power
		isMouseClicked = true; // Set the isMouseClicked flag to true
	}
	if (!started){
		started=true
	}else if (gameOver){
		gameOver=false
	}
});

function draw() {
	if (!started){
		ctx.drawImage(startScreen, 0, 0, canvas.width, canvas.height);
		ctx.font = `${fontSize-5}px Arial`;
		ctx.textAlign = "center";
		ctx.textBaseline = "middle";
		ctx.fillStyle = "black";
		let line=	["",
					"Hold and drag to set launch position...",
					"Release to launch with power...",
					"Account for wind...",
					"",
					"",
					"",
					"",
					"Refreshing or leaving resets scores :(",
					"So take a screenie of your top score! :P",
					"",
					"Tap to Start",
					"<3 I love ya Wilby",
					"",
					"",
					"",
					"",
					"Beautiful Wilbur- ",
					"Your love warms my soul with passion",
					"<3"]
		let textX = canvas.width*.5
		let textY = canvas.height*.16
		let textOffset=canvas.height*.035
		for(let i=0;i<line.length;i++){
			ctx.fillText(line[i], textX, textY+(textOffset*i));
		}
	}
	if (started && !gameOver){ //dont run main one frame after changing from menu to prevent doubleclick
		if (! isMouseClicked) {//change the value of power when the mouse isnt clicked
		   power += powerIncrement; // Increment power according to the power increment
		  // If power reaches the minimum or maximum value, reverse the direction of the power increment
		  if (power < 10) {
			power = 10;
			powerIncrement = Math.abs(powerIncrement); // Make powerIncrement positive
		  } else if (power > 100) {
			power = 100;
			powerIncrement = -Math.abs(powerIncrement); // Make powerIncrement negative
		  }
		}
		
	  // Calculate the size and color of the power meter based on the value of power
	  const size = power / 100;
	  const r = Math.round(255 * (1 - size));
	  const g = Math.round(255 * size);
	  const b = 0;

	  // If the mouse has been clicked
	  if (isMouseClicked && ballLandCooldown<scoreBoxDisplayTime) {
		golfballY += golfballVelocityY; // Update the golf ball y position according to the velocity
		golfballVelocityY += golfballAcceleration; // Update the golf ball velocity according to the acceleration
		golfballX+=wind*golfballVelocityY*-.01;
		// If the golf ball reaches the top of the canvas in the net, stop the animation when it goes over the fence out of bounds
		if (golfballY + golfballVelocityY<= (canvas.height*.13)-golfballSize) {
			golfballAcceleration=0; //stop forces on the ball
			golfballVelocityY=0;//stop ball
			shotTitle=" Over the fence!";
			ballLandCooldown+=1;
		}//If the golfball stops moving stop the animation
		else if(golfballVelocityY+golfballAcceleration>=0){
			golfballAcceleration=0; //stop forces on the ball
			golfballVelocityY=0;//stop ball
			shotTitle= "";
			ballLandCooldown+=1;
		}
	  }else if (ballLandCooldown>=scoreBoxDisplayTime){
		//if shot cooldown has finished reset golfball values for next shot
		ballLandCooldown=0
		isMouseClicked=false
		golfballX = canvas.width / 2; // Initial x position of the golf ball
		golfballY = canvas.height - (golfballSize*1.5); // Fixed y position of the golf ball
		power = 50; // Initial value of power
		powerIncrement = 0.5; // Increment value for power
		golfballVelocityY = 0; // Initial vertical velocity of the golf ball
		golfballAcceleration = .1; // Fixed negative acceleration (friction) of the golf ball
	  }
	  if (ballLandCooldown==1){//run only once when ball has first land landed on the first frame
			scoreCurrent=getScore(golfballX,golfballY);//get score of round
			score+=scoreCurrent; //tally score
			round+=1;
			randomIndex = Math.floor(Math.random() * faces.length);  // Get a random index between 0 and the number of faces - 1
	  }
	  if(ballLandCooldown==scoreBoxDisplayTime){//run code on the last frame of score box display
		wind=Math.round((Math.random() * 80)-40);
		if (round>=totalRounds){
			gameOver=true;
			round=0
		}
	  }
		  
	  // Calculate the size of the golf ball based on its distance from the bottom of the canvas
	//golfballSize = (canvas.height - golfballY) / canvas.height;

	  // Clear the canvas
		ctx.clearRect(0, 0, canvas.width, canvas.height);
		//draw image map fieldImg
		ctx.drawImage(fieldImg, 0, canvas.height*.05, canvas.width, canvas.height*.85);


	  // Draw the power meter
		ctx.fillStyle = `rgb(${r}, ${g}, ${b})`;
		ctx.fillRect(0, 0, canvas.width * size, canvas.height * 0.05);
		//Add text to the power meter
		// Set the stroke style for the text
		//drawing a line at the base of the fence
		ctx.lineWidth=canvas.height*.005
		ctx.beginPath();
		ctx.moveTo(0, canvas.height*.13); // x, y
		ctx.lineTo(canvas.width, canvas.height*.13 ); // x, y
		ctx.stroke();
		ctx.strokeStyle = "white";
		ctx.lineWidth = 2;
		ctx.font = `${fontSize}px Verdana`;
		// Set the text alignment to center
		ctx.textAlign = "center";
		// Position the text in the center of the canvas horizontally
		let textX = ctx.canvas.width / 2;
		// Position the text at the top of the canvas vert ically
		let textY = fontSize;
		// Draw the text stroke
		ctx.strokeText("<--LOW   Power Meter   HI-->", textX, textY);
		// Draw the text fill
		ctx.fillStyle = "black";
		ctx.fillText("<--LOW   Power Meter   HI-->", textX, textY);


		drawWind(wind)
	// Draw the golf ball draw golfball
		ctx.beginPath();
	//ctx.arc(golfballX, golfballY, golfballSize * 20, 0, 2 * Math.PI);
	//golfball startPosition - currentPosition
		distance= (canvas.height - 50)-golfballY
	// old size was (10000*(1/(distance+100)))
		ctx.arc(golfballX, golfballY, golfballSize, 0, 2 * Math.PI);
		ctx.fillStyle = 'white';
		ctx.fill();
		ctx.strokeStyle = 'black';
		ctx.lineWidth = 2;
		ctx.stroke();
		
		
	//show score rectangle
		if (50<ballLandCooldown && ballLandCooldown<scoreBoxDisplayTime){
			let rectHeight = canvas.height * 0.25;
			let rectWidth = canvas.width * 0.8;
			let rectX = (canvas.width / 2) - (rectWidth / 2);
			let rectY = (canvas.height / 2) - (rectHeight / 2);

			ctx.fillStyle = "lightgray";
			ctx.fillRect(rectX, rectY, rectWidth, rectHeight);

			//adding border
			ctx.strokeStyle = "black";
			ctx.lineWidth = 2;
			ctx.strokeRect(rectX, rectY, rectWidth, rectHeight);
			let text1 = scoreCurrent + " points" + shotTitle
			let text2 = "Score: " + score;
			let text3 = totalRounds-round +" rounds Left";
			ctx.font = `${fontSize}px Arial`;
			ctx.textAlign = "center";
			ctx.textBaseline = "middle";
			ctx.fillStyle = "black";

			let textX = rectX + (rectWidth / 2);
			let textY = rectY + (rectHeight / 6);
			ctx.fillText(text1, textX, textY);

			textY += (rectHeight / 3);
			ctx.fillText(text2, textX, textY);

			textY += (rectHeight / 3);
			ctx.fillText(text3, textX, textY);
			
			
			let faceX=rectX*1.2
			let faceY=rectY*1.1
			let faceWidth= rectWidth*.3
			let faceHeight= rectHeight*.4
			drawRandomFace(faceX,faceY,faceWidth,faceHeight);
		}

	}
	if (gameOver){
		if (score > topScore){
			topScore=score
		}
		ctx.drawImage(startScreen, 0, 0, canvas.width, canvas.height);
		ctx.font = `${fontSize-5}px Arial`;
		ctx.textAlign = "center";
		ctx.textBaseline = "middle";
		ctx.fillStyle = "black";
		let line=	["GAME OVER",
					"Hold and drag to set launch position...",
					"Release to launch with power...",
					"Account for wind...",
					"",
					"Top Score: "+ topScore,
					"",
					"",
					"Refreshing or leaving resets scores :(",
					"So take a screenie of your top score! :P",
					"",
					"Tap to Start",
					"<3 I love ya Wilby",
					"",
					"",
					"",
					"",
					"Beautiful Wilbur- ",
					"My best days are those spent with you!"]
		let textX = canvas.width*.5
		let textY = canvas.height*.16
		let textOffset=canvas.height*.035
		for(let i=0;i<line.length;i++){
			ctx.fillText(line[i], textX, textY+(textOffset*i));
		}
	}
	
	// Request another animation frame
	requestAnimationFrame(draw);
}
// Start the animation
requestAnimationFrame(draw);

// Append the canvas to the DOM
document.body.appendChild(canvas);
