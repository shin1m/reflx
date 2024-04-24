/** @module */

import {$use} from './index.js';

/**
 * A reference implementation of {@link module:index~Observable} holding a single value.
 * @implements {module:index~Observable}
 */
export class State {
  #observers = new Set();
  #value;

  /**
   * @param - The initial value
   */
  constructor(value) {
    this.#value = value;
  }
  on(f) {
    this.#observers.add(f);
    return () => this.#observers.delete(f);
  }
  /**
   * <p>Getting the value declares this as a dependency of the current reactive block by calling {@link module:index.$use}.</p>
   * <p>Setting a new value emits the observers added by {@link module:index-state.State#on}. Setting the same value does nothing.</p>
   */
  get value() {
    return $use(this).#value;
  }
  set value(value) {
    if (value === this.#value) return;
    this.#value = value;
    for (const x of this.#observers) x();
  }
}
