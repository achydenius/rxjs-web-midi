# RxJS bindings for Web MIDI API

Allows accessing [Web MIDI API](https://webaudio.github.io/web-midi-api/) message events as an observable sequence.

## How to use

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

An example program is included and can be built with `npm run build:example`.
