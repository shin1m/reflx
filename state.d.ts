export declare class State<T> {
  constructor(value: T);
  on(f: () => void): () => void;
  value: T;
}
