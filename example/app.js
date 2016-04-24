import Rx from 'rx';
import { midimessageAsObservable, statechangeAsObservable } from '../lib/rxjs-web-midi';

// MIDIAccess object
const midiAccess = Rx.Observable.fromPromise(navigator.requestMIDIAccess());

// Stream of state change events
const stateStream = midiAccess.flatMap(access => statechangeAsObservable(access));

// First available MIDI input
const inputStream = midiAccess.map(access => access.inputs.values().next().value);

// Stream of messages from the input
const messages = inputStream
  .filter(input => input !== undefined)
  .flatMap(input => midimessageAsObservable(input))
  .map(message => ({
    // Collect relevant data from the message
    // See for example http://www.midi.org/techspecs/midimessages.php
    status: message.data[0] & 0xf0,
    data: [
      message.data[1],
      message.data[2],
    ],
  }));

// Stream of note on messages
const notes = messages.filter(message => message.status === 144);

// Stream of control change messages
const controls = messages.filter(message => message.status === 176);

stateStream.subscribe(state => {
  console.log(state);
});

inputStream.subscribe(input => {
  if (input !== undefined) {
    console.log(`id: ${input.id}`);
    console.log(`name: ${input.name}`);
    console.log(`manufacturer: ${input.manufacturer}`);
  } else {
    console.log('No inputs available');
  }
});

notes.subscribe(message => {
  console.log(`Note ${message.data[0]} triggered with velocity ${message.data[1]}`);
});

controls.subscribe(message => {
  console.log(`Control ${message.data[0]} changed with value ${message.data[1]}`);
});
