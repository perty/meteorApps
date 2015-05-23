
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
