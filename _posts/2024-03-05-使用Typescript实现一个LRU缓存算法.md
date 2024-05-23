---
layout: post
title: 使用Typescript实现一个LRU缓存算法
category: Others
date: 2024-03-05 14:57:36.000000000 +08:00
---

## 1. 什么是 LRU 缓存算法

LRU（Least Recently Used）算法是一种常用的页面替换或缓存淘汰策略。它的核心思想是在资源有限的情况下，当需要添加新的数据项但存储空间已满时，优先淘汰最近最少使用的数据项，以保证最常访问或最近使用过的数据能够保留在缓存中。

## 2. 实现 LRU 算法的核心步骤

1. **数据结构选择**
- 使用哈希表（如 HashMap）来实现 O(1)时间复杂度的查找和更新操作，用于存储键值对及其在缓存中的位置引用。
- 使用双端队列（Deque，例如 LinkedList）来维护元素的顺序，新加入的元素在队列尾部，被访问过的元素移动到队列头部。
2. **基本操作定义**
- `get(key)`: 如果 key 存在于缓存中，则将其从其当前位置移除并插入到队列头部，同时返回对应的 value；若不存在，则返回-1 或其他预设标记。
- `pub(key, value)`: 如果 key 不存在于缓存中，则将 key 和 value 插入到队列头部，若缓存已满，则将队列尾部的元素移除；若 key 已存在，则更新其对应的 value，同时将其从其当前位置移除并插入到队列头部，并在缓存中更新其位置引用。


## 3. 代码实现

```typescript
interface Node {
  key: string;
  value: any;
}

class LRU {
  private capacity: number;
  private cache: Map<string, Node>;
  private doubleLinkedList: Array<Node>;

  constructor(capacity: number) {
    this.capacity = capacity;
    this.cache = new Map();
    this.doubleLinkedList = [];
  }

  get(key: string): Node | undefined {
    const node = this.cache.get(key);
    // 如果key存在，则将该节点从队列中移除并插入到队列头部
    if (node !== undefined) {
      this.doubleLinkedList.splice(this.doubleLinkedList.indexOf(node), 1);
      this.doubleLinkedList.unshift(node);
      return node;
    }
    // 如果key不存在，则返回undefined
    return undefined;
  }

  put(key: string, value: any) {
    let node: Node | undefined = this.cache.get(key);
    // 如果key存在，则更新其对应的value，同时将其从其当前位置移除并插入到队列头部，并在缓存中更新其位置引用
    if (node !== undefined) {
      this.doubleLinkedList.splice(this.doubleLinkedList.indexOf(node), 1);
      this.doubleLinkedList.unshift(node);
      node.value = value;
    } else {
      // 否则，如果缓存已满，则将队列尾部的元素移除
      if (this.cache.size >= this.capacity) {
        const last = this.doubleLinkedList.pop();
        this.cache.delete(last!.key);
      }
      // 创建新节点
      node = {
        key,
        value,
      };
    }
    // 更新缓存
    this.cache.set(key, node);
    // 将新节点插入队列头部
    this.doubleLinkedList.unshift(node);
  }
}
```

## 4. 代码分析
这段代码存在什么问题吗？还有什么优化空间吗？问了一下ChatGPT，结果如下：

> 这段代码实现了基于`TypeScript`的LRU缓存类，但存在一些问题和优化空间。以下是关于代码实现LRU算法的分析：
> 
> 1. 数据结构选择：
> * 使用了`Map<string, Node>`作为哈希表来存储键值对。
> * 使用了数组`Array<Node>`来模拟双端队列。但是，在实际操作中，使用原生数组来模拟双端队列在插入和删除元素时效率较低，尤其是在较大的数据规模下，`indexOf()`和`splice()`方法的时间复杂度较高。
> 2. 基本功能实现：
> * `get(key)`方法在获取缓存项时，能够正确将节点移动到队列头部。
> * `put(key, value)`方法在更新或新增缓存项时，能确保当缓存满时移除最近最少使用的项，并将新项添加到队列头部及哈希表中。
> 3. 改进点：
> * 更高效的双端队列实现：可以考虑使用一个自定义的双向链表类或者利用ES6的`Array.prototype.shift()`和`Array.prototype.push()`方法来替代现有的数组操作，以降低时间复杂度。
>
> 总结：虽然这段代码在逻辑上基本实现了LRU算法的核心功能，但由于在模拟双端队列时没有充分利用恰当的数据结构，导致在处理大量数据时性能可能不够理想。为了提高效率，建议改用更合适的双端队列实现方式，如LinkedList或其他高效的数据结构。

根据上述分析，我们得出了这段代码可以基本实现LRU算法的核心功能，但存在一些问题和优化空间，提到了`indexOf()`和`splice()`的时间复杂度较高，下面我们考虑改造一下代码。

## 5. 代码改造
```typescript
class LRU {
    private size: number = 0;
    private readonly capacity: number;
    private linkedList: DoubleLinkedList = new DoubleLinkedList();
    private cache: Map<string, DoubleLinkedNode> = new Map<string, DoubleLinkedNode>();

    constructor(capacity: number) {
        this.capacity = capacity;
    }

    get(key: string): DoubleLinkedNode {
        const node = this.cache.get(key);
        // 如果key存在，则将该节点从队列中移除并插入到队列头部
        if (node !== undefined) {
            this.linkedList.moveToHead(node);
        }
        return node;
    }

    put(key: string, value: number): void {
        const node = this.cache.get(key);
        // 如果key存在，则更新其对应的value，同时将其从其当前位置移除并插入到队列头部，并在缓存中更新其位置引用
        if (node !== undefined) {
            node.value = value;
            this.linkedList.moveToHead(node);
        } else {
            // 否则，则将其添加到缓存中，并移动到队列首部
            const newNode = new DoubleLinkedNode(key, value);
            this.cache.set(key, newNode);
            this.linkedList.addToHead(newNode);
            ++this.size;
            // 如果缓存已满，则将队列尾部的元素移除
            if (this.size > this.capacity) {
                const node = this.linkedList.removeTail();
                this.cache.delete(node.key);
                --this.size;
            }
        }
    }
}

class DoubleLinkedNode {
    key: string;
    value: any;
    prev?: DoubleLinkedNode;
    next?: DoubleLinkedNode;

    constructor(key?: string, value?: any) {
        this.key = key;
        this.value = value;
    }
}

class DoubleLinkedList {
    private readonly dummyHead: DoubleLinkedNode;
    private readonly dummyTail: DoubleLinkedNode;

    constructor() {
        this.dummyHead = new DoubleLinkedNode();
        this.dummyTail = new DoubleLinkedNode();
        this.dummyHead.next = this.dummyTail;
        this.dummyTail.prev = this.dummyHead;
    }

    addToHead(node: DoubleLinkedNode) {
        node.prev = this.dummyHead;
        node.next = this.dummyHead.next;
        this.dummyHead.next.prev = node;
        this.dummyHead.next = node;
    }

    removeNode(node: DoubleLinkedNode) {
        node.prev.next = node.next;
        node.next.prev = node.prev;
    }

    moveToHead(node: DoubleLinkedNode) {
        this.removeNode(node);
        this.addToHead(node);
    }

    removeTail(): DoubleLinkedNode {
        const node = this.dummyTail.prev;
        this.removeNode(node);
        return node;
    }
}
```
## 6. 单元测试
使用`vitest`进行简单的单元测试：
```javascript
describe("Test LRU", () => {
  const DEFAULT_CAPACITY = 2;
  test("should perform the correct init", () => {
    const lru = new LRU(DEFAULT_CAPACITY);
    expect(lru.capacity).toBe(DEFAULT_CAPACITY);
  });
  test("should perform the correct get", () => {
    const lru = new LRU(DEFAULT_CAPACITY);
    lru.put("0", 0);
    lru.put("1", 1);
    expect(lru.get("0")?.value).toBe(0);
    expect(lru.get("1")?.value).toBe(1);
    expect(lru.get("2")).toBeUndefined();
  });

  test("should perform the correct put", () => {
    const lru = new LRU(DEFAULT_CAPACITY);
    lru.put("0", 0);
    expect(lru.get("0")?.value).toBe(0);
    lru.put("1", 1);
    lru.put("2", 2);
    // 由于容量为2，添加了3个元素，而1未被用到，因此被移除了，所以值为undefined.
    expect(lru.get("1")?.value).toBeUndefined();
    expect(lru.get("2")?.value).toBe(2);
  });
});
```
可以看到，测试结果为：
<pre>
 ✓ Test LRU (3)           
     ✓ should perform the correct init    
     ✓ should perform the correct get 
     ✓ should perform the correct put 
</pre>
已全部测试通过，说明我们所编写的算法是可行的，解析我们继续询问ChatCPT看看我们这段代码是否符合要求，所得出的结论是：**合格**。
> 这段代码实现了基于双向链表的LRU（最近最少使用）缓存淘汰算法，整体来看，它通过LRU类管理一个固定容量的缓存，并使用了`DoubleLinkedList`类来维护缓存项的顺序。以下是代码实现的功能点：
> 
> 1. `DoubleLinkedNode`类定义了缓存项的数据结构，包含键值对以及前后指针用于构建双向链表。
> 2. `DoubleLinkedList`类实现了双向链表的基本操作：将节点移到头部（`moveToHead`）、从链表中移除节点（`removeNode`）和在链表头部追加新节点（`addToHead`）。
> 3. `LRU`类包含了缓存的核心逻辑：
> * 初始化时设定缓存容量并创建一个`Map`作为实际存储数据的容器及一个双向链表实例。
> * `get`方法首先查找给定`key`对应的节点，若存在则将其移动到链表头部，并返回该节点。
> * `put`方法根据`key`是否存在执行不同操作：
>   * 若`key`存在，则更新其`value`并将节点移动至链表头部。
>   * 若`key`不存在且缓存已满，则删除链表尾部的节点（即最久未使用的项），然后将新节点插入链表头部，并更新缓存。
