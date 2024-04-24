type Parameter<T extends Element> = void | null | undefined | boolean | number | string | symbol | { [key: string]: any; } | Parameter<T>[] | Node | Reactive<T> | Block<T>;
type Reactive<T extends Element> = ($: T) => Parameter<T>;
export declare function $add<T extends Element>(parent: T, ...xs: Parameter<T>[]): T;

type Creator<T extends Element> = (...xs: Parameter<T>[]) => T;
type HTMLFactory = {
    readonly [name in keyof HTMLElementTagNameMap]: Creator<HTMLElementTagNameMap[name]>;
}
type Factory = {
    readonly [name: string]: Creator<Element>;
}
export declare const $tags: HTMLFactory & Factory & ((namespaceURI: string) => HTMLFactory & Factory);

export declare function $use<T extends {
    on(f: () => void): () => void;
}>(x: T): T;
export declare function $dispose(f: () => void): void;
declare class Block<T extends Element> { #render: Reactive<T>; }
export declare function $for<T extends Element>(key: any, f: Reactive<T>): Block<T>;
