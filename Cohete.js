// ===============================
// Simulador orbital básico en p5.js
// Tierra + Luna en órbita elíptica
// ===============================

let angle = 0;// angulo de la luna
let rocketAngle = -1.5708; // angulo inicial del cohete 
 
let rocket; 
let earth_radius = 120; 
let moon_radius = 35;


// Limite para que la velocidad del cohete no diverja
let rocket_speed_limit = 8;

// Velocidad de rotacion de la luna
let moon_rotation_speed = 0.002;

// Boton para reinicial
let resetButton;

// Condiciones iniciales del cohete
let x_initial = 300;
let y_initial = 250;
let vx_initial = 0.8;
let vy_initial = -0.5;

// Semiejes de la orbita de la luna
let a; // horizontal
let b; // vertical

function setup() {
    createCanvas(windowWidth, windowHeight);
	
  	rocket = {
      	//x: width/2,
      	//y: height/2 - earthRadius-13,
      	x: x_initial,
     	y: y_initial,
      	vx: vx_initial,
      	vy: vy_initial
    };
  
  	a = 500;
  	b = 300;
  	// b = 0.4*windowHeight; 
  	// a = 800; 
  
  	resetButton = createButton("Reiniciar");
	resetButton.position(20, 20);
	resetButton.mousePressed(resetSimulation);
}
	
  	
function draw() {
    background(5, 5, 20);

    // -------------------------------
    // Fondo de estrellas
    // -------------------------------
    drawStars();

    // Centro de la Tierra
    let cx = width / 2;
    let cy = height / 2;

    // -------------------------------
    // Tierra
    // -------------------------------
    noStroke();
    fill(40, 100, 255);
    circle(cx, cy, earth_radius);

    // Brillo atmosférico
    fill(80, 150, 255, 40);
    circle(cx, cy, 1.2*earth_radius);

    // ------------------------------- 
    // Órbita elíptica de la Luna
    // -------------------------------
    // Dibujar órbita
    noFill();
    stroke(120, 120, 120);
    strokeWeight(1); 
    ellipse(cx, cy, a * 2, b * 2);

    // Posición de la Luna usando ecuaciones paramétricas
    let moonX = cx + a * cos(angle);
    let moonY = cy + b * sin(angle);

    // Luna
    noStroke();
    fill(220);
    circle(moonX, moonY, moon_radius);

    // Incrementar ángulo para movimiento
    angle += moon_rotation_speed;



    let dx = mouseX - rocket.x;
    let dy = mouseY - rocket.y;

    if (mouseIsPressed) {
    rocketAngle = atan2(dy, dx);
    }

    // Distancia
    let d = sqrt(dx * dx + dy * dy);

    // Normalizar vector
    dx /= d;
    dy /= d;
  
  	applyGravity(cx, cy, 300);       // Tierra
	applyGravity(moonX, moonY, 150); // Luna

    // Solo acelerar mientras el click está presionado
    if (mouseIsPressed) {
    rocket.vx += dx * 0.1;
    rocket.vy += dy * 0.1;

    }

    rocket.x += rocket.vx;
    rocket.y += rocket.vy;

    // Cohete es una imagen que se rota cuando hago click
    if (mouseIsPressed){
        // Seleccionar la imagen segun si esta quemando combustible
        rocketImg = rocketImg_Fuel;
    } else {
        rocketImg = rocketImg_Fuel;

    }
    push();

    translate(rocket.x, rocket.y);

    // Ajusta la inclinacion según orientación del PNG
    rotate(rocketAngle + PI/4); 

    imageMode(CENTER);
    image(rocketImg, 0, 0, 60, 60);

    pop();
  
  	// No dejar que el cohete se salga de la pantalla
  	applyPeriodicBoundary();
  
  	// Limitar la velocidad del cohete
  	applyRocketSpeedLimit();
        
}


function applyGravity(bodyX, bodyY, strength) { 

    let dx = bodyX - rocket.x;
    let dy = bodyY - rocket.y;

    let d = sqrt(dx * dx + dy * dy);

    dx /= d;
    dy /= d;

    rocket.vx += dx * strength / (d * d);
    rocket.vy += dy * strength / (d * d);
}

function applyPeriodicBoundary(){ 
  	// Funcion para no dejar que el cohete se salga de la pantalla
  	// Si el cohete sale por un borde, aparece por el otro
	
  	//rocket.x = constrain(rocket.x, 0, windowWidth);
  	//rocket.y = constrain(rocket.y, 0, windowHeight);
  
   	rocket.x = (rocket.x + width) % width;
    rocket.y = (rocket.y + height) % height;
}

function applyRocketSpeedLimit() {
  	// Funcion para poner un limite a la velocidad
    rocket.vx = constrain(rocket.vx, -rocket_speed_limit, rocket_speed_limit);
    rocket.vy = constrain(rocket.vy, -rocket_speed_limit, rocket_speed_limit);
}

// Cargar imagenes
let rocketImg;
let rocketImg_Fuel;
let rocketImg_NoFuel;


function resetSimulation() {
	// Funciona para que el boton reinicie la posicion del cohete
    rocket.x = x_initial;
    rocket.y = y_initial;

    rocket.vx = vx_initial;
    rocket.vy = vy_initial;
}

// -------------------------------
// Generador simple de estrellas
// -------------------------------
function drawStars() {
    randomSeed(10);

    for (let i = 0; i < 300; i++) {
        let x = random(width);
        let y = random(height);

        let s = random(1, 3);

        fill(255);
        noStroke();
        circle(x, y, s);
    }
}
// Ajustar canvas al cambiar tamaño
function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
}