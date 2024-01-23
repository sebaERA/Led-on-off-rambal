var firebaseConfig = {
    apiKey: "AIzaSyAVxMYNALzLk5O0CZ-ek-rAJBqEP8rmcsU",
    authDomain: "led-on-off-8b4f9.firebaseapp.com",
    databaseURL: "https://led-on-off-8b4f9-default-rtdb.firebaseio.com",
    projectId: "led-on-off-8b4f9",
    storageBucket: "led-on-off-8b4f9.appspot.com",
    messagingSenderId: "373869495161",
    appId: "1:373869495161:web:f0bea491d86e9e4350e5a8"// en esta sección debes de pegar la configuración del sdk del fire base
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
