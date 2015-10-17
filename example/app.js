import Rx from 'rx';
import { midimessageAsObservable, statechangeAsObservable } from '../lib/rxjs-web-midi';

// MIDIAccess object
const midi = Rx.Observable.fromPromise(navigator.requestMIDIAccess());

// Sream of state change events
const state = midi.flatMap((midi) => {
    return statechangeAsObservable(midi);
});

// First available MIDI input
const input = midi.map((midi) => {
    return midi.inputs.values().next().value;
});

// Stream of messages from the input
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

// Stream of note on messages
const notes = messages.filter((x) => {
    return x.status === 144;
});

// Stream of control change messages
const controls = messages.filter((x) => {
    return x.status === 176;
});

state.subscribe((state) => {
    console.log(state);
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
