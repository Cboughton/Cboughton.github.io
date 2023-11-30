/**
 *  @author Christian Boughton 
 */
var user;

//Try to grab user information if they are logged in and change the icon to indicate they have logged in
user = JSON.parse(sessionStorage.getItem('user'));
if (user != null)   {
  document.getElementById("saveButton").classList.toggle("show");
  changeIcon(user.name);
}

/**
 *  Changes the Icon for a user that is logged in 
 *  @param {*} name 
 */
function changeIcon(name)   {
  var firstLetter = name.charAt(0);
  firstLetter.toUpperCase();
  path = "images/Letter_icons/" + firstLetter + ".png";
  document.getElementById("img").setAttribute("src", path);
}

/**
 *  Controls the location of where the icon
 *  directs when clicked based on a user being
 *  logged in or not 
 */
document.getElementById("userIcon").onclick = function()    {
  if (user != null)   {
      window.location.href = "account.html";
  }
  else{
      window.location.href = "CapturePortal.html";
  }
}

/**
 *  Overlay previously generated objects onto a new map
 */
function myMap() {
  let recs = [];
  console.log(JSON.parse(localStorage.getItem('heatMapData' || "[]")));
  recs = JSON.parse(localStorage.getItem('heatMapData' || "[]"));
  localStorage.clear();

  console.log(recs.length + "length");
  console.log(recs[1].north + "north");
  
  // Display the map
  const map = new google.maps.Map(document.getElementById("map"), {
    zoom: 9,
    center: new google.maps.LatLng(recs[11].north, recs[11].east),
  });

  // Overlay the rectangles in the recs[] on top of the googleMaps grid
  for (let i = 0; i < recs.length; i++) {
    const rectangle = new google.maps.Rectangle({
      strokeColor: recs[i].borderColor,
      strokeOpacity: 0.35,
      strokeWeight: 0,
      fillColor: recs[i].fillColor,
      fillOpacity: 0.35,
      map,
      bounds: {
        north: recs[i].north,
        south:  recs[i].south,
        east:  recs[i].east,
        west:  recs[i].west,
      },
    });
  }

  // Clear local storage
  localStorage.clear();
}
