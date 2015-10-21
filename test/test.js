import assert from 'assert';
import { midimessageAsObservable, statechangeAsObservable } from '../lib/rxjs-web-midi'; 
import Rx from 'rx';

function createMidiAccessMock() {
    return {
        statechange: function(data) {
            this.onstatechange(data);
        }
    };
};

function createMidiInputMock() {
    return {
        midimessage: function(data) {
            this.onmidimessage(data);
        }
    };
};

describe('statechangeAsObservable', () => {
    it('should return an Observable', () => {
        assert(statechangeAsObservable(createMidiAccessMock()) instanceof Rx.Observable);
    });

    it('should send messages to multiple subscribers', () => {
        const midi = createMidiAccessMock();
        const scheduler = new Rx.TestScheduler();
        const observers = [
            scheduler.createObserver(),
            scheduler.createObserver()
        ];
        const observable = statechangeAsObservable(midi);

        scheduler.scheduleAbsolute(0, () => {
            observable.subscribe(observers[0]);
            observable.subscribe(observers[1]);
        });
        scheduler.scheduleAbsolute(50, () => {
            midi.statechange(1);
        });
        scheduler.scheduleAbsolute(100, () => {
            midi.statechange(2);
        });
        scheduler.start();

        const expected = [
            Rx.ReactiveTest.onNext(50, 1),
            Rx.ReactiveTest.onNext(100, 2)
        ];

        assert.deepEqual(expected, observers[0].messages);
        assert.deepEqual(expected, observers[1].messages);
    });

    it('should stop sending messages to disposed subscribers', () => {
        const midi = createMidiAccessMock();
        const scheduler = new Rx.TestScheduler();
        const observers = [
            scheduler.createObserver(),
            scheduler.createObserver()
        ];
        const observable = statechangeAsObservable(midi);
        const subscriptions = [];

        scheduler.scheduleAbsolute(0, () => {
            subscriptions[0] = observable.subscribe(observers[0]);
            subscriptions[1] = observable.subscribe(observers[1]);
        });
        scheduler.scheduleAbsolute(50, () => {
            midi.statechange(1);
        });
        scheduler.scheduleAbsolute(100, () => {
            subscriptions[0].dispose();
        });
        scheduler.scheduleAbsolute(150, () => {
            midi.statechange(2);
        });
        scheduler.start();

        const expectedFirst = [
            Rx.ReactiveTest.onNext(50, 1)
        ];
        const expectedSecond = [
            Rx.ReactiveTest.onNext(50, 1),
            Rx.ReactiveTest.onNext(150, 2)
        ];

        assert.deepEqual(expectedFirst, observers[0].messages);
        assert.deepEqual(expectedSecond, observers[1].messages);
    });
});

describe('midimessageAsObservable', () => {
    it('should return an Observable', () => {
        assert(midimessageAsObservable(createMidiInputMock()) instanceof Rx.Observable);
    })
});
