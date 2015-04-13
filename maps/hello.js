Markers = new Mongo.Collection('markers');

if (Meteor.isClient) {
    Meteor.startup(function() {
        GoogleMaps.load();
    });

    Template.map.helpers({
        mapOptions: function() {
            if (GoogleMaps.loaded()) {
                return {
                    center: new google.maps.LatLng(59.4802455536739, 17.7593994140625 ),
                    zoom: 9
                };
            }
        }
    });

    Template.map.onCreated(function() {
        GoogleMaps.ready('map', function(map) {
            google.maps.event.addListener(map.instance, 'click', function(event) {
                Meteor.call("addJob", event.latLng.lat(), event.latLng.lng());
            });

            var markers = {};

            Markers.find().observe({
                added: function (document) {
                    var marker = new google.maps.Marker({
                        draggable: true,
                        animation: google.maps.Animation.DROP,
                        position: new google.maps.LatLng(document.lat, document.lng),
                        map: map.instance,
                        id: document._id
                    });

                    google.maps.event.addListener(marker, 'dragend', function(event) {
                        Markers.update(marker.id, { $set: { lat: event.latLng.lat(), lng: event.latLng.lng() }});
                    });

                    markers[document._id] = marker;
                },
                changed: function (newDocument, oldDocument) {
                    markers[newDocument._id].setPosition({ lat: newDocument.lat, lng: newDocument.lng });
                },
                removed: function (oldDocument) {
                    markers[oldDocument._id].setMap(null);
                    google.maps.event.clearInstanceListeners(markers[oldDocument._id]);
                    delete markers[oldDocument._id];
                }
            });
        });
    });

    Meteor.subscribe("jobs");
    Template.body.helpers({
        jobs: function() {
            return Markers.find();
        }
    });

    Template.jobLine.events({
        "click .delete": function () {
            Meteor.call("deleteJob", this._id);
        }
    });

}

Meteor.methods({
    deleteJob: function (jobId) {
        var job = Markers.findOne(jobId);
        Markers.remove(jobId);
    },
    addJob: function(lat, lng) {
        Markers.insert({ lat: lat, lng: lng, status: "new" });
    }
});

if (Meteor.isServer) {
  Meteor.startup(function () {
    // code to run on server at startup
  });
}
