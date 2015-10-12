import Rx from 'rx';

export function initMidiAccess() {
    if (navigator.requestMIDIAccess) {
        return Rx.Observable.fromPromise(navigator.requestMIDIAccess());
    } else {
        return Rx.Observable.throw(new Error('navigator.requestMIDIAccess is not defined'));
    }
}

export function initMidiOutput() {
    return initMidiAccess()
        .map((midiAccess) => {
            if (midiAccess.outputs.size < 1) {
                throw new Error('No outputs available');
            }
            return midiAccess.outputs.values().next().value;
        });
}

export function initMidiInput() {
    return initMidiAccess()
        .do((midiAccess) => {
            // Augment available inputs with message stream getter
            midiAccess.inputs.forEach((input) => {
                input.messagesAsObservable = function() {
                    return createInputObservable(input);
                };
            });
        });
}

function createInputObservable(input) {
    return Rx.Observable.create((observer) => {
        if (input.observers === undefined) {
            input.observers = [];
            input.onmidimessage = function(event) {
                input.observers.forEach((observer) => {
                    observer.onNext(event);
                });
            }
        }

        input.observers.push(observer);

        return Rx.Disposable.create(() => {
            input.observers = input.observers.filter((x) => {
                return x !== observer;
            });
        });
    });
}
