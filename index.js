/** @module */

let create = render => new Block(0, render);
function add(parent, before, x) {
  if (x == null) return;
  if (x instanceof Array) return void addArray(parent, before, x);
  if (typeof x === 'function') return create(x).moveTo(parent, before);
  if (x instanceof Block) return x.moveTo(parent, before);
  if (Object.getPrototypeOf(x) === Object.prototype)
    for (const [k, v] of Object.entries(x)) {
      if (k in parent) try {
        parent[k] = v;
        continue;
      } catch { }
      parent.setAttribute(k, v);
    }
  else
    parent.insertBefore(x instanceof Node ? x : document.createTextNode(`${x}`), before);
}
function addArray(parent, before, xs) {
  for (const x of xs) add(parent, before, x);
  return parent;
}
/**
 * @external Node
 * @see https://developer.mozilla.org/en-US/docs/Web/API/Node
 */
/**
 * @external Element
 * @see https://developer.mozilla.org/en-US/docs/Web/API/Element
 */
/**
 * @typedef {null|undefined|boolean|number|string|symbol|Object|Array<module:index~Parameter>|external:Node|module:index~Reactive|module:index~Block} Parameter
 * Types which can be added/applied to a parent {@link external:Element}.
 * <ul>
 * <li>null and undefined are ignored.</li>
 * <li>Primitives are added as text nodes.</li>
 * <li>For an object literal, each key/value pair is set to the parent as a property if it exists or as an attribute otherwise</li>
 * <li>For an array, its values are recursively added/applied to the parent.</li>
 * <li>{@link external:Node}s are added as they are.</li>
 * <li>For a function, a reactive block is created.</li>
 * <li>For a {@link module:index~Block}, the content of the reactive block is moved to the end.</li>
 * </ul>
 */
/**
 * @typedef {function} Reactive
 * Called in a microtask to render a reactive block.
 * <p>The returned {@link module:index~Parameter} is added/applied to the parent.</p>
 * @param {external:Element} $ The parent
 * @returns {module:index~Parameter}
 */
/**
 * @function
 * @description Adds/applies xs to the parent.
 * @param {external:Element} parent
 * @param {...module:index~Parameter} xs
 * @returns {external:Element} The parent
 */
export const $add = (parent, ...xs) => addArray(parent, null, xs);

/**
 * @typedef {function} Creator
 * Creates a new element and adds/applies xs to the element.
 * @param {...module:index~Parameter} xs
 * @returns {external:Element}
 */
/**
 * @typedef {Proxy} Factory
 * A proxy object with dynamic properties which return element creators.
 * @property {module:index~Creator} &lt;tag&nbsp;name&gt;
 * Returns an element creator for the &lt;tag&nbsp;name&gt;.
 */
/**
 * @constant {module:index~Factory} $tags
 * @static
 */
/**
 * @function
 * @description Creates an element factory for the namespaceURI.
 * @param {string} namespaceURI
 * @returns {module:index~Factory}
 */
export const $tags = new Proxy(namespaceURI => new Proxy({}, {
  get(target, property) {
    return (...xs) => addArray(document.createElementNS(namespaceURI, property), null, xs);
  }
}), {
  get(target, property) {
    return (...xs) => addArray(document.createElement(property), null, xs);
  }
});

/**
 * @typedef {function} Action
 * @returns {void}
 */
/**
 * @interface Observable
 * @description What {@link module:index.$use} requires in order for reactive blocks to be reactive.
 */
/**
 * @function module:index~Observable#on
 * @description add an observer.
 * @param f {module:index~Action} an observer
 * @returns {module:index~Action} a function to remove the observer.
 */
/**
 * @function
 * @description Declares x as a dependency of the current reactive block.
 * <p>Adds an observer which triggers to run {@link module:index~Reactive} of the current reactive block to x by calling {@link module:index~Observable#on}.</p>
 * <p>Does nothing outside of reactive blocks.</p>
 * @param {module:index~Observable} x
 * @returns {module:index~Observable} x
 */
export let $use = x => x;
/**
 * @function
 * @description Registers a function which is called on disposal of the current reactive block.
 * @param {module:index~Action} f
 * @returns {void}
 */
export let $dispose;
/**
 * @function
 * @description Creates/reuses a reactive block for a key.
 * The key must be unique in the current reactive block.
 * <p>If the reactive block for the key already exists, it is reused and its content is preserved as long as its dependencies do not change.</p>
 * @param key
 * @param {module:index~Reactive} f
 * @returns {module:index~Block}
 */
export let $for;

let queues = [[], []];
let queued = false
function loop() {
  queues = [queues[1], queues[0]];
  queued = false;
  const old = [create, $use];
  try {
    queues[1].forEach(xs => {
      for (const x of xs) x.evaluate();
    });
    queues[1] = [];
  } finally {
    [create, $use] = old;
    $dispose = $for = null;
  }
}

/**
 * An opaque class which represents a reactive block.
 */
class Block {
  #depth;
  #queue = () => {
    (queues[0][this.#depth] ??= new Set()).add(this);
    if (queued) return;
    queueMicrotask(loop);
    queued = true;
  };
  #begin = document.createComment('');
  #end = document.createComment('');
  #render;
  #disposes = [];
  #key2block = new Map();

  constructor(depth, render) {
    this.#depth = depth;
    this.#render = render;
    this.#queue();
  }
  dispose() {
    for (const x of this.#disposes) x();
    for (const x of this.#key2block.values()) x.dispose();
    for (const x of queues) x[this.#depth]?.delete(this);
  }
  moveTo(parent, before) {
    let x = this.#begin.nextSibling;
    parent.insertBefore(this.#begin, before);
    if (x) while (x !== this.#end) {
      x = x.nextSibling;
      parent.insertBefore(x.previousSibling, before);
    }
    parent.insertBefore(this.#end, before);
  }
  evaluate() {
    for (const x of this.#disposes) x();
    this.#disposes = [];
    $use = slot => {
      this.#disposes.push(slot.on(this.#queue));
      return slot;
    };
    $dispose = x => this.#disposes.push(x);
    const depth = this.#depth + 1;
    create = render => {
      const block = new Block(depth, render);
      this.#disposes.push(() => block.dispose());
      return block;
    };
    const key2old = this.#key2block;
    this.#key2block = new Map();
    $for = (key, render) => {
      let block = key2old.get(key);
      if (block) {
        key2old.delete(key);
        block.#render = render;
      } else {
        block = new Block(depth, render);
      }
      this.#key2block.set(key, block);
      return block;
    };
    const parent = this.#begin.parentNode;
    let before = parent.insertBefore(document.createComment(''), this.#begin.nextSibling);
    add(parent, before, this.#render(parent));
    do {
      before = before.nextSibling;
      parent.removeChild(before.previousSibling);
    } while (before !== this.#end);
    for (const x of key2old.values()) x.dispose();
  }
}
