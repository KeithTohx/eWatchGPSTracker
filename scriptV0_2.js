// list to store map markers
let markersArray = [];
// list to store date from timestamps
let dateArray = [];
// status to check whether date is in list
let dateStatus = false;

function initMap() {
    // map options
    var options = {
        center: {lat: 1.3656, lng: 103.8530},
        zoom: 11
    };

    // new map
    var map = new google.maps.Map(document.getElementById('map'), options);

    // User current location (from Google Maps Platform Documentation)
    infoWindowUser = new google.maps.InfoWindow();
    const locationButton = document.createElement("button");
    locationButton.textContent = "Pan to Current Location";
    locationButton.classList.add("custom-map-control-button");
    map.controls[google.maps.ControlPosition.TOP_CENTER].push(locationButton);
    locationButton.addEventListener("click", () => {
        // Try HTML5 geolocation.
        if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            (position) => {
            const pos = {
                lat: position.coords.latitude,
                lng: position.coords.longitude,
            };
            infoWindowUser.setPosition(pos);
            infoWindowUser.setContent("<p style='font-size: 16px; margin-bottom: 0%;'><b>Your Current Location</b>");
            map.setCenter(pos);
            // create user marker on map
            var markerUser = new google.maps.Marker({
                position: pos,
                animation:google.maps.Animation.DROP,
                map: map
            });
            markerUser.addListener('click', function(){
                infoWindowUser.open(map, markerUser);
            });
            },
            () => {
            handleLocationError(true, infoWindow, map.getCenter());
            }
        );
        } else {
        // Browser doesn't support Geolocation
        handleLocationError(false, infoWindow, map.getCenter());
        }
    });

    // Adds a marker to the map and push to the array
    function addMarker(props){
        var marker = new google.maps.Marker({
        position: props.coords,
        map: map
        });
        markersArray.push(marker);

        // check content
        if (props.content){
        let infoWindow = new google.maps.InfoWindow({
            content: props.content
        });
        
        marker.addListener('click', function(){
            infoWindow.open(map, marker);
        });
        }
    }

    // sets the map on all markers in the array
    function setMapOnAll(map) {
        for (let i = 0; i < markersArray.length; i++) {
        markersArray[i].setMap(map);
        }
    }

    // deletes all markers in the array by removing references to them
    function deleteMarkers() {
        setMapOnAll(null); 
        markersArray = [];
    }

    // get data from JSONbin
    let req = new XMLHttpRequest();
    req.onreadystatechange = () => {
    if (req.readyState == XMLHttpRequest.DONE) {
        //console.log(req.responseText);

        var dataStr = (req.responseText).toString()
        var dataObj = JSON.parse(dataStr);

        //console.log(dataObj);

        for (var i=0; i<(dataObj.data).length; i++)
        {
            var timestamp = dataObj.data[i].timestamp;
            var timestampArray = timestamp.split(" ");
            var date = timestampArray[0];
            
            dateStatus = false;
            if (dateArray.length == 0)
            {
                dateStatus = false;
            }
            dateArray.forEach(element => {
                if (element == date)
                {
                    dateStatus = true;
                }
            });

            if (dateStatus == false)
            {
                dateArray.push(date);
            }
        }

        dateArray.forEach(element => {
            $("#selectDate").append(`<option value="${element}">${element}</option>`)
        });

        // get user input from dropdown list
        $("#submitBtn").on('click', function () {
            var selectedDate = $("#selectDate").find("option:selected").text();
            deleteMarkers()
            $("table tbody tr").remove();
            getDatafromDate(selectedDate);
        });

        // remove marker on map and text below map
        $("#clearBtn").on('click', function () {
            deleteMarkers()
            $("table tbody tr").remove();
        });

        function getDatafromDate(selectedDate)
        {
            for (var i=0; i<(dataObj.data).length; i++)
            {
                var timestamp = dataObj.data[i].timestamp;
                var timestampArray = timestamp.split(" ");
                var date = timestampArray[0];

                if (date == selectedDate)
                {
                    var longitude = dataObj.data[i].longitude; 
                    var latitude = dataObj.data[i].latitude;
                    var imei = dataObj.data[i].imei;
                    var battery = dataObj.data[i].battery;

                    $("#tableData").append(`<tr>
                                            <td>${timestamp}</td>
                                            <td>${longitude}</td>
                                            <td>${latitude}</td>
                                            <td>${imei}</td>
                                            <td>${battery}</td>
                                            </tr>`)

                    // marker info window content 
                    var contentString =
                    `<div id="content">
                    <div id="siteNotice">
                    </div>
                    <div id="bodyContent">
                    <p style='margin-top: 1rem;'>
                    Timestamp: ${timestamp} <br>
                    Longitude: ${longitude} <br>
                    Latitude: ${latitude} <br>
                    IMEI: ${imei} <br>
                    Battery Level: ${battery}
                    </p>
                    </div>
                    </div>`;

                    // call function to add marker on map
                    addMarker({
                    coords:{lat: latitude, lng: longitude},
                    content: contentString
                    });
                }
            }
        }
    }
    };
    req.open("GET", "https://api.jsonbin.io/v3/b/627b78cb019db467969ab4ae/latest", true);
    req.setRequestHeader("X-Master-Key", "$2b$10$mclVkIxc5MBRBWLMnOJvBeGse891zhaJr4yaP0BOmbhywjkDl52tO");
    req.setRequestHeader("X-Bin-Meta", false)
    req.send();

    // for user current location
    function handleLocationError(browserHasGeolocation, infoWindow, pos) {
    infoWindow.setPosition(pos);
    infoWindow.setContent(
        browserHasGeolocation
        ? "Error: The Geolocation service failed."
        : "Error: Your browser doesn't support geolocation."
    );
    infoWindow.open(map);
    }

}