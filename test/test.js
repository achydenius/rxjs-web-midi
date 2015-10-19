import assert from 'assert';
import { midimessageAsObservable, statechangeAsObservable } from '../lib/rxjs-web-midi'; 
import Rx from 'rx';

const midiAccessMock = {
    statechange: function(data) {
        this.onstatechange(data);
    }
};

const midiInputMock = {
    midimessage: function(data) {
        this.onmidimessage(data);
    }
};

describe('statechangeAsObservable', () => {
    it('should return an Observable', () => {
        assert(statechangeAsObservable(midiAccessMock) instanceof Rx.Observable);
    });
});

describe('midimessageAsObservable', () => {
    it('should return an Observable', () => {
        assert(midimessageAsObservable(midiInputMock) instanceof Rx.Observable);
    })
});
