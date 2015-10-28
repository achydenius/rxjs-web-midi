import Rx from 'rx';

export function midimessageAsObservable(input) {
    return createObservable(input, 'onmidimessage');
}

export function statechangeAsObservable(midi) {
    return createObservable(midi, 'onstatechange');
}

function createObservable(object, handlerName) {
    return Rx.Observable.create(observer => {
        if (object.observers === undefined) {
            object.observers = [];
            object[handlerName] = function(event) {
                object.observers.forEach(observer => {
                    observer.onNext(event);
                });
            }
        }

        object.observers.push(observer);

        return Rx.Disposable.create(() => {
            object.observers = object.observers.filter(x => x !== observer);
        });
    });
}
