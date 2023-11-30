/** 
 *  Functionality for index Page
 *  @author Christian Boughton
*/

const inputs = [];
var i = 0;
var user;

// Clear local storage
localStorage.clear();

// Try to grab user infomration if they are logged in and change the icon to indicate they have logged in
user = JSON.parse(sessionStorage.getItem('user'));
if (user != null)   {
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
 *  Autocomplete the input address field and save
 *  the selected location to the inputs[]
 */
function initialize() {
    // Get the input from the locations field
    var input = document.getElementById('locations');

    // Create the options object that stores location information
    var options = {
      fields: ['address_components', 'geometry'],
      types: ['address'],
      componentRestrictions: {'country': ['us']},
    };

    // Autocomplete functionality
    var autocomplete = new google.maps.places.Autocomplete(input, options);
        google.maps.event.addListener(autocomplete, 'place_changed', function () {
            var place = autocomplete.getPlace();
            var name = place.address_components[0].long_name + " " + place.address_components[1].long_name + " " + place.address_components[2].long_name;
            var lat = place.geometry.location.lat();
            var lng = place.geometry.location.lng();
            inputs[i] = {id:i, name:name, lattitude:lat, longitude:lng, frequency:0};
        });
}
google.maps.event.addDomListener(window, 'load', initialize);

/**
 *  Algorithm for generating heat-map
 *  overlay related data
 */
document.getElementById("submit").onclick = async function()  {

    // Initial values for bounds UPDATED
    var minLat = inputs[0].lattitude;
    var maxLat = inputs[0].lattitude;
    var minLng = inputs[0].longitude;
    var maxLng = inputs[0].longitude;

    // Set interim bounds UPDATED
    for (let j = 0; j < inputs.length; j++) {
        minLat = Math.min(minLat, inputs[j].lattitude);
        maxLat = Math.max(maxLat, inputs[j].lattitude);
        minLng = Math.min(minLng, inputs[j].longitude);
        maxLng = Math.max(maxLng, inputs[j].longitude);
    }

    // Define grid distances
    var vSpace = ((maxLng - minLng) / 3);
    var hSpace = ((maxLat - minLat) / 3);

    // Create Overlayed Grid
    var grid = new Array(4).fill(null).map(()=>new Array(3).fill(null));

    // Populate the Grid
    for (let k = 0; k < 4; k++) {
        for (let l = 0; l < 4; l++) {
            var finLat = (minLat + (k * hSpace));
            grid[k][l] = {"lattitude": finLat, "longitude": (minLng + (l * vSpace)), "driveTime" : 0, "fillColor": "0"};
        }
    }

    // Next calculate the drive times from each input to each grid point, then scale it to get the weight
    for (let k = 0; k < 4; k++) {
        for (let l = 0; l < 4; l++) {
            let temp = 0;
            for (let m = 0; m < inputs.length; m++) {
                // Get drive time and add it to temp
                // temp = return from API call origin grid[k][l] destination inputs[m]
                await getDriveTime(grid[k][l].lattitude, grid[k][l].longitude, inputs[m].lattitude, inputs[m].longitude).then((resolve) => {
                    let unscaled = resolve;
                    temp += (unscaled * inputs[m].frequency);
                })
            }

            // Gets the average drive time to that location
            temp = (temp / (inputs.length));

            // Set the grid point weight
            grid[k][l].driveTime = temp;
        }
    }

    // Save grid to local storage
    localStorage.setItem('arr', JSON.stringify(grid));
    localStorage.setItem('markers', JSON.stringify(inputs));

    // Change to the display maps page
    window.location.href = "mapDisplay.html";
}

/**
 *  API function to get the driving
 *  duration from node to end-point
 *  @param {*} oLat 
 *  @param {*} oLng 
 *  @param {*} dLat 
 *  @param {*} dLng 
 *  @returns Promise containing duration
 */
function getDriveTime(oLat, oLng, dLat, dLng)   {
    var diectionsService = new google.maps.DirectionsService();
    var start = new google.maps.LatLng(oLat, oLng);
    var end = new google.maps.LatLng(dLat, dLng);
    var request = {
        origin: start,
        destination: end,
        travelMode: 'DRIVING'
    };
    return new Promise((resolve, reject) => {
        diectionsService.route(request, function(result, status)    {
            if (status == 'OK') {
                resolve(result.routes[0].legs[0].duration.text.replace(/[^0-9]/g,""));
            }
            else{
                reject(status);
            }
        });
    });
}

/**
 *  Toggle for displaying or
 *  hiding the dropdown
 */
document.getElementById("show-elements-dropdown").onclick = function()  {
    document.getElementById("dropdown").classList.toggle("show");
}

/**
 *  Function to add data to
 *  to the dropdown
 */
document.getElementById("add-elements").onclick = function() {
    var frequencies = document.getElementById("frequencies").value;
    if((frequencies.nodeValue !== ""))  {
        inputs[i].frequency = frequencies;
        document.getElementById("locations").value = "";
        document.getElementById("frequencies").value = "";
        deleteElements();
        showElements();
        i++
    }    
}

/**
 *  Helper function that removes
 *  all data from the dropdown
 *  
 *  This is needed when a location is
 *  removed to reset the drop down 
 */
function deleteElements()   {
    const myNode = document.getElementById("dropdown");
    while(myNode.firstChild)    {
        myNode.removeChild(myNode.lastChild);
    }
}

/**
 *  Helper function to append
 *  the locations to the dropdown
 */
function showElements()    {
    for (const element of inputs)   {
        const node = document.createElement("li");
        const locationsNode = document.createTextNode(element.name);
        const frequenciesNode = document.createTextNode(element.frequency);
        var deletebutton = document.createElement("button");
        deletebutton.innerHTML = "x";
        deletebutton.setAttribute("class", "deletebutton");
        deletebutton.addEventListener("click", function()   {
            var toSplice = element.id;
            inputs.splice(toSplice, 1);
            deleteElements();
            updateIDS();
            i = inputs.length;
            showElements();
        });
        node.appendChild(locationsNode);
        node.appendChild(frequenciesNode);
        node.appendChild(deletebutton);
        document.getElementById("dropdown").appendChild(node);
    }
}

/**
 *  Helper function to update the IDs
 *  of the inputs in the inputs []
 * 
 *  This is needed when a location is removed
 *  to maintain sequential IDs
 */
function updateIDS()    {
    for (j = 0; j < inputs.length; j++) {
        inputs[j].id = j;
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
