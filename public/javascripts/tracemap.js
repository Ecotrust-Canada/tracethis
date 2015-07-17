var map = L.map('map').setView([51.505, -0.09], 13);

L.tileLayer('https://{s}.tiles.mapbox.com/v3/{id}/{z}/{x}/{y}.png', {
    maxZoom: 18,
    attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, ' +
        '<a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, ' +
        'Imagery © <a href="http://mapbox.com">Mapbox</a>',
    id: 'examples.map-i875mjb7'
}).addTo(map);

/*var drawMarkers = function*/

var render = function(data){
        var latlngs = [];
        for (var i=0;i<data.length;i++){
          if (data[i].latitude && data[i].longitude){
            L.marker([data[i].latitude,data[i].longitude]).addTo(map);
            latlngs.push([data[i].latitude,data[i].longitude]);
          }            
        }
        console.log(latlngs.length)
        if (latlngs.length >= 2){
        	var polyline = L.polyline(latlngs).addTo(map);
        }
        

}