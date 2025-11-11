document.getElementById('mapPicker').addEventListener('change',function(){
     changeTiles(this.value);
});

L.mapbox.accessToken = 'pk.eyJ1Ijoibmhob3JuZXIiLCJhIjoiaE5kZE5KTSJ9.FBXIBLr6wC0wdsGq_qBsVA';

// Create maps in the divs
var active_map = L.mapbox.map('active_map', 'mapbox.streets', {
    zoomControl: false
});
active_map.scrollWheelZoom.disable();

var lineStyle = {'color':'#cd7139','weight': 4.5,'opacity': 1, 'lineJoin':'round'};
var polyStyle = {'color': '#000','weight': 3,'opacity': 0.65,'fillOpacity': 0, 'lineJoin':'round'};
var pointStyle = { radius: 10.5, fillColor: '#cd7139',color: '#fff',weight: 1,opacity: 0.3,fillOpacity: 0.8};

var geocoder = L.mapbox.geocoder('mapbox.places-v1');

function changeTiles(value){
    L.mapbox.tileLayer(value).addTo(active_map);
}

// Set Starting Location
geocoder.query('Eugene, OR', showMap);

function findAddress(){
    var getInput = document.getElementById('address').value;
    geocoder.query(getInput, showMap);
}

// grab the lat long values and adjust all the maps
function findLatLon(){
    var getLat = document.getElementById('lat').value;
    var getLon = document.getElementById('lon').value;
    active_map.setView([getLat, getLon], 10);
}

function showMap(err, data) {
// Fit the map bounds to an area or zooming to a point.
if (data.lbounds) {
    active_map.fitBounds(data.lbounds);
} else if (data.latlng) {
    active_map.setView([data.latlng[0], data.latlng[1]], 13);
}
}

$("#address").geocodify({
    onSelect: function (result) {
        //console.log(result);
    }
});

function addJsonFeature(){
    var getData = document.getElementById('addJson').value;

    var jsonData = JSON.parse(getData);

    var jsonLayer1 = new L.geoJson(jsonData,{
        style: function(feature) {return addStyle(feature);},
        pointToLayer: function (feature, latlng) {
            return L.circleMarker(latlng, pointStyle);
            }
    }).addTo(active_map);

    function addStyle(feature){
    switch (feature.geometry.type) {
        case 'MultiPolygon': return polyStyle;
        case 'Polygon': return polyStyle;
        case 'MultiLineString': return lineStyle;
        case 'LineString': return lineStyle;
        case 'Point': return pointStyle;
        case 'MultiPoint': return pointStyle;
    }}
}

function gatherinfo(id){

    leafletImage(id, doImage);

    function doImage(err, canvas) {
        var img = document.createElement('img');
        img.width = $("#active_map").css("width").substring(0, $("#active_map").css("width").length - 2);
        img.height = $("#active_map").css("height").substring(0, $("#active_map").css("height").length - 2);
        img.src = canvas.toDataURL();

        document.getElementById('sm').innerHTML ='';
        document.getElementById('sm').appendChild(img);

        $("#download_link").removeAttr("href");
        $("#download_link").removeAttr("download");

        if (img.width * img.height < 1000000) {
            $("#download_link").attr("href", canvas.toDataURL());
            $("#download_link").attr("download", "mapbox_image.png");
        }
    }
    $("#download").attr("disabled", false);
    resize_div();
}

// add enter key functionality
var go = document.getElementById("addressBtn");
var txt = document.getElementById("address");

txt.addEventListener("keypress", function() {
    if (event.keyCode == 13) go.click();
});

// Input Range(slider)
function outputUpdate(vol) {
    active_map.setZoom(vol);
}

active_map.on('zoomend', function(){
    $("#zoom_level").html(active_map.getZoom());
    $("#zoom_slider").val(active_map.getZoom());
});

function resizemap() {
    if ($("#width").val().length > 0) {
        $("#another_container").css("width", $("#width").val());
    }
    if ($("#height").val().length > 0) {
        $("#another_container").css("height", $("#height").val());
    }
    active_map.invalidateSize();
}

var resize_div = function(){
    $("#static-map div").width($("#active_map").width());
    $("#static-map div").height($("#active_map").height());
}
resize_div();

function image_export() {
    if ($("#sm img").height() * $("#sm img").width() >= 1000000) {
        alert("Large images should be downloaded by right clicking the image and selecting 'Save image as...'");
    }
}

function add_style() {
    $('#mapPicker').append('<option value="' + $("#style_id").val() + '">' + $("#style_name").val() + '</option>');
    $('#mapPicker').val($("#style_id").val());
    changeTiles($("#style_id").val());
    $("#style_id").val("");
    $("#style_name").val("");
}