function popitup(jobId) {
    var job = JobsCollection.findOne(jobId);
    var popUp = document.getElementById("thePopUp");
    var popUpButton = document.getElementById("popUpButton");
    $(popUp).html("<p>" + job.description + "</p><p>" + job.address + "<p>");
    $(popUpButton).click();
}
Meteor.subscribe("alljobs");

Template.map.helpers({
    mapOptions: function () {
        if (GoogleMaps.loaded()) {
            return {
                center: new google.maps.LatLng(59.4802455536739, 17.7593994140625),
                zoom: 11
            };
        }
    }
});

Template.map.onCreated(function () {
    function updateMarker(marker, nr, description) {
        marker.setTitle(description);
        if (!isNaN(parseFloat(nr)) && isFinite(nr)) {
            marker.setIcon('http://www.googlemapsmarkers.com/v1/' + nr + '/0099FF/');
        }
    }

    GoogleMaps.ready('map', function (map) {
        console.log(Router.current().param1);
        google.maps.event.addListener(map.instance, 'click', function (event) {
            // Meteor.call("addJob", event.latLng.lat(), event.latLng.lng());
        });

        var markers = {};

        JobsCollection.find({status: {$in: ["accepterad", "påbörjat", "klart"]}}).observe({
            added: function (document) {
                var marker = new google.maps.Marker({
                    draggable: true,
                    clickable: true,
                    animation: google.maps.Animation.DROP,
                    position: new google.maps.LatLng(document.lat, document.lng),
                    icon: 'http://www.googlemapsmarkers.com/v1/12/0099FF/',
                    title: 'some title',
                    map: map.instance,
                    id: document._id
                });
                updateMarker(marker, document.nr, document.description);

                google.maps.event.addListener(marker, 'dragend', function (event) {
                    JobsCollection.update(marker.id, {$set: {lat: event.latLng.lat(), lng: event.latLng.lng()}});
                });

                google.maps.event.addListener(marker, 'click', function (event) {
                    popitup(this.id);
                });

                markers[document._id] = marker;
            },
            changed: function (newDocument, oldDocument) {
                markers[newDocument._id].setPosition({lat: newDocument.lat, lng: newDocument.lng});
                updateMarker(markers[newDocument._id], newDocument.nr, newDocument.description);
            },
            removed: function (oldDocument) {
                markers[oldDocument._id].setMap(null);
                google.maps.event.clearInstanceListeners(markers[oldDocument._id]);
                delete markers[oldDocument._id];
            }
        });
    });
});
