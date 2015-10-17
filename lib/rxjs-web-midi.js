import Rx from 'rx';

export function midimessageAsObservable(input) {
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

export function statechangeAsObservable(midi) {
    return Rx.Observable.create((observer) => {
        if (midi.observers === undefined) {
            midi.observers = [];
            midi.onstatechange = function(event) {
                midi.observers.forEach((observer) => {
                    observer.onNext(event);
                });
            }
        }

        midi.observers.push(observer);

        return Rx.Disposable.create(() => {
            midi.observers = midi.observers.filter((x) => {
                return x !== observer;
            });
        });
    });
}
