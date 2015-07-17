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
		var oms = new OverlappingMarkerSpiderfier(map);
		var popup = new L.Popup();
		oms.addListener('click', function(marker) {
		  popup.setContent(marker.desc);
		  popup.setLatLng(marker.getLatLng());
		  map.openPopup(popup);
		});
		oms.addListener('spiderfy', function(markers) {
		  map.closePopup();
		});

        var latlngs = [];
        for (var i=0;i<data.length;i++){
          if (data[i].latitude && data[i].longitude){
          	var datum = data[i]
          	var loc = new L.LatLng(datum.latitude, datum.longitude);
			var marker = new L.Marker(loc);
			marker.desc = datum.activity +'<br>'+ datum.description;
			map.addLayer(marker);
			oms.addMarker(marker);
            latlngs.push([data[i].latitude,data[i].longitude]);
          }            
        }
        console.log(latlngs.length)
        if (latlngs.length >= 2){
        	var polyline = L.polyline(latlngs).addTo(map);
        }
        

}