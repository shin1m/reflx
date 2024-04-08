# reflx

reflx is a small library for adding reactivity to the DOM.

The DOM composition is heavily inspired by VanJS:

    import {$add, $tags} from 'reflx';
    const {div, h2, a} = $tags;
    $add(document.body,
      h2('Hello, reflx!'),
      div({class: 'hello'},
        'Go to ',
        a({href: 'https://github.com/shin1m/reflx'}, 'reflx'),
        '.'
      )
    );

`$add` adds DOM elements to the parent.
`$tags` is the proxy object with dynamic properties.
A dynamic property of `$tags` returns a function.
The function creates a new DOM element using the property name as the tag name.
Let's call it an element creator.
It also adds/applies its arguments to the element:
- Primitives are added as text nodes.
- DOM nodes are added as they are.
- For an object literal, each key/value pair is set to the element as a property if it exists or as an attribute otherwise.

Reactivity is enabled by passing functions to `$add` or element creators:

    import {State} from 'reflx/state';
    const count = new State(0);
    $add(document.body,
      div('Count: ', () => count.value),
      div(
        button({onclick: () => ++count.value}, '+1'),
        button({onclick: () => count.value = 0}, 'Reset')
      )
    );

`() => count.value` is a reactive function which runs everytime after `count.value` has changed.
The content returned by the function is added/applied to the parent element as for `$add`.
Event handlers are pure callbacks not reactive functions.

## Reactive Blocks

For a function passed to `$add` or element creators, reflx creates an internal object which does several things:
- Runs the function in a microtask.
- Places the content returned by the function removing the old one if any.
- Observes dependencies used by the function.
- Schedule to run the function again if any of the dependencies are changed.

Let's call the object a reactive block.

Reactive blocks can be nested:

    const parent = new State(0);
    const child = new State(0);
    let serial = 0;
    $add(document.body,
      div('Parent: ', () => [`[${++serial}]{`, parent.value,
        ' Child: ', () => [`[${++serial}]{`, child.value, '}'],
      '}']),
      div(
        button({onclick: () => ++parent.value}, 'Parent +1'),
        button({onclick: () => ++child.value}, 'Child +1')
      )
    );

`[`[${++serial}]{`, ..., '}']` is just for seeing how reactive functions run.
When 'Parent +1' is clicked, both the parent and the child reactive blocks run.
When 'Child +1' is clicked, only the child reactive block runs.

Normally, nested reactive blocks are destroyed and created again from scratch whenever their parents run.
They can be preserved by using `$for`:

    const items = new State([new State(0), new State(0)]);
    let serial = 0;
    $add(document.body,
      div(() => [`[${++serial}]{`,
        items.value.map(x => $for(x, () => [`[${++serial}]{`,
          button({onclick: () => ++x.value}, `Clicked: ${x.value}`),
        '}'])),
      '}']),
      button({onclick: () => items.value = items.value.toReversed()}, 'Flip')
    );

`$for(x, () => ...)` reuses the reactive block for `x` if it already exists in the parent reactive block.
When 'Flip' is clicked, the items are fliped but their reactive blocks do not run.

## Dispose Things

Reactive blocks can have functions for disposal:

    const blink = new State(false);
    $add(document.body,
      div($ => {
        $.classList.toggle('blink', blink.value);
        if (blink.value) {
          const id = setInterval(() => $.classList.toggle('on'), 500);
          $dispose(() => {
            console.log('dispose', id);
            clearInterval(id);
          });
        }
      }, 'Hello, World!'),
      button({
        onclick: () => blink.value = !blink.value
      }, () => blink.value ? 'Stop' : 'Start')
    );

A function passed to `$dispose` is called when the current content of the reactive block is disposed.
`$` in `$ => { ... }` is the `div` element since reflx passes the parent element to a reactive function.

## Namespace URI

By specifying a namespace URI, `$tags` returns a proxy object for the namespace URI.

    const {svg, path} = $tags('http://www.w3.org/2000/svg');
    $add(document.body,
      svg({viewBox: '0 0 100 20'},
        path({d: 'M 25,5 C 50,5 50,15 75,15'})
      )
    );

## Observable

`State` is a reference implementation of reflx's `Observable`.
Any objects which implement `Observable` can be used as dependencies of reactive blocks:

    import {$add, $tags, $use} from 'reflx';
    const {div, button} = $tags;
    const observers = new Set();
    const state = {
      on(x) {
        observers.add(x);
        return () => observers.delete(x);
      },
      count: 0
    };
    $add(document.body,
      div('Count: ', () => $use(state).count),
      div(button({onclick: () => {
        ++state.count;
        for (const x of observers) x();
      }}, '+1'))
    );

`$use` in `() => $use(state).count` declares `state` as a dependency of the reactive block.

## Examples

TBD

## API Reference

See [API](API.md).

## License

The MIT License (MIT)

Copyright (c) Shin-ichi MORITA

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.  IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
