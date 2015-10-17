import Rx from 'rx';
import { midimessageAsObservable } from '../lib/rxjs-web-midi';

// Get first available MIDI input
const input = Rx.Observable.fromPromise(navigator.requestMIDIAccess())
    .map((midi) => {
        return midi.inputs.values().next().value;
    });

// Get stream of messages from the input
const messages = input
    .filter((input) => {
        return input !== undefined;
    })
    .flatMap((input) => {
        return midimessageAsObservable(input);
    })
    .map((x) => {
        // Collect relevant data from the message
        // See for example http://www.midi.org/techspecs/midimessages.php
        return {
            status: x.data[0] & 0xf0,
            data: [
                x.data[1],
                x.data[2]
            ]
        };
    });

// Get stream of note on messages
const notes = messages
    .filter((x) => {
        return x.status === 144;
    });

// Get stream of control change messages
const controls = messages
    .filter((x) => {
        return x.status === 176;
    });

input.subscribe((input) => {
    if (input !== undefined) {
        console.log('id: ' + input.id);
        console.log('name: ' + input.name);
        console.log('manufacturer: ' + input.manufacturer);
    } else {
        console.log('No inputs available');
    }
});

notes.subscribe((x) => {
    const note = x.data[0];
    const velocity = x.data[1];
    console.log(`Note ${note} triggered with velocity ${velocity}`);
});

controls.subscribe((x) => {
    const index = x.data[0];
    const value = x.data[1];
    console.log(`Control ${index} changed with value ${value}`);
});
