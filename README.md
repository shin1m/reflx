# reflx

reflx is a small library for adding reactivity to the DOM.

The DOM composition is heavily inspired by VanJS:

```js
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
```
[Try on JSFiddle](https://jsfiddle.net/shin1m/6uw8svjf/)

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

```js
import {State} from 'reflx/state';
const count = new State(0);
$add(document.body,
  div('Count: ', () => count.value),
  div(
    button({onclick: () => ++count.value}, '+1'),
    button({onclick: () => count.value = 0}, 'Reset')
  )
);
```
[Try on JSFiddle](https://jsfiddle.net/shin1m/23kqfdrL/)

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

```js
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
```
[Try on JSFiddle](https://jsfiddle.net/shin1m/8yga5r4L/)

```[`[${++serial}]{`, ..., '}']``` is just for seeing how reactive functions run.
When 'Parent +1' is clicked, both the parent and the child reactive blocks run.
When 'Child +1' is clicked, only the child reactive block runs.

Normally, nested reactive blocks are destroyed and created again from scratch whenever their parents run.
They can be preserved by using `$for`:

```js
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
```
[Try on JSFiddle](https://jsfiddle.net/shin1m/f8pmqdr1/)

`$for(x, () => ...)` reuses the reactive block for `x` if it already exists in the parent reactive block.
When 'Flip' is clicked, the items are fliped but their reactive blocks do not run.

## Dispose Things

Reactive blocks can have functions for disposal:

```js
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
```
[Try on JSFiddle](https://jsfiddle.net/shin1m/zfertn21/)

A function passed to `$dispose` is called when the current content of the reactive block is disposed.
`$` in `$ => { ... }` is the `div` element since reflx passes the parent element to a reactive function.

## Namespace URI

By specifying a namespace URI, `$tags` returns a proxy object for the namespace URI.

```js
const {svg, path} = $tags('http://www.w3.org/2000/svg');
$add(document.body,
  svg({viewBox: '0 0 100 20'},
    path({d: 'M 25,5 C 50,5 50,15 75,15'})
  )
);
```
[Try on JSFiddle](https://jsfiddle.net/shin1m/usmfL25k/)

## Observable

`State` is a reference implementation of reflx's `Observable`.
Any objects which implement `Observable` can be used as dependencies of reactive blocks:

```js
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
```
[Try on JSFiddle](https://jsfiddle.net/shin1m/0guf4L3x/)

`$use` in `() => $use(state).count` declares `state` as a dependency of the reactive block.

## Examples

### Textarea and Content Editable

The contents of `textarea` and `contenteditable` must be handled differently:

```js
const text = new State('');
$add(document.body,
  textarea({
    oninput: e => text.value = e.target.value
  }, () => ({value: text.value}))
);
$add(document.body,
  (() => {
    const e = div({contenteditable: 'plaintext-only',
      oninput: () => text.value = e.textContent
    });
    return [e, () => {
      if (text.value !== e.textContent) e.textContent = text.value;
    }];
  })()
);
```
[Try on JSFiddle](https://jsfiddle.net/shin1m/f3og8a6p/)

Note that the content of `textarea` is specified as `value` property not as a text node.
This is because to avoid that the text composition session of `textarea` is reset by manipulating its child nodes.

Also note that the contenteditable `div` does not have any reactive blocks and is manipulated manually in a reactive block outside of it.
If a reactive block is created by passing a function to a contenteditable element, it failes to run after the content of the element is edited.
This is due to the following...
For a reactive block, reflx places a couple of comment nodes into its element.
The comment nodes are the anchors indicating the range that the reactive block manages.
If the element is contenteditable, they are removed by the browser while the content is edited.
Once this happens, the reactive block can not locate the range.

### Sort by Drag

The following example shows how to handle sizes and positions in reactive blocks:

```js
const items = new State([{}, {}, {}, {}, {}]);
$add(document.body,
  div({class: 'drag'}, $ => {
    const post = new State(null);
    const drag = (x, e) => {
      e.preventDefault();
      e.stopPropagation();
      const original = items.value;
      const index = original.indexOf(x);
      const row = $.children[index];
      $.setPointerCapture(e.pointerId);
      if (!$.hasPointerCapture(e.pointerId)) return;
      $.onlostpointercapture = () => {
        row.classList.remove('grabbing');
        row.style.top = null;
        post.value = $.onlostpointercapture = $.onpointermove = null;
      };
      row.classList.add('grabbing');
      const ys = [...$.children].map(x => {
        const {y, height} = x.getBoundingClientRect();
        return y + height / 2;
      });
      ys[ys.length - 1] = Infinity;
      const y0 = row.getBoundingClientRect().y;
      const {clientY} = e;
      $.onpointermove = e => {
        const y1 = y0 + e.clientY - clientY;
        const xs = [...original];
        const x = xs.splice(index, 1);
        xs.splice(ys.findIndex(y => y >= y1), 0, ...x);
        items.value = xs;
        post.value = () => {
          const d = parseFloat(row.style.top);
          row.style.top = `${y1 - (row.getBoundingClientRect().y - (isNaN(d) ? 0 : d))}px`;
        };
      };
    };
    return () => [items.value.map(x => $for(x, () => div({
      style: `background-color: #${(Math.floor(Math.random() * 0x1000) + 0x1000).toString(16).substring(1)}`,
      onpointerdown: e => drag(x, e)
    }))), post.value];
  })
);
```
[Try on JSFiddle](https://jsfiddle.net/shin1m/k1zoxycb/)

`post` does the key role here.
The other code is not so special to reflx despite that it is rather long.
Note that `post.value` in `() => [..., post.value]` is a function during a drag operation.
The function can correctly adjust the position of `div` because it runs after the DOM manipulation of the `div`s.
During the drag operation, the following happens:
- Changing `items.value` or `post.value` in `$.onpointermove = e => { ... }` triggers `() => [..., post.value]` to run.
- The list of `div`s returned by `() => [..., post.value]` are placed into the DOM document.
- A new reactive block is created for `post.value`.
- The reactive block runs in a next microtask.

### TODO List

[Try on JSFiddle](https://jsfiddle.net/shin1m/x0ue369s/)

This example contains almost all the topics explained so far.

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
