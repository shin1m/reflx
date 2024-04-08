/**
 * @jest-environment jsdom
 */

import {$add, $tags, $use, $dispose, $for} from '../index';
import {jest} from '@jest/globals';

jest.useFakeTimers();

describe('$add', () => {
  test('returns the parent', () => {
    const root = document.createElement('div');
    expect($add(root)).toBe(root);
  });
  test('does nothing for undefined/null', () => {
    const root = document.createElement('div');
    $add(root, undefined, null);
    expect(root.innerHTML).toBe('');
  });
  describe('sets each key/value pair to the parent for an object literal', () => {
    test('as a property if it exists', () => {
      const root = document.createElement('div');
      $add(root, {className: 'foo', id: 'bar'});
      expect(root.classList.contains('foo')).toBe(true);
      expect(root.id).toBe('bar');
    });
    test('as an attribute otherwise', () => {
      const root = document.createElement('div');
      $add(root, {class: 'foo', 'data-foo': 'bar'});
      expect(root.classList.contains('foo')).toBe(true);
      expect(root.dataset.foo).toBe('bar');
    });
  });
  test('adds dom nodes as they are', () => {
    const root = document.createElement('div');
    const node = document.createElement('div');
    $add(root, node);
    expect(root.firstChild).toBe(node);
  });
  test('adds primitives as text nodes', () => {
    const root = document.createElement('div');
    $add(root, true, 0, 'foo', 0.5);
    expect(root.innerHTML).toBe('true0foo0.5');
  });
  test('creates a reactive block for a function', () => {
    const root = document.createElement('div');
    $add(root, () => {});
    expect(root.innerHTML).toBe('<!----><!---->');
  });
  test('recursively iterates arrays', () => {
    const root = document.createElement('div');
    $add(root, ['a', ['b', 'c'], 'd']);
    expect(root.innerHTML).toBe('abcd');
  });
});

const newSlot = () => ({
  observers: new Set(),
  on(x) {
    this.observers.add(x);
    return () => this.observers.delete(x);
  },
  emit() {
    for (const x of this.observers) x();
  }
});

describe('reactive block', () => {
  test('runs in a microtask', () => {
    const f = jest.fn();
    $add(document.createElement('div'), f);
    expect(f).not.toHaveBeenCalled();
    jest.runOnlyPendingTimers();
    expect(f).toHaveBeenCalledTimes(1);
  });
  test('passes the parent', () => {
    const f = jest.fn();
    const e = $tags.div(f);
    $add(document.createElement('div'), e);
    jest.runOnlyPendingTimers();
    expect(f).toHaveBeenCalledWith(e);
  });
  test('replaces the content', () => {
    const slot = newSlot();
    slot.value = 'foo';
    const root = document.createElement('div');
    $add(root, () => $use(slot).value);
    expect(root.innerHTML).toBe('<!----><!---->');
    jest.runOnlyPendingTimers();
    expect(root.innerHTML).toBe('<!---->foo<!---->');
    slot.value = 'bar';
    slot.emit();
    jest.runOnlyPendingTimers();
    expect(root.innerHTML).toBe('<!---->bar<!---->');
  });
  test('runs each time after update', () => {
    const slot = newSlot();
    const f = jest.fn(() => $use(slot));
    $add(document.createElement('div'), f);
    expect(f).not.toHaveBeenCalled();
    jest.runOnlyPendingTimers();
    expect(f).toHaveBeenCalledTimes(1);
    slot.emit();
    jest.runOnlyPendingTimers();
    expect(f).toHaveBeenCalledTimes(2);
    slot.emit();
    jest.runOnlyPendingTimers();
    expect(f).toHaveBeenCalledTimes(3);
  });
  test('runs once for multiple updates in an event cycle', () => {
    const slot = newSlot();
    const f = jest.fn(() => $use(slot));
    $add(document.createElement('div'), f);
    jest.runOnlyPendingTimers();
    expect(f).toHaveBeenCalledTimes(1);
    slot.emit();
    slot.emit();
    jest.runOnlyPendingTimers();
    expect(f).toHaveBeenCalledTimes(2);
  });
  test('runs in the order of depth', () => {
    const slot = newSlot();
    const calls = [];
    $add(document.createElement('div'), () => {
      calls.push(0);
      $use(slot);
      return () => {
        calls.push(1);
        $use(slot);
      };
    });
    jest.runOnlyPendingTimers();
    expect(calls).toEqual([0, 1]);
    for (const x of [...slot.observers].toReversed()) x();
    jest.runOnlyPendingTimers();
    expect(calls).toEqual([0, 1, 0, 1]);
  });
  test('disposes removed reactive blocks', () => {
    const f = jest.fn();
    const g = jest.fn();
    const slot = newSlot();
    $add(document.createElement('div'), jest.fn().mockImplementationOnce(() => {
      $use(slot);
      return [() => $dispose(f), $for(null, () => $dispose(g))];
    }));
    jest.runOnlyPendingTimers();
    slot.emit();
    expect(f).not.toHaveBeenCalled();
    expect(g).not.toHaveBeenCalled();
    jest.runOnlyPendingTimers();
    expect(f).toHaveBeenCalledTimes(1);
    expect(g).toHaveBeenCalledTimes(1);
  });
});

describe('$use', () => {
  test('does nothing outside of reactive blocks', () => {
    const on = jest.fn();
    const slot = {on};
    expect($use(slot)).toBe(slot);
    expect(on).not.toHaveBeenCalled();
  });
  test('observes a slot for a reactive block', () => {
    const on = jest.fn(x => expect(typeof x).toBe('function'));
    const slot = {on};
    const f = jest.fn(() => expect($use(slot)).toBe(slot));
    $add(document.createElement('div'), f);
    jest.runOnlyPendingTimers();
    expect(f).toHaveBeenCalledTimes(1);
    expect(on).toHaveBeenCalledTimes(1);
  });
  test('receives a function which is called on unobserve', () => {
    const slot = newSlot();
    const off = jest.spyOn(slot.observers, 'delete');
    const f = () => $use(slot);
    $add(document.createElement('div'), jest.fn()
      .mockImplementationOnce(f)
      .mockImplementationOnce(f)
    );
    jest.runOnlyPendingTimers();
    slot.emit();
    expect(off).toHaveBeenCalledTimes(0);
    expect(slot.observers.size).toBe(1);
    jest.runOnlyPendingTimers();
    expect(off).toHaveBeenCalledTimes(1);
    expect(slot.observers.size).toBe(1);
    slot.emit();
    expect(off).toHaveBeenCalledTimes(1);
    expect(slot.observers.size).toBe(1);
    jest.runOnlyPendingTimers();
    expect(off).toHaveBeenCalledTimes(2);
    expect(slot.observers.size).toBe(0);
  });
});

describe('$dispose', () => {
  test('runs a function on disposal', () => {
    const f = jest.fn();
    const slot = newSlot();
    $add(document.createElement('div'), () => {
      $dispose(f);
      $use(slot);
    });
    jest.runOnlyPendingTimers();
    slot.emit();
    expect(f).not.toHaveBeenCalled();
    jest.runOnlyPendingTimers();
    expect(f).toHaveBeenCalledTimes(1);
    slot.emit();
    expect(f).toHaveBeenCalledTimes(1);
    jest.runOnlyPendingTimers();
    expect(f).toHaveBeenCalledTimes(2);
  });
});

describe('$for', () => {
  test('preserves the content for the key', () => {
    const slot = newSlot();
    const f = jest.fn(() => 'foo');
    const g = jest.fn(() => $for($use(slot), f));
    const root = document.createElement('div');
    $add(root, g);
    jest.runOnlyPendingTimers();
    expect(root.innerHTML).toBe('<!----><!---->foo<!----><!---->');
    slot.emit();
    jest.runOnlyPendingTimers();
    expect(f).toHaveBeenCalledTimes(1);
    expect(g).toHaveBeenCalledTimes(2);
    expect(root.innerHTML).toBe('<!----><!---->foo<!----><!---->');
  });
  test('moves the content for the key', () => {
    const slot = newSlot();
    slot.value = [false, true];
    const f = jest.fn(() => 'foo');
    const g = jest.fn(() => 'bar');
    const root = document.createElement('div');
    $add(root, () => $use(slot).value.map(x => $for(x, x ? g : f)));
    jest.runOnlyPendingTimers();
    expect(root.innerHTML).toBe('<!----><!---->foo<!----><!---->bar<!----><!---->');
    slot.value = [true, false];
    slot.emit();
    jest.runOnlyPendingTimers();
    expect(f).toHaveBeenCalledTimes(1);
    expect(g).toHaveBeenCalledTimes(1);
    expect(root.innerHTML).toBe('<!----><!---->bar<!----><!---->foo<!----><!---->');
  });
});

describe('$tags', () => {
  test('creates element factories', () => {
    const {div, span} = $tags;
    expect(div(
      span('foo'),
      span('bar')
    ).outerHTML).toBe([
      '<div>',
        '<span>foo</span>',
        '<span>bar</span>',
      '</div>'
    ].join(''));
  });
  test('creates an elements factory for a uri', () => {
    const {svg, path} = $tags('http://www.w3.org/2000/svg');
    const e = svg(path());
    expect(e.outerHTML).toBe([
      '<svg>',
        '<path></path>',
      '</svg>'
    ].join(''));
    expect(e.namespaceURI).toBe('http://www.w3.org/2000/svg');
  });
});

describe('senarios', () => {
  class State {
    observers = new Set();
    #value;

    constructor(value) {
      this.#value = value;
    }
    on(x) {
      this.observers.add(x);
      return () => this.observers.delete(x);
    }
    get value() {
      return $use(this).#value;
    }
    set value(value) {
      if (value === this.#value) return;
      this.#value = value;
      for (const x of this.observers) x();
    }
  }
  const {div, span} = $tags;
  test('root', () => {
    const state = new State('foo');
    let serial = 0;
    const root = document.createElement('div');
    $add(root, span(() => [++serial, state.value]));
    jest.runOnlyPendingTimers();
    expect(root.innerHTML).toBe([
      '<span>',
        '<!---->1',
          'foo',
        '<!---->',
      '</span>'
    ].join(''));
    expect(state.observers.size).toBe(1);
    state.value = 'bar';
    jest.runOnlyPendingTimers();
    expect(root.innerHTML).toBe([
      '<span>',
        '<!---->2',
          'bar',
        '<!---->',
      '</span>'
    ].join(''));
    expect(state.observers.size).toBe(1);
  });
  test('child', () => {
    const state = new State('foo');
    let serial = 0;
    const root = document.createElement('div');
    $add(root, div(() => [++serial, span(() => [++serial, state.value])]));
    jest.runOnlyPendingTimers();
    expect(root.innerHTML).toBe([
      '<div>',
        '<!---->1',
          '<span>',
            '<!---->2',
              'foo',
            '<!---->',
          '</span>',
        '<!---->',
      '</div>'
    ].join(''));
    expect(state.observers.size).toBe(1);
    state.value = 'bar';
    jest.runOnlyPendingTimers();
    expect(root.innerHTML).toBe([
      '<div>',
        '<!---->1',
          '<span>',
            '<!---->3',
              'bar',
            '<!---->',
          '</span>',
        '<!---->',
      '</div>'
    ].join(''));
    expect(state.observers.size).toBe(1);
  });
  test('conditional', () => {
    const visible = new State(true);
    const text = new State('foo');
    let serial = 0;
    const root = document.createElement('div');
    $add(root, () => [++serial,
      visible.value ? span(() => [++serial, text.value]) : null
    ]);
    jest.runOnlyPendingTimers();
    expect(root.innerHTML).toBe([
      '<!---->1',
        '<span>',
          '<!---->2',
            'foo',
          '<!---->',
        '</span>',
      '<!---->'
    ].join(''));
    expect(visible.observers.size).toBe(1);
    expect(text.observers.size).toBe(1);
    text.value = 'bar';
    jest.runOnlyPendingTimers();
    expect(root.innerHTML).toBe([
      '<!---->1',
        '<span>',
          '<!---->3',
            'bar',
          '<!---->',
        '</span>',
      '<!---->'
    ].join(''));
    expect(visible.observers.size).toBe(1);
    expect(text.observers.size).toBe(1);
    visible.value = false;
    jest.runOnlyPendingTimers();
    expect(root.innerHTML).toBe([
      '<!---->4',
      '<!---->'
    ].join(''));
    expect(visible.observers.size).toBe(1);
    expect(text.observers.size).toBe(0);
  });
  test('reorder', () => {
    const foo = new State('foo');
    const bar = new State('bar');
    const list = new State([foo, bar]);
    let serial = 0;
    const root = document.createElement('div');
    $add(root, () => [++serial,
      list.value.map(x => $for(x, () => [++serial, span(x.value)]))
    ]);
    jest.runOnlyPendingTimers();
    expect(root.innerHTML).toBe([
      '<!---->1',
        '<!---->2',
          '<span>foo</span>',
        '<!---->',
        '<!---->3',
          '<span>bar</span>',
        '<!---->',
      '<!---->'
    ].join(''));
    expect(list.observers.size).toBe(1);
    expect(foo.observers.size).toBe(1);
    expect(bar.observers.size).toBe(1);
    const child = root.querySelector('span:first-child');
    expect(child.textContent).toBe('foo');
    const zot = new State('zot');
    list.value = [zot, foo];
    jest.runOnlyPendingTimers();
    expect(root.innerHTML).toBe([
      '<!---->4',
        '<!---->5',
          '<span>zot</span>',
        '<!---->',
        '<!---->2',
          '<span>foo</span>',
        '<!---->',
      '<!---->'
    ].join(''));
    expect(list.observers.size).toBe(1);
    expect(foo.observers.size).toBe(1);
    expect(bar.observers.size).toBe(0);
    expect(zot.observers.size).toBe(1);
    expect(root.querySelector('span:last-child')).toBe(child);
  });
  test('dispose', () => {
    const visible = new State(true);
    const count = new State(0);
    let disposed = 0;
    const root = document.createElement('div');
    $add(root, () => {
      if (!visible.value) return null;
      const timer = setInterval(() => ++count.value, 1000);
      $dispose(() => {
        clearInterval(timer);
        ++disposed;
      });
      return span(() => count.value);
    });
    jest.runOnlyPendingTimers();
    expect(root.innerHTML).toBe([
      '<!---->',
        '<span>',
          '<!---->',
            '0',
          '<!---->',
        '</span>',
      '<!---->'
    ].join(''));
    jest.runOnlyPendingTimers();
    expect(root.innerHTML).toBe([
      '<!---->',
        '<span>',
          '<!---->',
            '1',
          '<!---->',
        '</span>',
      '<!---->'
    ].join(''));
    jest.runOnlyPendingTimers();
    expect(root.innerHTML).toBe([
      '<!---->',
        '<span>',
          '<!---->',
            '2',
          '<!---->',
        '</span>',
      '<!---->'
    ].join(''));
    expect(disposed).toBe(0);
    visible.value = false;
    jest.runOnlyPendingTimers();
    expect(root.innerHTML).toBe([
      '<!---->',
      '<!---->'
    ].join(''));
    expect(disposed).toBe(1);
    expect(visible.observers.size).toBe(1);
    expect(count.observers.size).toBe(0);
  });
});
