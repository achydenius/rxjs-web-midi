import { initMidiInput } from '../lib/rxjs-web-midi';

// Get stream of messages from first MIDI input
const input = initMidiInput()
    .flatMap((midi) => {
        // Select first available input
        const input = midi.inputs.values().next().value;
        return input.messagesAsObservable();
    })
    .map((x) => {
        // Collect relevant data from the message
        return {
            status: x.data[0] & 0xf0,
            data: [
                x.data[1],
                x.data[2]
            ]
        };
    });

// Get stream of note on messages
const notes = input
    .filter((x) => {
        return x.status === 144;
    });

// Get stream of control change messages
const controls = input
    .filter((x) => {
        return x.status === 176;
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
