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
        * [.$tags](#module_index.$tags) : [<code>Factory</code>](#module_index..Factory)
        * [.$add(parent, ...xs)](#module_index.$add) ⇒ [<code>Element</code>](https://developer.mozilla.org/en-US/docs/Web/API/Element)
        * [.$tags(namespaceURI)](#module_index.$tags) ⇒ [<code>Factory</code>](#module_index..Factory)
        * [.$use(x)](#module_index.$use) ⇒ [<code>Observable</code>](#module_index..Observable)
        * [.$dispose(f)](#module_index.$dispose) ⇒ <code>void</code>
        * [.$for(key, f)](#module_index.$for) ⇒ [<code>Block</code>](#module_index..Block)
    * _inner_
        * [~Observable](#module_index..Observable)
            * [.on(f)](#module_index..Observable+on) ⇒ [<code>Action</code>](#module_index..Action)
        * [~Block](#module_index..Block)
        * [~Parameter](#module_index..Parameter) : <code>null</code> \| <code>undefined</code> \| <code>boolean</code> \| <code>number</code> \| <code>string</code> \| <code>symbol</code> \| <code>Object</code> \| [<code>Array.&lt;Parameter&gt;</code>](#module_index..Parameter) \| [<code>Node</code>](https://developer.mozilla.org/en-US/docs/Web/API/Node) \| [<code>Reactive</code>](#module_index..Reactive) \| [<code>Block</code>](#module_index..Block)
        * [~Reactive](#module_index..Reactive) ⇒ [<code>Parameter</code>](#module_index..Parameter)
        * [~Creator](#module_index..Creator) ⇒ [<code>Element</code>](https://developer.mozilla.org/en-US/docs/Web/API/Element)
        * [~Factory](#module_index..Factory) : <code>Proxy</code>
        * [~Action](#module_index..Action) ⇒ <code>void</code>

<a name="module_index.$tags"></a>

### index.$tags : [<code>Factory</code>](#module_index..Factory)
**Kind**: static constant of [<code>index</code>](#module_index)  
<a name="module_index.$add"></a>

### index.$add(parent, ...xs) ⇒ [<code>Element</code>](https://developer.mozilla.org/en-US/docs/Web/API/Element)
Adds/applies xs to the parent.

**Kind**: static method of [<code>index</code>](#module_index)  
**Returns**: [<code>Element</code>](https://developer.mozilla.org/en-US/docs/Web/API/Element) - The parent  

| Param | Type |
| --- | --- |
| parent | [<code>Element</code>](https://developer.mozilla.org/en-US/docs/Web/API/Element) | 
| ...xs | [<code>Parameter</code>](#module_index..Parameter) | 

<a name="module_index.$tags"></a>

### index.$tags(namespaceURI) ⇒ [<code>Factory</code>](#module_index..Factory)
Creates an element factory for the namespaceURI.

**Kind**: static method of [<code>index</code>](#module_index)  

| Param | Type |
| --- | --- |
| namespaceURI | <code>string</code> | 

<a name="module_index.$use"></a>

### index.$use(x) ⇒ [<code>Observable</code>](#module_index..Observable)
Declares x as a dependency of the current reactive block.
<p>Adds an observer which triggers to run [Reactive](#module_index..Reactive) of the current reactive block to x by calling [on](#module_index..Observable+on).</p>
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
| f | [<code>Reactive</code>](#module_index..Reactive) | 

<a name="module_index..Observable"></a>

### index~Observable
What [$use](#module_index.$use) requires in order for reactive blocks to be reactive.

**Kind**: inner interface of [<code>index</code>](#module_index)  
<a name="module_index..Observable+on"></a>

#### observable.on(f) ⇒ [<code>Action</code>](#module_index..Action)
add an observer.

**Kind**: instance method of [<code>Observable</code>](#module_index..Observable)  
**Returns**: [<code>Action</code>](#module_index..Action) - a function to remove the observer.  

| Param | Type | Description |
| --- | --- | --- |
| f | [<code>Action</code>](#module_index..Action) | an observer |

<a name="module_index..Block"></a>

### index~Block
An opaque class which represents a reactive block.

**Kind**: inner class of [<code>index</code>](#module_index)  
<a name="module_index..Parameter"></a>

### index~Parameter : <code>null</code> \| <code>undefined</code> \| <code>boolean</code> \| <code>number</code> \| <code>string</code> \| <code>symbol</code> \| <code>Object</code> \| [<code>Array.&lt;Parameter&gt;</code>](#module_index..Parameter) \| [<code>Node</code>](https://developer.mozilla.org/en-US/docs/Web/API/Node) \| [<code>Reactive</code>](#module_index..Reactive) \| [<code>Block</code>](#module_index..Block)
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
<a name="module_index..Reactive"></a>

### index~Reactive ⇒ [<code>Parameter</code>](#module_index..Parameter)
Called in a microtask to render a reactive block.
<p>The returned [Parameter](#module_index..Parameter) is added/applied to the parent.</p>

**Kind**: inner typedef of [<code>index</code>](#module_index)  

| Param | Type | Description |
| --- | --- | --- |
| $ | [<code>Element</code>](https://developer.mozilla.org/en-US/docs/Web/API/Element) | The parent |

<a name="module_index..Creator"></a>

### index~Creator ⇒ [<code>Element</code>](https://developer.mozilla.org/en-US/docs/Web/API/Element)
Creates a new element and adds/applies xs to the element.

**Kind**: inner typedef of [<code>index</code>](#module_index)  

| Param | Type |
| --- | --- |
| ...xs | [<code>Parameter</code>](#module_index..Parameter) | 

<a name="module_index..Factory"></a>

### index~Factory : <code>Proxy</code>
A proxy object with dynamic properties which return element creators.

**Kind**: inner typedef of [<code>index</code>](#module_index)  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| &lt;tag&nbsp;name&gt; | [<code>Creator</code>](#module_index..Creator) | Returns an element creator for the &lt;tag&nbsp;name&gt;. |

<a name="module_index..Action"></a>

### index~Action ⇒ <code>void</code>
**Kind**: inner typedef of [<code>index</code>](#module_index)  
<a name="module_state"></a>

## state

* [state](#module_state)
    * [.State](#module_state.State)
        * [new exports.State(value)](#new_module_state.State_new)
        * [.value](#module_state.State+value)
        * [.on(f)](#module_state.State+on) ⇒ [<code>Action</code>](#module_index..Action)

<a name="module_state.State"></a>

### state.State
A reference implementation of [Observable](#module_index..Observable) holding a single value.

**Kind**: static class of [<code>state</code>](#module_state)  
**Implements**: [<code>Observable</code>](#module_index..Observable)  

* [.State](#module_state.State)
    * [new exports.State(value)](#new_module_state.State_new)
    * [.value](#module_state.State+value)
    * [.on(f)](#module_state.State+on) ⇒ [<code>Action</code>](#module_index..Action)

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

#### state.on(f) ⇒ [<code>Action</code>](#module_index..Action)
add an observer.

**Kind**: instance method of [<code>State</code>](#module_state.State)  
**Implements**: [<code>on</code>](#module_index..Observable+on)  
**Returns**: [<code>Action</code>](#module_index..Action) - a function to remove the observer.  

| Param | Type | Description |
| --- | --- | --- |
| f | [<code>Action</code>](#module_index..Action) | an observer |

