
function panToJob(jobId) {
    var job = JobsCollection.findOne(jobId);
    GoogleMaps.maps.map.instance.setCenter({lat: job.lat, lng: job.lng});
}

if (Meteor.isClient) {
    Meteor.startup(function () {
        GoogleMaps.load();
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
}

if (Meteor.isServer) {
    Meteor.startup(function () {
        // code to run on server at startup
    });
}
