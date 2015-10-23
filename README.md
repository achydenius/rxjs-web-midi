# RxJS bindings for Web MIDI API

Allows accessing [Web MIDI API](https://webaudio.github.io/web-midi-api/) events as observable sequences.

## API

The bindings module provides following functions:

### statechangeAsObservable(MIDIAccess)

Returns an observable sequence of [MIDIConnectionEvent](https://webaudio.github.io/web-midi-api/#MIDIConnectionEvent) objects. [MIDIAccess](https://webaudio.github.io/web-midi-api/#MIDIAccess) object is to be given as an argument.

### midimessageAsObservable(MIDIInput)

Returns an observable sequence of [MIDIMessageEvent](https://webaudio.github.io/web-midi-api/#MIDIMessageEvent) objects. [MIDIInput](https://webaudio.github.io/web-midi-api/#MIDIInput) object is to be given as an argument.

## Example usage

```
import Rx from 'rx';
import { midimessageAsObservable } from 'rxjs-web-midi';

Rx.Observable.fromPromise(navigator.requestMIDIAccess())
    .map((midi) => {
        // Select first available input
        return midi.inputs.values().next().value;
    })
    .flatMap((input) => {
        // Get stream of messages
        return midimessageAsObservable(input);
    })
    .subscribe((message) => {
        // Output the message
        console.log(message);
    });
```

A more complete example program is included and can be built with `npm run build:example`.
