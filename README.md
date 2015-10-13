# RxJS bindings for Web MIDI API

Allows accessing [Web MIDI API](https://webaudio.github.io/web-midi-api/) message events as an observable sequence. Current implementation augments *MIDIInput* object with *messagesAsObservable* method.

## How to use

```
initMidiInput()
    .map((midi) => {
        // Select first available input
        return midi.inputs.values().next().value;
    })
    .flatMap((input) => {
        // Get stream of messages
        return input.messagesAsObservable();
    })
    .subscribe((x) => {
        // Output the event
        console.log(x);
    });
```

An example program is included and can be built with `npm run build`.
