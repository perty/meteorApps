Markers = new Mongo.Collection('markers');

if (Meteor.isClient) {
    Meteor.startup(function () {
        GoogleMaps.load();
    });

    Template.map.helpers({
        mapOptions: function () {
            if (GoogleMaps.loaded()) {
                return {
                    center: new google.maps.LatLng(59.4802455536739, 17.7593994140625),
                    zoom: 9
                };
            }
        }
    });

    Template.map.onCreated(function () {
        GoogleMaps.ready('map', function (map) {
            google.maps.event.addListener(map.instance, 'click', function (event) {
                Meteor.call("addJob", event.latLng.lat(), event.latLng.lng());
            });

            var markers = {};

            Markers.find().observe({
                added: function (document) {
                    var marker = new google.maps.Marker({
                        draggable: true,
                        animation: google.maps.Animation.DROP,
                        position: new google.maps.LatLng(document.lat, document.lng),
                        icon: 'http://www.googlemapsmarkers.com/v1/12/0099FF/',
                        title: 'some title',
                        map: map.instance,
                        id: document._id
                    });

                    google.maps.event.addListener(marker, 'dragend', function (event) {
                        Markers.update(marker.id, {$set: {lat: event.latLng.lat(), lng: event.latLng.lng()}});
                    });

                    markers[document._id] = marker;
                },
                changed: function (newDocument, oldDocument) {
                    markers[newDocument._id].setPosition({lat: newDocument.lat, lng: newDocument.lng});
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
        jobs: function () {
            return Markers.find();
        }
    });

    Template.jobLine.events({
        "click .delete": function () {
            Meteor.call("deleteJob", this._id);
        },
        "blur .nr": function (event) {
            var nr = event.target.value;
            Meteor.call("setNr", this._id, nr);
        },
        "blur .address": function (event) {
            var address = event.target.value;
            Meteor.call("setAddress", this._id, address);
        }
    });

}

Meteor.methods({
    deleteJob: function (jobId) {
        var job = Markers.findOne(jobId);
        Markers.remove(jobId);
    },
    addJob: function (lat, lng) {
        Markers.insert({lat: lat, lng: lng, status: "new"});
    },
    setNr: function (jobId, nr) {
        Markers.update(jobId, {$set: {nr: nr}});
    },
    setAddress: function (jobId, address) {
        Markers.update(jobId, {$set: {address: address}});
    }
});

if (Meteor.isServer) {
    Meteor.startup(function () {
        // code to run on server at startup
    });
}
