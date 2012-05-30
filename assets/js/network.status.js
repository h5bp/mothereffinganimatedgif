// JavaScript Document

//application cache network status

// save the string
function saveStatusLocally(txt) {
  window.localStorage.setItem("status", txt);
}
 
// read the string
function readStatus() {
   return window.localStorage.getItem("status");
}

function whatIsYourCurrentStatus() {
  var status = window.prompt("What is your current status?");
  if (!status) return;
  if (navigator.onLine) {
    sendToServer(status);
  } else {
    saveStatusLocally(status);
  }
}
 
function sendLocalStatus() {
  var status = readStatus();
  if (status) {
    sendToServer(status);
    window.localStorage.removeItem("status");
  }
}

window.addEventListener("load", function() {
   if (navigator.onLine) {
     sendLocalStatus();
   }
}, true);

window.addEventListener("offline", function() {
  alert("You're Offline Amigo! If you update your status, it will be sent when you go back online");
}, true);

window.addEventListener("online", function() {
  sendLocalStatus();
  alert('You\'re online again Amigo. Welcome back to the cloud');
}, true);