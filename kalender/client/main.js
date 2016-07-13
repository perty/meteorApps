import { Template } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';

import './main.html';

Template.hello.onCreated(function helloOnCreated() {
    // counter starts at 0
    this.counter = new ReactiveVar(0);
});

Template.hello.helpers({
    counter() {
        return Template.instance().counter.get();
    },
});

Template.hello.events({
    'click button'(event, instance) {
        // increment the counter when button is clicked
        instance.counter.set(instance.counter.get() + 1);
        document.getElementById("r0").childNodes[1].innerHTML = "CLICK"
    },
});

Template.weekdays.helpers(
    {
        wdays() {
            return ['M', 'T', 'O', 'T', 'F']
        }
    }
);

Template.kalendar.helpers(
    {
        kalendarRows() {
            return [
                [" ", 2, 3, 4, 5],
                [8, 9, 10, 11, 12]
            ]
        },
        wdays() {
            return [null, 'M', 'T', 'O', 'T', 'F', null]
        }
    }
)