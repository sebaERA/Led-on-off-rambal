# Led-on-off-rambal
Usando firebase

Guia para encender led via pagina web 

Introducción
La siguiente guía enseñará cómo encender el led interno de una placa NodeMCU ESP8266, utilizando una página web y Firebase. FireBase es utilizado para establecer la comunicación entre la placa y la página web. 

Índice
Introducción	1
Paso 1. configurar FireBase	1
Creación realtime database	3
Creación nodo Led1Status y guardar url	3
Creación usuarios	4
Creación app web	6
Configuración sdk	6
Paso 2. configurar NodeMCU ESP8266	7
Requisitos previos	7
Código:	8
Paso 3. Creación página web	12
Requisitos previos	12
Código script.js	14
Código HTML	15
Paso 4 subir a github para el hosting	18


Materiales
●	Placa NodeMCU ESP8266
●	cable micro usb
●	Acceso a internet
Requisitos previos:
●	Instalar visual studio code (https://code.visualstudio.com/)
●	Instalar node js (https://nodejs.org/en)
●	Crear cuenta en github.

Paso 1. configurar FireBase

●	Crea un proyecto en FireBase (https://console.firebase.google.com/)
●	Para autentificar puedes usar tu cuenta gmail de google.
 

●	Le das un nombre al proyecto, en este caso LED-ON-OFF, posteriormente te preguntará si activas google analytics, cómo no afecta en nada al proyecto, puedes seleccionar la opción que quieras, en este caso se dejó con un no, y le das crear el proyecto.
 

●	una vez creado, seleccionas en categoria del producto→Compilación→RealTieme DataBase.
 

Creación realtime database

●	Finalmente seleccionar botón “crear una base de datos”, en ubicacion de base de datos lo dejas como esta, en este caso “Estados Unidos (us-central1)”, presionas siguiente y luego habilitas la opción “comenzar en modo bloqueo” y presionas habilitar.

 

Creación nodo Led1Status y guardar url 

●	Una vez dentro creas un nuevo nodo el cual se llamará “Led1Status”. El valor se deja tal cual como aparece (Automatico) y le damos a agregar. También es necesario guardar la url de la realtime database para usarlo en los siguientes pasos,
https://led-on-off-8b4f9-default-rtdb.firebaseio.com/
 

 

●	Luego en reglas, cambiamos los estados de “read” y “write”, a “true” y publicamos los cambios.
 

Creación usuarios

●	Posteriormente te diriges a la sección de autentificación y le das a comenzar, desde ahí seleccionamos la opción de correo electrónico/contraseña, una vez dentro solo habilitas Correo electrónico/contraseña y guardas. Por último agregamos proveedor nuevo y seleccionas anónimo, lo habilitas y guardas.

 

●	Posteriormente te diriges a users y agregas un nuevo usuario, puedes inventar el correo electrónico, no es necesario que exista, en este caso usamos ejemplo@gmail.com contraseña: 123456
 

 

Creación app web 

●	Por último nos dirigimos a la descripción general del proyecto y seleccionamos la opción de web (La que se encuentra marcada en amarillo en la imagen).

 

●	una vez dentro le das nombre a la app en mi caso fue ledESP8266, por ultimo le das a registrar app (si lo deseas puedes seleccionar la casilla para habilitar el hosting desde firebase, en mi caso use github page para el hosting), luego simplemente vas a consola.

 

Configuración sdk 

●	Por último te diriges a configuración del proyecto y en la pestaña de general bajas hasta encontrar la configuración del sdk y guardas el código que aparece en la imagen que aparece en la imagen, para usarlo en las siguientes partes del proyecto. Como recomendación guarda aparte el que diga apikey, ya que también se usa de manera individual del proyecto.

  




Paso 2. configurar NodeMCU ESP8266

Requisitos previos
Antes de empezar se deben de tener instaladas las librerías correspondientes:
●	ESP8266Wifi
●	FirebaseESP8266

Para instalar FirebaseESP8266 descargamos el archivo del siguiente link: https://downloads.arduino.cc/libraries/github.com/mobizt/Firebase_ESP8266_Client-4.4.10.zip
E instalamos el archivo zip como se visualiza en la siguiente imagen:

 

●	Recuerda tener a mano la url del Realtime database y la api KEY del firebase. Para obtenerlas revisa el paso 1


Código:
//Librerias a usar
#include <Arduino.h>
#include <ESP8266WiFi.h>
#include <FirebaseESP8266.h>

// Provide the token generation process info.
#include <addons/TokenHelper.h>

// Provide the RTDB payload printing info and other helper functions.
#include <addons/RTDBHelper.h>

/* 1. Definir las credenciales de acceso wifi (no debe ser 5g) */
#define WIFI_SSID "Tu nombre de red wifi"
#define WIFI_PASSWORD "Tu contraseña red wifi"

// For the following credentials, see examples/Authentications/SignInAsUser/EmailPassword/EmailPassword.ino

/* 2. Escribir la API Key (esta se encuentra en firebase, en configuracion del proyecto, ventana general, en configuración sdk) */
#define API_KEY "Tu Api KEY"

/* 3. escribir RTDB URL (Se encuentra en firebase en la seeccion de realtime database)*/
#define DATABASE_URL "tu url del realtime database (sin el https://)" //recuerda eliminar “https://” <databaseName>.firebaseio.com or <databaseName>.<region>.firebasedatabase.app

/* 4. Escribir mail y contraseña creada en la autentificacion de firebase, esta puede ser inventada, no es necesario que sea real */
#define USER_EMAIL "ejemplo@gmail.com" //u otro gmail
#define USER_PASSWORD "123456"

// Definiendo los objetos de fire base
FirebaseData fbdo;

FirebaseAuth auth;
FirebaseConfig config;

unsigned long sendDataPrevMillis = 0;

unsigned long count = 0;

#if defined(ARDUINO_RASPBERRY_PI_PICO_W)
WiFiMulti multi;
#endif

//Configuracion inicial
void setup()
{
  //configuracion hadware y red wifi
  pinMode(LED_BUILTIN, OUTPUT);  // Configurar el pin interno del LED como salida
  Serial.begin(9600);
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
  Serial.print("Conectando");
  while (WiFi.status() != WL_CONNECTED)
  {
    Serial.print(".");
    delay(500);
  }
  Serial.println();
  Serial.print("Conectado: ");
  Serial.println(WiFi.localIP());
  //configuracion de FireBase
  Serial.printf("Firebase Client v%s\n\n", FIREBASE_CLIENT_VERSION);

  /* Asignar la api key (required) */
  config.api_key = API_KEY;

  /* Asignar las credenciales de los usuarios*/
  auth.user.email = USER_EMAIL;
  auth.user.password = USER_PASSWORD;

  /* asignar la RTDB URL (required) */
  config.database_url = DATABASE_URL;

  /* Asignar la función de devolución de llamada para la tarea de generación de token de larga duración */
  config.token_status_callback = tokenStatusCallback; // see addons/TokenHelper.h

  // Comenta o pasa el valor falso cuando la reconexión WiFi será controlada por tu código o una biblioteca de terceros, como WiFiManager
  Firebase.reconnectNetwork(true);

  // Desde la versión 4.4.x, se utilizó el motor BearSSL, por lo que se debe establecer el búfer SSL.
  // Las transmisiones de datos grandes pueden requerir un búfer RX más grande; de lo contrario, pueden ocurrir problemas de conexión o tiempos de espera en la lectura de datos.
  fbdo.setBSSLBufferSize(4096 /* Tamaño del búfer Rx en bytes de 512 a 16384 */, 1024 /* Tamaño del búfer Tx en bytes de 512 a 16384 */);

  // Se requieren las credenciales de WiFi para Pico W
  // debido a que no tiene la función de reconexión.
#if defined(ARDUINO_RASPBERRY_PI_PICO_W)
  config.wifi.clearAP();
  config.wifi.addAP(WIFI_SSID, WIFI_PASSWORD);
#endif

  // O utiliza el método de autenticación heredado
  // config.database_url = DATABASE_URL;
  // config.signer.tokens.legacy_token = "<secreto de la base de datos>";

  // Para conectar sin autenticación en el modo de prueba, consulta Authentications/TestMode/TestMode.ino

  //////////////////////////////////////////////////////////////////////////////////////////////
  // Asegúrate de que la memoria libre del dispositivo no sea inferior a 80 KB para ESP32 y 10 KB para ESP8266,
  // de lo contrario, la conexión SSL fallará.
  //////////////////////////////////////////////////////////////////////////////////////////////

  Firebase.begin(&config, &auth);

  Firebase.setDoubleDigits(5);

}
// bucle principal
void loop()
{
  // Verifica el estado del LED en Firebase y realiza la acción correspondiente
  if (Firebase.getString(fbdo, "/Led1Status")) // Cambia firebaseData a fbdo aquí //recuerda usar el mismo nombre que asignamos en el paso 1
  {
    String ledstatus = fbdo.stringData(); // Cambia firebaseData a fbdo aquí
    if (ledstatus.toInt() == 1)
    {
      digitalWrite(LED_BUILTIN, LOW);
      Serial.println("Encendido");
    }
    else
    {
      digitalWrite(LED_BUILTIN, HIGH);
      Serial.println("Apagado");
    }
  }
  else
  {
    Serial.print("Error en getString, "); // Cambia getInt a getString aquí
    Serial.println(fbdo.errorReason()); // Cambia getInt a getString aquí
  }
}



●	Desde este momentos deberías de poder controlar el led desde el firebase, dirigiéndose a la sección de realtime database, cambiando los valores de la base de datos entre 0 (apagado) y 1 (encendido)

    

   


Paso 3. Creación página web

Requisitos previos 
Para este paso es necesario tener instalado el visual studio code https://code.visualstudio.com/  y tener instalado node js (https://nodejs.org/en).

Una vez instalados, creamos una carpeta para guardar el proyecto y abrimos visual studio code, seleccionamos la sección explorer, luego a open folder y buscamos la carpeta creada, como se muestra en la siguiente imagen.
 

Desde ahí creamos dos archivos en new file.. uno llamado script.js e index.html, tal como se observa en la siguiente imagen (para crear los archivos seleccionamos la parte marcada en amarillo).
 

También debemos de instalar Firebase en el equipo, para eso abrimos el símbolo del sistema y pegamos este código “npm install firebase”.
 

Código script.js

En la parte del codigo que dice var firebaseConfig ={ } debes de pegar el código que se encuentra en en la configuración sdk del firebase entre los patentes de llaves
 
var firebaseConfig = {
    // en esta sección debes de pegar la configuración del sdk del fire base
  };
  // Initialize Firebase
  firebase.initializeApp(firebaseConfig);
$(document).ready(function(){
    var database = firebase.database();
    var Led1Status;

    database.ref().on("value", function(snap){
        Led1Status = snap.val().Led1Status;
        if(Led1Status == "1"){    // check from the firebase
            //$(".Light1Status").text("The light is off");
            document.getElementById("unact").style.display = "none";
            document.getElementById("act").style.display = "block";
        } else {
            //$(".Light1Status").text("The light is on");
            document.getElementById("unact").style.display = "block";
            document.getElementById("act").style.display = "none";
        }
    });

    $(".toggle-btn").click(function(){
        var firebaseRef = firebase.database().ref().child("Led1Status");

        if(Led1Status == "1"){    // post to firebase
            firebaseRef.set("0");
            Led1Status = "0";
        } else {
            firebaseRef.set("1");
            Led1Status = "1";
        }
    })
});


Código HTML
Este código puedes simplemente copiar y pegar
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Rambal - Controlador LED</title>
    <!-- Incluye las bibliotecas de Firebase, jQuery y Font Awesome -->
    <script src="https://www.gstatic.com/firebasejs/8.4.1/firebase-app.js"></script>
    <script src="https://www.gstatic.com/firebasejs/8.4.1/firebase-database.js"></script>
    <script src="https://ajax.googleapis.com/ajax/libs/jquery/3.5.1/jquery.min.js"></script>
    <script src="script.js"></script>
    <!-- Incluye estilos mejorados para los botones -->
    <style>
        body {
            font-family: Arial, sans-serif;
            margin: 0;
            display: flex;
            justify-content: center;
            align-items: center;
            height: 100vh;
            background-color: #f0f0f0;
        }
        .wrapper {
            text-align: center;
        }
        h1 {
            margin-bottom: 20px;
        }
        .icon1 {
            text-decoration: none;
            color: black;
        }
        .progress {
            display: flex;
            justify-content: space-between;
            align-items: center;
            width: 100px;
        }
        .toggle-btn {
            width: 60px; /* Mayor tamaño para un efecto de switch más pronunciado */
            height: 20px;
            border-radius: 15px; /* Redondear los bordes para simular un switch */
            background-color: #ddd;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: flex-start; /* Inicia el círculo a la izquierda */
            padding: 5px;
            transition: background-color 0.3s ease-in-out;
        }
        .inner-circle {
            width: 20px;
            height: 20px;
            border-radius: 50%;
            background-color: white;
            transition: transform 0.3s ease-in-out;
        }
        #act .inner-circle {
            transform: translateX(30px); /* Mueve el círculo hacia la derecha al encender */
            background-color: blue; /* Cambia a azul cuando está encendido */
        }
        #unact .inner-circle {
            transform: translateX(0); /* Mueve el círculo de vuelta a la posición original al apagar */
        }
    </style>
</head>
<body>
    <div class="wrapper">
        <h1>Rambal - Controlador LED</h1>
        <a class="icon1" href="#">
            <!-- Utiliza un ícono de Font Awesome, asegúrate de tener la biblioteca incluida -->
            <i class="fas fa-4x fa-tv"></i>
        </a>
        <div class="progress">
            <div class="toggle-btn" id="unact">
                <div class="inner-circle"></div>
            </div>
            <div class="toggle-btn active" id="act">
                <div class="inner-circle"></div>
            </div>
        </div>
       
    </div>
</body>
</html>


Paso 4 subir a github para el hosting

Primeros debes de iniciar sesion en github (o crearla si no la tienes) desde el siguiente link, https://github.com

Cuando ya esten en la pagina principal simplemente debes de crear un nuevo repositorio, tal como se muestra en la siguiente imagen:
 

una vez dentro solo creas el nombre del repositorio, tal como se muestra en la siguiente imagen: 
 

Luego debes de subir la carpeta en donde tengas el archivo index.html y script.js (en mi caso también subí el archivo del código de arduino).
 

Y seleccionas los archivos desde tu escritorio (también los puedes arrastrar hasta la página)

 

Finalmente la pagina debiese de verse como en la imagen, como buenas practicas puedes comentar los cambios en commit changes, pero en este caso lo dejamos tal cual esta y apretamos el boton.
 

una vez dentro del repositorio seleccionamos las opciones:
 

nos dirigimos a Code and automation → page y en branch seleccionamos main

 

en archivo dejamos el predeterminado (/root) y guardamos, por ultimo queda esperar hasta que github entregue el link, recomiendo refrescar la pagina.

 

apretas el boton “Visit site” y redireccionará a la página creada 

 
 

 
 
