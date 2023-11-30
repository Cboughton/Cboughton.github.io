/**
 * @author Christian Boughton
 */
const recs = [];
var user;

//Try to grab user information if they are logged in and change the icon to indicate they have logged in
user = JSON.parse(sessionStorage.getItem('user'));
if (user != null)   {
  document.getElementById("saveButton").classList.toggle("show");
  changeIcon(user.name);
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
 *  Changes the top right icon from the empty
 *  account icon to an icon with the first letter of
 *  the logged in users name.
 *  @param {*} name 
 */
function changeIcon(name)   {
  var firstLetter = name.charAt(0);
  firstLetter.toUpperCase();
  path = "images/Letter_icons/" + firstLetter + ".png";
  document.getElementById("img").setAttribute("src", path);
}

/**
 *  Create overlay objects and display the map
 */
function myMap() {
  // Get grid from local-storage
  const grid = JSON.parse(localStorage.getItem('arr') || "[]");
  const inputs = JSON.parse(localStorage.getItem('markers') || "[]");
  localStorage.clear();

  // Display the map
  // TODO. Add function to change the zoom level based on grid parameters
  const map = new google.maps.Map(document.getElementById("map"), {
    zoom: 9,
    center:new google.maps.LatLng(grid[1][1].lattitude, grid[1][1].longitude),
    mapTypeID: "terrain",
  });

  // Get max and min weight
  var maxDriveTime = 0;
  var minDriveTime = 0;
  for (let i = 0; i < 4; i++) {
    for (let j = 0; j < 4; j++) {
      maxDriveTime = Math.max(maxDriveTime, grid[i][j].driveTime);
      minDriveTime = Math.min(minDriveTime, grid[i][j].driveTime);
    }
  }

  // Set the fillColor to one of 5 options based on the DriveTime max and min 
  var weightIncrements = ((maxDriveTime - minDriveTime) / 5);
  for (let i = 0; i < 4; i++) {
    for (let j = 0; j < 4; j++) {
      var temp = grid[i][j].driveTime;
      if (temp  < (minDriveTime + weightIncrements)) {
        grid[i][j].fillColor = "#44ce1b";
      }
      else if (temp  < (minDriveTime + (weightIncrements * 2))) {
        grid[i][j].fillColor = "#bbdb44";
      }
      else if (temp  < (minDriveTime + (weightIncrements * 3))) {
        grid[i][j].fillColor = "#f7e379";
      }
      else if (temp  < (minDriveTime + (weightIncrements * 4))) {
        grid[i][j].fillColor = "#f2a134";
      }
      else if (temp  <= (minDriveTime + (weightIncrements * 5))) {
        grid[i][j].fillColor = "#e51f1f";
      }
    }
  }

  // Create the dimensions of the objects to display
  var verticalDist = (Math.max(grid[1][0].lattitude, grid[0][0].lattitude) - Math.min(grid[1][0].lattitude, grid[0][0].lattitude));
  var horizontalDist = (Math.max(grid[0][1].longitude, grid[0][0].longitude) - Math.min(grid[0][1].longitude, grid[0][0].longitude));

  // Create the overlay objects
  var m = 0;
  for (let i = 0; i < 4; i++) {
    for (let j = 0; j < 4; j++) {
      recs[m] =  {north: (grid[i][j].lattitude + ( .5 * verticalDist)), 
                  south: (grid[i][j].lattitude - ( .5 * verticalDist)),
                  east: (grid[i][j].longitude + ( .5 * horizontalDist)),
                  west: (grid[i][j].longitude - ( .5 * horizontalDist)),
                  borderColor: grid[i][j].fillColor,
                  fillColor: grid[i][j].fillColor};
      m += 1;
    }
  }

  // Overlay the rectangles in the recs[] on top of the googleMaps grid
  for (let i = 0; i < recs.length; i++) {
    const rectangle = new google.maps.Rectangle({
      strokeColor: recs[i].borderColor,
      strokeOpacity: 0.50,
      strokeWeight: 0,
      fillColor: recs[i].fillColor,
      fillOpacity: 0.50,
      map,
      bounds: {
        north: recs[i].north,
        south:  recs[i].south,
        east:  recs[i].east,
        west:  recs[i].west,
      },
    });
  }

  // Add markers for imputed locations
  for (let i = 0; i < inputs.length; i++) {
    var myLatLng = { lat: inputs[i].lattitude, lng: inputs[i].longitude};
    var newMarker = new google.maps.Marker({
      position: myLatLng,
      title: inputs[i].name 
    });
    newMarker.setMap(map);
  }
}

/**
 *  Defines save button click
 * 
 *  Sends the overlay objects int he recs[]
 *  to the backend for storage
 */
document.getElementById("saveButton").onclick = async function()  {
  const heatMapData = JSON.stringify(recs);

	const fetchOptions = {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
			Accept: "application/json",
			mode: "no-cors",
		},
		body: heatMapData,
	};

	const response = await fetch("http://13.59.183.231:8080/heatmaps/" + user.id, fetchOptions);

	if (!response.ok) {
		const errorMessage = await response.text();
    const btn = document.getElementById('saveButton');
    btn.disabled = true;
    btn.innerHTML = "Failure";
		throw new Error(errorMessage);
	}
  const btn = document.getElementById('saveButton');
  btn.disabled = true;
  btn.innerHTML = "Success";
}