## Modules

<dl>
<dt><a href="#module_index">index</a></dt>
<dd></dd>
<dt><a href="#module_state">state</a></dt>
<dd></dd>
</dl>

<a name="module_index"></a>

## index

* [index](#module_index)
    * _static_
        * [.$tags](#module_index.$tags) : [<code>ElementFactory</code>](#module_index..ElementFactory)
        * [.$add(parent, ...xs)](#module_index.$add) ⇒ [<code>Element</code>](https://developer.mozilla.org/en-US/docs/Web/API/Element)
        * [.$tags(namespaceURI)](#module_index.$tags) ⇒ [<code>ElementFactory</code>](#module_index..ElementFactory)
        * [.$use(x)](#module_index.$use) ⇒ [<code>Observable</code>](#module_index..Observable)
        * [.$dispose(f)](#module_index.$dispose) ⇒ <code>void</code>
        * [.$for(key, f)](#module_index.$for) ⇒ [<code>Block</code>](#module_index..Block)
    * _inner_
        * [~Observable](#module_index..Observable)
            * [.on(x)](#module_index..Observable+on) ⇒ [<code>Action</code>](#module_index..Action)
        * [~Block](#module_index..Block)
        * [~ElementParameter](#module_index..ElementParameter) : <code>null</code> \| <code>undefined</code> \| <code>boolean</code> \| <code>number</code> \| <code>string</code> \| <code>symbol</code> \| <code>Object</code> \| [<code>Array.&lt;ElementParameter&gt;</code>](#module_index..ElementParameter) \| [<code>Node</code>](https://developer.mozilla.org/en-US/docs/Web/API/Node) \| [<code>ReactiveFunction</code>](#module_index..ReactiveFunction) \| [<code>Block</code>](#module_index..Block)
        * [~ReactiveFunction](#module_index..ReactiveFunction) ⇒ [<code>ElementParameter</code>](#module_index..ElementParameter)
        * [~ElementCreator](#module_index..ElementCreator) ⇒ [<code>Element</code>](https://developer.mozilla.org/en-US/docs/Web/API/Element)
        * [~ElementFactory](#module_index..ElementFactory) : <code>Proxy</code>
        * [~Action](#module_index..Action) ⇒ <code>void</code>

<a name="module_index.$tags"></a>

### index.$tags : [<code>ElementFactory</code>](#module_index..ElementFactory)
**Kind**: static constant of [<code>index</code>](#module_index)  
<a name="module_index.$add"></a>

### index.$add(parent, ...xs) ⇒ [<code>Element</code>](https://developer.mozilla.org/en-US/docs/Web/API/Element)
Adds/applies xs to the parent.

**Kind**: static method of [<code>index</code>](#module_index)  
**Returns**: [<code>Element</code>](https://developer.mozilla.org/en-US/docs/Web/API/Element) - The parent  

| Param | Type |
| --- | --- |
| parent | [<code>Element</code>](https://developer.mozilla.org/en-US/docs/Web/API/Element) | 
| ...xs | [<code>ElementParameter</code>](#module_index..ElementParameter) | 

<a name="module_index.$tags"></a>

### index.$tags(namespaceURI) ⇒ [<code>ElementFactory</code>](#module_index..ElementFactory)
Creates an element factory for the namespaceURI.

**Kind**: static method of [<code>index</code>](#module_index)  

| Param | Type |
| --- | --- |
| namespaceURI | <code>string</code> | 

<a name="module_index.$use"></a>

### index.$use(x) ⇒ [<code>Observable</code>](#module_index..Observable)
Declares x as a dependency of the current reactive block.
<p>Adds an observer which triggers to run [ReactiveFunction](#module_index..ReactiveFunction) of the current reactive block to x by calling [on](#module_index..Observable+on).</p>
<p>Does nothing outside of reactive blocks.</p>

**Kind**: static method of [<code>index</code>](#module_index)  
**Returns**: [<code>Observable</code>](#module_index..Observable) - x  

| Param | Type |
| --- | --- |
| x | [<code>Observable</code>](#module_index..Observable) | 

<a name="module_index.$dispose"></a>

### index.$dispose(f) ⇒ <code>void</code>
Registers a function which is called on disposal of the current reactive block.

**Kind**: static method of [<code>index</code>](#module_index)  

| Param | Type |
| --- | --- |
| f | [<code>Action</code>](#module_index..Action) | 

<a name="module_index.$for"></a>

### index.$for(key, f) ⇒ [<code>Block</code>](#module_index..Block)
Creates/reuses a reactive block for a key.
The key must be unique in the current reactive block.
<p>If the reactive block for the key already exists, it is reused and its content is preserved as long as its dependencies do not change.</p>

**Kind**: static method of [<code>index</code>](#module_index)  

| Param | Type |
| --- | --- |
| key |  | 
| f | [<code>ReactiveFunction</code>](#module_index..ReactiveFunction) | 

<a name="module_index..Observable"></a>

### index~Observable
What [$use](#module_index.$use) requires in order for reactive blocks to be reactive.

**Kind**: inner interface of [<code>index</code>](#module_index)  
<a name="module_index..Observable+on"></a>

#### observable.on(x) ⇒ [<code>Action</code>](#module_index..Action)
add an observer.

**Kind**: instance method of [<code>Observable</code>](#module_index..Observable)  
**Returns**: [<code>Action</code>](#module_index..Action) - a function to remove the observer.  

| Param | Type | Description |
| --- | --- | --- |
| x | [<code>Action</code>](#module_index..Action) | an observer |

<a name="module_index..Block"></a>

### index~Block
An opaque class which represents a reactive block.

**Kind**: inner class of [<code>index</code>](#module_index)  
<a name="module_index..ElementParameter"></a>

### index~ElementParameter : <code>null</code> \| <code>undefined</code> \| <code>boolean</code> \| <code>number</code> \| <code>string</code> \| <code>symbol</code> \| <code>Object</code> \| [<code>Array.&lt;ElementParameter&gt;</code>](#module_index..ElementParameter) \| [<code>Node</code>](https://developer.mozilla.org/en-US/docs/Web/API/Node) \| [<code>ReactiveFunction</code>](#module_index..ReactiveFunction) \| [<code>Block</code>](#module_index..Block)
Types which can be added/applied to a parent [Element](https://developer.mozilla.org/en-US/docs/Web/API/Element).
<ul>
<li>null and undefined are ignored.</li>
<li>Primitives are added as text nodes.</li>
<li>For an object literal, each key/value pair is set to the parent as a property if it exists or as an attribute otherwise</li>
<li>For an array, its values are recursively added/applied to the parent.</li>
<li>[Node](https://developer.mozilla.org/en-US/docs/Web/API/Node)s are added as they are.</li>
<li>For a function, a reactive block is created.</li>
<li>For a [Block](#module_index..Block), the content of the reactive block is moved to the end.</li>
</ul>

**Kind**: inner typedef of [<code>index</code>](#module_index)  
<a name="module_index..ReactiveFunction"></a>

### index~ReactiveFunction ⇒ [<code>ElementParameter</code>](#module_index..ElementParameter)
Called in a microtask to render a reactive block.
<p>The returned [ElementParameter](#module_index..ElementParameter) is added/applied to the parent.</p>

**Kind**: inner typedef of [<code>index</code>](#module_index)  

| Param | Type | Description |
| --- | --- | --- |
| $ | [<code>Element</code>](https://developer.mozilla.org/en-US/docs/Web/API/Element) | The parent |

<a name="module_index..ElementCreator"></a>

### index~ElementCreator ⇒ [<code>Element</code>](https://developer.mozilla.org/en-US/docs/Web/API/Element)
Creates a new element and adds/applies xs to the element.

**Kind**: inner typedef of [<code>index</code>](#module_index)  

| Param | Type |
| --- | --- |
| ...xs | [<code>ElementParameter</code>](#module_index..ElementParameter) | 

<a name="module_index..ElementFactory"></a>

### index~ElementFactory : <code>Proxy</code>
A proxy object with dynamic properties which return element creators.

**Kind**: inner typedef of [<code>index</code>](#module_index)  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| &lt;tag&nbsp;name&gt; | [<code>ElementCreator</code>](#module_index..ElementCreator) | Returns an element creator for the &lt;tag&nbsp;name&gt;. |

<a name="module_index..Action"></a>

### index~Action ⇒ <code>void</code>
**Kind**: inner typedef of [<code>index</code>](#module_index)  
<a name="module_state"></a>

## state

* [state](#module_state)
    * [.State](#module_state.State)
        * [new exports.State(value)](#new_module_state.State_new)
        * [.value](#module_state.State+value)
        * [.on(x)](#module_state.State+on) ⇒ [<code>Action</code>](#module_index..Action)

<a name="module_state.State"></a>

### state.State
A reference implementation of [Observable](#module_index..Observable) holding a single value.

**Kind**: static class of [<code>state</code>](#module_state)  
**Implements**: [<code>Observable</code>](#module_index..Observable)  

* [.State](#module_state.State)
    * [new exports.State(value)](#new_module_state.State_new)
    * [.value](#module_state.State+value)
    * [.on(x)](#module_state.State+on) ⇒ [<code>Action</code>](#module_index..Action)

<a name="new_module_state.State_new"></a>

#### new exports.State(value)

| Param | Description |
| --- | --- |
| value | The initial value |

<a name="module_state.State+value"></a>

#### state.value
<p>Getting the value declares this as a dependency of the current reactive block by calling [$use](#module_index.$use).</p>
<p>Setting a new value emits the observers added by [module:index-state.State#on](module:index-state.State#on). Setting the same value does nothing.</p>

**Kind**: instance property of [<code>State</code>](#module_state.State)  
<a name="module_state.State+on"></a>

#### state.on(x) ⇒ [<code>Action</code>](#module_index..Action)
add an observer.

**Kind**: instance method of [<code>State</code>](#module_state.State)  
**Implements**: [<code>on</code>](#module_index..Observable+on)  
**Returns**: [<code>Action</code>](#module_index..Action) - a function to remove the observer.  

| Param | Type | Description |
| --- | --- | --- |
| x | [<code>Action</code>](#module_index..Action) | an observer |

