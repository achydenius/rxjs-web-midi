import Rx from 'rx';

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
        .flatMap((midiAccess) => {
            return createInputObservable(midiAccess);
        });
}

export function initMidiAccess() {
    if (navigator.requestMIDIAccess) {
        return Rx.Observable.fromPromise(navigator.requestMIDIAccess());
    } else {
        return Rx.Observable.throw(new Error('navigator.requestMIDIAccess is not defined'));
    }
}

function createInputObservable(midiAccess) {
    return Rx.Observable.create((observer) => {
        if (midiAccess.inputs.size > 0) {
            // Get first MIDI input
            const input = midiAccess.inputs.values().next().value;

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

        } else {
            observer.onError('No inputs available');
        }
    });
}
