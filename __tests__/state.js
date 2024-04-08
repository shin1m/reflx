import {State} from '../state';
import {jest} from '@jest/globals';

describe('on', () => {
  test('adds an observer', () => {
    const state = new State('foo');
    const observer = jest.fn();
    state.on(observer);
    state.value = 'bar';
    expect(observer).toHaveBeenCalledTimes(1);
  });
  test('returns unobserve', () => {
    const state = new State('foo');
    const observer = jest.fn();
    state.on(observer)();
    state.value = 'bar';
    expect(observer).not.toHaveBeenCalled();
  });
});

describe('set value', () => {
  test('emits observers when the value has changed', () => {
    const state = new State('foo');
    const observer = jest.fn();
    state.on(observer);
    expect(observer).not.toHaveBeenCalled();
    state.value = 'bar';
    expect(observer).toHaveBeenCalledTimes(1);
  });
  test('does not emit observers when the value has not changed', () => {
    const state = new State('foo');
    const observer = jest.fn();
    state.on(observer);
    expect(observer).not.toHaveBeenCalled();
    state.value = 'foo';
    expect(observer).not.toHaveBeenCalled();
  });
});
