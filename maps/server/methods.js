
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