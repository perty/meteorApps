JobsCollection = new Mongo.Collection('markers');
DeletedJobs = new Mongo.Collection('deletedJobs');

function panToJob(jobId) {
    var job = JobsCollection.findOne(jobId);
    GoogleMaps.maps.map.instance.setCenter({lat: job.lat, lng: job.lng});
}
function panToJobDeleted(jobId) {
    var job = DeletedJobs.findOne(jobId);
    GoogleMaps.maps.map.instance.setCenter({lat: job.lat, lng: job.lng});
}

function popitup(jobId) {
    var job = JobsCollection.findOne(jobId);
    var popUp = document.getElementById("thePopUp");
    var popUpButton = document.getElementById("popUpButton");
    $(popUp).html("<p>" + job.description + "</p><p>" + job.address + "<p>");
    $(popUpButton).click();
}

if (Meteor.isClient) {
    Meteor.startup(function () {
        GoogleMaps.load();
    });

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
            google.maps.event.addListener(map.instance, 'click', function (event) {
                // Meteor.call("addJob", event.latLng.lat(), event.latLng.lng());
            });

            var markers = {};

            JobsCollection.find().observe({
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

    Meteor.subscribe("jobs");
    Template.jobPanel.helpers({
        jobs: function () {
            return JobsCollection.find({}, {sort: {nr: 1}});
        }
    });
    Template.planningPanel.helpers({
        jobs: function () {
            return JobsCollection.find({}, {sort: {nr: 1}});
        }
    });
    Template.deletedJobs.helpers({
        jobs: function () {
            return DeletedJobs.find({}, {sort: {deletedDate: -1}})
        }
    });

    Template.body.events({
        "click #mypos": function () {
            if (navigator.geolocation) {
                var currentPosition = new google.maps.Marker({
                    icon: 'http://google.com/mapfiles/arrow.png',
                    title: 'Du är här',
                    map: GoogleMaps.maps.map.instance,
                    id: 'currentPos'
                });
                navigator.geolocation.getCurrentPosition(function (pos) {
                    GoogleMaps.maps.map.instance.setCenter({lat: pos.coords.latitude, lng: pos.coords.longitude});
                });
                navigator.geolocation.watchPosition(function (pos) {
                    currentPosition.setPosition({lat: pos.coords.latitude, lng: pos.coords.longitude});
                });
            } else {
                var x = document.getElementById("mypos");
                x.innerHTML = "Stöds inte av din webbläsare";
            }
        }
    });

    Template.jobLine.events({
        "click .panTo": function () {
            panToJob(this._id);
        },
        "click .status": function () {
            Meteor.call("statusClick", this._id, this.status);
        }
    });

    Template.planningLine.events({
        "click .delete": function () {
            Meteor.call("deleteJob", this._id);
        },
        "click .panTo": function () {
            panToJob(this._id);
        },
        "blur .nr": function (event) {
            var nr = event.target.value;
            Meteor.call("setNr", this._id, nr);
        },
        "blur .address": function (event) {
            var address = event.target.value;
            Meteor.call("setAddress", this._id, address);
        },
        "blur .description": function (event) {
            var description = event.target.value;
            Meteor.call("setDescription", this._id, description);
        },
        "click .status": function () {
            Meteor.call("statusClick", this._id, this.status);
        }
    });

    Template.deletedJobLine.events({
        "click .panTo": function () {
            panToJobDeleted(this._id);
        },
        "click .restore": function () {
            Meteor.call("restoreJob", this._id);
        }
    })

}

Meteor.methods({
    deleteJob: function (jobId) {
        var job = JobsCollection.findOne(jobId);
        if (job !== undefined) {
            job.deletedDate = new Date();
            DeletedJobs.insert(job);
            JobsCollection.remove(jobId);
        }
    },
    restoreJob: function (jobId) {
        var job = DeletedJobs.findOne(jobId);
        if (job !== undefined) {
            JobsCollection.insert(job);
            DeletedJobs.remove(jobId);
        }
    },
    addJob: function (lat, lng) {
        JobsCollection.insert({lat: lat, lng: lng, status: "nytt", nr: 0});
    },
    setNr: function (jobId, nr) {
        JobsCollection.update(jobId, {$set: {nr: nr}});
    },
    setAddress: function (jobId, address) {
        JobsCollection.update(jobId, {$set: {address: address}});
    },
    setDescription: function (jobId, description) {
        JobsCollection.update(jobId, {$set: {description: description}});
    },
    statusClick: function (jobId, currentStatus) {
        function nextStatus(currentStatus) {
            for (i = 0; i < statusList.length; i++) {
                if (statusList[i] == currentStatus) {
                    return statusList[i + 1 % statusList.length]
                }
            }
            return statusList[0];
        }

        newStatus = nextStatus(currentStatus);
        JobsCollection.update(jobId, {$set: {status: newStatus}})
    }
});
var statusList = ["förfrågan", "offererad", "accepterad", "påbörjat", "klart", "fakturerat"];

if (Meteor.isServer) {
    Meteor.startup(function () {
        // code to run on server at startup
    });
}
