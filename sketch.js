
/*************************************************************
 ******** Puntos de Lagrange del sistema Tierra-Luna   *******
 *************************************************************
 ** Autor:        Juliana del Valle                         **
 **               Juan Fernando Jaramillo                   **                                                                       **
 ** Institución: Universidad de Antioquia                   **
 ** Curso: Laboratorio avanzado 3  2025-1                   **
 *************************************************************/





 /************************************************************
 **                   Imagenes                             ***
 */

// Define las imagnes del cohete, la tierra y la luna como variables globales.
let coheteImg, tierraImg, lunaImg;


/***************************************************************
 **                Constantes                                ***
 */
/**                 Tamaño de las imagenes                     **/
let tierra_pixels; 
let luna_pixels;
let cohete_pixels;

/**                 Posición de las imagenes                   **/
let tierra_x0; let tierra_y0; 
let luna_x0 ;let luna_y0 ;
let cohete_x0; let cohete_y0;


/**                  Masa de los planetas                      **/
let G ;   let m_tierra; let m_luna;

/**                  Distancias                                **/
let r12_pixeles;
let r12_km;
let km_per_pixel;
let pixel_per_km ;
let x_CM_px;

/**                  Factores de conversión del sistema CM      **/
let pi_1; let pi_2; 

/**                 Velocidad angular del sistema de referencia  **/
let Omega;

/**                  Parámteros de la ecuación diferencial       **/
let t0; let vx0; let vy0; let h; let t_end;

/**                  Variables de la ecuación diferencial       **/
let x; let y; let vx; let vy; //del cohete.
let t; //tiempo

/*****               Indica cuándo empezar la simulación         **/
let clicked;

/**                  Botón de Reinicio                         **/
let resetButton;


function preload(){
  //Precarga las imagenes de directorio assets.
  coheteImg  = loadImage('/assets/coheteImg.png');
  tierraImg = loadImage('/assets/tierraImg.png');
  lunaImg = loadImage('/assets/lunaImg.png');
}


/***************************************************************
 **                   Librerias                              ***
 */
//p5.js



function setup() {

   /**********  Canvas    *******************/
  //Crea el Canvas
  createCanvas(windowWidth, windowHeight);

  tierra_pixels = 73.3563; //los pixeles que ocupa la tierra en la pantalla.
  luna_pixels = 20; //los pixeles que ocupa la luna en la pantalla
  //nota: la propoción de los diametros  cumple que 73.3563/20 =  6371 /1737.5 
  // esa proporción se usa porque el radio de la tierra es 6371 km y el de la luna 1737.5 km
  cohete_pixels = 30;

  /**                 Posición de las imagenes                   **/
  tierra_x0 = windowWidth/2 
  tierra_y0 = windowHeight/2 
  luna_x0 = 7*windowWidth/10 
  luna_y0 = windowHeight/2 
  cohete_x0;
  cohete_y0;


  /**                  Masa de los planetas                      **/
  G = 6.67430e13; //en m3⋅Rg−1⋅s−2[1] Rg es 10^27 g = 10^24 Kg
  m_tierra = 5.974;//en Rg ronna gramos o 10^24 kg
  m_luna =  0.07348; // en Rg o 10^24 Kg

  /**                Factores de conversión del sistema CM      **/
  pi_1 = m_tierra / (m_tierra + m_luna) ;
  pi_2 = m_luna / (m_tierra +m_luna);

  


  /**                  Distancias                                **/
  r12_pixeles = luna_x0  - tierra_x0 ; //Distancia tierra luna en pixels
  r12_km = 3.844e5; //en km
  km_per_pixel = r12_km/r12_pixeles; //factor de conversión pixels->km
  pixel_per_km = r12_pixeles/384399; //factor de conversion km->pixel

  /**               Velocidad angular del sistema de referencia  **/
  Omega = sqrt(G*(m_tierra + m_luna)/r12_km**3);

  /*****               Indica cuándo empezar la simulación         **/
  clicked = false;


  /**                  Parámteros de la ecuación diferencial       **/
  t =0 ; 
  vx = 0; 
  vy = 0; 
  h = 0.1; 
  t_end = 300;

}



function draw() {

  dibuja_fondo()

  

  if (!clicked){
    antes_simulacion()
  }else{
    simulacion()
  }


}






/****************************************************************
 **                    Funciones   Auxiliares               *****
*/

function mousePressed() {
  x = (mouseX - tierra_x0) * km_per_pixel;
  y = (tierra_y0- mouseY) * km_per_pixel; // flip Y axis (p5 Y is inverted)
  vx = 0;
  vy = 0;
  t = 0;
  clicked = true;
}


//Lo que sucede antes de que se presione el click
function antes_simulacion(){

  cohete_x0 = mouseX;
  cohete_y0 = mouseY;
  image(coheteImg, cohete_x0 - cohete_pixels/2, cohete_y0 - cohete_pixels/2, cohete_pixels, cohete_pixels);

}

//Empieza la simulacióin
function simulacion(){
  if (t < t_end) {
    //Calcula el paso con  rk4
    let step = rungeKutta_step(t, x, y, vx, vy, h)

    //actualiza las variables
    t = step[0];
    x = step[1];
    y = step[2];
    vx = step[3];
    vy = step[4]

    // convierte de km a pixels para dibujar
    let draw_x = tierra_x0 + x * pixel_per_km;
    let draw_y = tierra_y0 - y * pixel_per_km; // flip Y axis back

    image(coheteImg, draw_x - cohete_pixels/2, draw_y - cohete_pixels/2, cohete_pixels, cohete_pixels);
  }
}


//Dibuja el fondo
function dibuja_fondo(){
  //Dibuja un fondo negro
  background(0);

  //Dibuja el fondo de estrellas
  drawStars();



  /********    Tierra + Luna ****************/

  //Dibuja la tierra
  image(tierraImg, tierra_x0 - tierra_pixels/2, tierra_y0 -tierra_pixels/2 , tierra_pixels, tierra_pixels);


  //Dibuja la luna
  image(lunaImg, luna_x0 - luna_pixels/2, luna_y0-luna_pixels/2, luna_pixels, luna_pixels);

  //Orbita de la luna
  noFill();
  stroke(255, 255, 255);
  circle(tierra_x0, tierra_y0, r12_pixeles*2);



  /***********  Puntos de Lagrange             *********/
  //Dibuja el punto de lagrange L4
  //Los puntos de lagrange fueron tomados del libro :
  //Orbital Mechanics for Engineering Students
  //Ver el archivo de teoria.

  let x_4_px = tierra_x0 + 187528.6963 * pixel_per_km;
  let y_4_px = windowHeight/2  - 332899.29919 *pixel_per_km;

  fill(255, 0, 0) //rojo
  stroke(255, 0, 0);
  circle(x_4_px, y_4_px, 10);

  textSize(16);
  fill(255, 0, 0); //rojo
  stroke(255, 0, 0);
  textAlign(LEFT, CENTER);
  text('L4', x_4_px + 6 , y_4_px);

  //Dibuja el punto L5
  let x_5_px = x_4_px;
  let y_5_px = windowHeight/2  +  332899.29919 *pixel_per_km;

  fill(255, 0, 0); //rojo
  stroke(255, 0, 0);
  circle(x_5_px, y_5_px, 10);

  textSize(16);
  fill(255, 0, 0); //rojo
  stroke(255, 0, 0);
  textAlign(LEFT, CENTER);
  text('L5', x_5_px + 6 , y_5_px);

  //Dibuja L3
  let x_3_px = tierra_x0 - 3.863e5 * pixel_per_km;
  let y_3_px = windowHeight/2;

  fill(255, 0, 0); //rojo
  stroke(255, 0, 0);
  circle(x_3_px, y_3_px, 10);

  textSize(16);
  fill(255, 0, 0); //rojo
  stroke(255, 0, 0);
  textAlign(LEFT, CENTER);
  text('L3', x_3_px + 6 , y_3_px);

  //Dibuja L1
  let x_1_px = tierra_x0 + 3.217e5 * pixel_per_km;
  let y_1_px = windowHeight/2;

  fill(255, 0, 0); //rojo
  stroke(255, 0, 0);
  circle(x_1_px, y_1_px, 10);

  textSize(16);
  fill(255, 0, 0); //rojo
  stroke(255, 0, 0);
  textAlign(LEFT, CENTER);
  text('L1', x_1_px + 6 , y_1_px);

  //Dibuja L2
  let x_2_px = tierra_x0 + 4.444e5* pixel_per_km;
  let y_2_px = windowHeight/2;

  fill(255, 0, 0); //rojo
  stroke(255, 0, 0);
  circle(x_2_px, y_2_px, 10);

  textSize(16);
  fill(255, 0, 0); //rojo
  stroke(255, 0, 0);
  textAlign(LEFT, CENTER);
  text('L2', x_2_px + 6 , y_2_px);



}


// -------------------------------
// Generador simple de estrellas
// -------------------------------
function drawStars() {
    randomSeed(10);

    for (let i = 0; i < 300; i++) {
        let x = random(width);
        let y = random(height);

        let s = 1;

        fill(255);
        noStroke();
        circle(x, y, s);
    }
}

/*********************************************************
 ***     Resuelve las ecuaciones acopladas con rk4      **
*/

function rungeKutta_step(t, x, y, vx, vy, h) {
  let k1_x; let k1_y; let k1_vx; let k1_vy;
  let k2_x; let k2_y; let k2_vx; let k2_vy;
  let k3_x; let k3_y; let k3_vx; let k3_vy;
  let k4_x; let k4_y; let k4_vx; let k4_vy;

  f_t = Dt(t, x, y, vx, vy);
  k1_x = h*f_t[0]; k1_y = h*f_t[1]; k1_vx = h*f_t[2]; k1_vy = h*f_t[3];

  f_t_k1 = Dt(t + 0.5 * h, x + 0.5*k1_x, y + 0.5*k1_y, vx+0.5*k1_vx, vy+0.5*k1_vy);
  k2_x = h* f_t_k1[0]; k2_y = h* f_t_k1[1]; k2_vx = h* f_t_k1[2]; k2_vy = h* f_t_k1[3];

  f_t_k2 = Dt(t + 0.5 * h, x + 0.5*k2_x, y + 0.5*k2_y, vx+0.5*k2_vx, vy+0.5*k2_vy);
  k3_x = h* f_t_k2[0]; k3_y = h* f_t_k2[1]; k3_vx = h* f_t_k2[2]; k3_vy = h* f_t_k2[3];

  f_t_k3 = Dt(t + h, x + k3_x, y +k3_y, vx+ k3_vx, vy+ k3_vy);
  k4_x = h* f_t_k3[0]; k4_y = h* f_t_k3[1]; k4_vx = h* f_t_k3[2]; k4_vy = h* f_t_k3[3];

  let t_new  = t  + h;
  let x_new  = x  + (k1_x  + 2*k2_x  + 2*k3_x  + k4_x)  / 6;
  let y_new  = y  + (k1_y  + 2*k2_y  + 2*k3_y  + k4_y)  / 6;
  let vx_new = vx + (k1_vx + 2*k2_vx + 2*k3_vx + k4_vx) / 6;
  let vy_new = vy + (k1_vy + 2*k2_vy + 2*k3_vy + k4_vy) / 6;

  
  return [t_new, x_new, y_new, vx_new, vy_new];
}



/*    La funcion  que determina la derivada temporal **/
function Dt(t, x, y, vx, vy){

  let dist_1; //distancia  a la tierra
  let dist_2; //distancia a la luna.
  let ax; let ay; //aceleraciones

  dist_1 = sqrt( (x + pi_2*r12_km)**2 + y**2 )
  dist_2 = sqrt( (x - pi_1*r12_km)**2 + y**2 )



  ax = - G*m_tierra/dist_1**3 * (x + pi_2*r12_km) - G*m_luna/dist_2**3 * (x- pi_1*r12_km)
  ax += 2*Omega*vy + Omega**2 * x

  ay = -G*m_tierra/dist_1**3 * y - G*m_luna/dist_2**3 *y - 2*Omega*vx + Omega**2 * y

  //La derivadas temporales
  Dt_x = vx;
  Dt_y =  vy;
  Dt_vx = ax;
  Dt_vy = ay;

  return [Dt_x, Dt_y, Dt_vx, Dt_vy];
}




