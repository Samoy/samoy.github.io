---
layout: post
title: Typescript装饰器简介（上）
category: Web
date: 2024-01-03 15:40:13.000000000 +08:00
---

## 1. 装饰器的作用

装饰器是一种特殊的声明，它可以被附加到类、方法或属性上，用来修改类，属性或者方法的行为。

## 2. 装饰器类型

- 类装饰器
- 方法装饰器
- 属性装饰器
- Getter/Setter装饰器
- accessor装饰器

## 3. 装饰器语法

目前TypeScript使用的语法是5.0引入的装饰器语法，Typescript同时支持两种语法，本文介绍新语法。旧语法会在下篇文章中介绍。
以下是几种装饰器的定义示例：
### 3.1 类装饰器

```typescript
type ClassDecorator = (value: Function, context: ClassDecoratorContext) => Function | void;
```

类装饰器接收两个参数：value和context。value表示被装饰的类，context表示装饰器的上下文。
context参数的类型如下：

```typescript
interface ClassDecoratorContext<Class extends abstract new (...args: any) => any = abstract new (...args: any) => any, > {
  kind: "class";
  name: string | undefined;

  addInitializer(initializer: (this: Class) => void): void;

  metadata: DecoratorMetadata
}
```

其中kind固定为字符串"class"，表示装饰的是类, name表示类名，addInitializer方法用于添加类的初始化代码,metadata表示装饰器的元数据。

### 3.2 方法装饰器

```typescript
type MethodDecorator = (value: Function, context: ClassMethodDecoratorContext) => Function | void;
```

同样，方法装饰器接收两个参数：value和context。value表示被装饰的方法，context表示装饰器的上下文。
context参数的类型如下：

```typescript
interface ClassMethodDecoratorContext<This = unknown, Value extends (this: This, ...args: any) => any = (this: This, ...args: any) => any> {
  kind: "method";
  name: string | symbol;
  static: boolean;
  private: boolean;
  access: {
    has(object: This): boolean;
    get(object: This): Value;
  },

  addInitializer(initializer: (this: This) => void): void;

  metadata: DecoratorMetadata;
}
```

其中kind固定为字符串"method"，表示装饰的是类方法，name表示方法名，static表示是否是静态方法，private表示是否是私有方法，access表示访问器，
addInitializer为方法增加初始化函数,metadata表示装饰器的元数据。

### 3.3 属性装饰器

```typescript
type PropertyDecorator = (value: undefined, context: ClassFieldDecoratorContext) => (initialValue: unknown) => unknown | void;
```

属性装饰同样接收两个参数：value和context。value这个值其实是不用的，因为属性装饰器不能获取属性的值。context表示装饰器的上下文。
context参数的类型如下：

```typescript
interface ClassFieldDecoratorContext<This = unknown, Value = unknown> {
  kind: "field";
  name: string | symbol;
  static: boolean;
  private: boolean;
  access: {
    has(object: This): boolean;
    get(object: This): Value;
    set(object: This, value: Value): void;
  },

  addInitializer(initializer: (this: This) => void): void;

  metadata: DecoratorMetadata;
}
```

其中kind固定为字符串"field"
，表示装饰的是类属性，name表示属性名，static表示是否是静态属性，private表示是否是私有属性，access表示访问器，addInitializer为属性增加初始化函数,metadata表示装饰器的元数据。

### 3.4 Getter/Setter装饰器

```typescript
type GetterDecorator = (value: Function, context: ClassGetterDecoratorContext) => Function | void;
type SetterDecorator = (value: Function, context: ClassSetterDecoratorContext) => Function | void;
```

Getter/Setter装饰器也接收两个参数：value和context。value表示被装饰的属性，context表示装饰器的上下文。
context参数的类型如下：

```typescript
interface ClassGetterDecoratorContext<
  This = unknown,
  Value = unknown,
> {
  kind: "getter";
  name: string | symbol;
  static: boolean;
  private: boolean;
  access: {
    has(object: This): boolean;
    get(object: This): Value;
  },

  addInitializer(initializer: (this: This) => void): void;

  metadata: DecoratorMetadata;
}

interface ClassSetterDecoratorContext<
  This = unknown,
  Value = unknown,
> {
  kind: "setter";
  name: string | symbol;
  static: boolean;
  private: boolean;
  access: {
    has(object: This): boolean;
    set(object: This, value: Value): void;
  },

  addInitializer(initializer: (this: This) => void): void;

  metadata: DecoratorMetadata;
}
```

其中kind固定为字符串"getter"或"setter"，表示装饰的是类属性的Getter或Setter方法，name表示属性名，static表示是否是静态属性，private表示是否是私有属性，
access表示访问器，Getter包含has方法和get方法，Setter包含has和set方法，addInitializer为属性增加初始化函数，metadata表示装饰器的元数据。

### 3.5 accessor装饰器

```typescript
type AccessorDecorator = (value: {
  get: () => unknown;
  set: (value: unknown) => void;
}, context: ClassAccessorDecoratorContext) => {
  get?: () => unknown;
  set?: (value: unknown) => void;
  init?: (initialValue: unknown) => unknown;
} | void;
```

accessor装饰器也接收两个参数：value和context。value表示被装饰的属性，context表示装饰器的上下文。
context参数的类型如下：

```typescript
interface ClassAccessorDecoratorContext<This = unknown, Value = unknown> {
  kind: "accessor";
  name: string | symbol;
  static: boolean;
  private: boolean;
  access: {
    has(object: This): boolean;
    get(object: This): unknown;
    set(object: This, value: Value): void;
  }

  addInitializer(initializer: (this: This) => void): void;

  metadata: DecoratorMetadata;
}
```

其中kind固定为字符串"accessor"，表示装饰的是类属性的访问器，name表示属性名，static表示是否是静态属性，private表示是否是私有属性，access表示访问器，
addInitializer为属性增加初始化函数，metadata表示装饰器的元数据。

## 4. 装饰器使用

Typescript装饰器的使用类似于Java的注解，但是功能不甚相同，以下一段代码演示了如何使用装饰器：

```typescript
namespace Decorator {

  /**
   * 类装饰器：使类不可拓展
   * @param value
   * @param context
   */
  export function sealed(value: Function, context: ClassDecoratorContext) {
    if (context.kind === "class") {
      Object.seal(value);
    }
  }

  /**
   * 属性装饰器：使类属性可观测
   * @param value
   * @param context
   */
  export function observable<This = unknown, Value = any>(value: undefined, context: ClassFieldDecoratorContext) {
    if (context.kind === "field") {
      function observe(type: 'setter' | 'getter', value: any) {
        console.log(`【observable】 ${value} is ${type}`)
      }

      return function (this: This, initialValue: Value) {
        let temp: Value
        Object.defineProperty(this, context.name, {
          get(): Value {
            observe('getter', temp);
            return temp;
          },
          set(v: Value) {
            temp = v;
            observe('setter', temp);
          }
        })
        return initialValue;
      }
    }
  }

  /**
   * 方法装饰器：记录日志
   * @param value
   * @param context
   */
  export function logger<This = unknown, Value extends (this: This, ...args: any) => any = (this: This, ...args: any) => any>
  (value: Value, context: ClassMethodDecoratorContext) {
    if (context.kind === "method") {
      return function (this: This) {
        console.log(`%c【logger】${Object.getPrototypeOf(this).constructor.name}.${context.name.toString()}() has been invoked.`, "color: #ff00ff");
        return value.call(this);
      }
    }
  }

  /**
   * Getter装饰器：转换年龄
   * @param value
   * @param context
   */
  export function transform<This = unknown, Value extends (this: This, ...args: any) => any = (this: This, ...args: any) => any>(value: Value, context: ClassGetterDecoratorContext) {
    if (context.kind === "getter") {
      const ageMap: Record<number, any> = {
        0: '〇',
        1: '①',
        2: '②',
        3: '③',
        4: '④',
        5: '⑤',
        6: '⑥',
        7: '⑦',
        8: '⑧',
        9: '⑨',
        10: '⑩'
      }
      return function (this: This) {
        const result = value.call(this);
        return ageMap[result];
      }
    }
  }

  /**
   * Setter装饰器：校验年龄
   * @param value
   * @param context
   */
  export function validate<This = unknown, Value extends (this: This, ...args: any) => any = (this: This, ...args: any) => any>(value: Value, context: ClassSetterDecoratorContext) {
    if (context.kind === "setter") {
      return function (this: This, arg: any) {
        if (Number.isNaN(arg)) {
          throw new Error(`${context.name.toString()} must be a number`);
        }
        if (arg < 1) {
          throw new Error(`${context.name.toString()} must be greater than 0`);
        }
        if (arg > 10) {
          throw new Error(`${context.name.toString()} must be less than 10`);
        }
        return value.call(this, arg);
      }
    }
  }


  export function unit<This = unknown, Value = unknown>(value: ClassAccessorDecoratorTarget<This, Value>, context: ClassAccessorDecoratorContext):
    ClassAccessorDecoratorResult<This, Value> {
    const {get: Get, set: Set} = value;

    return {
      get(): Value {
        const result = Get.call(this);
        let newResult: any = result;
        console.log("Before convert getter", newResult);
        if (typeof result === 'number') {
          newResult = `${result}kg`;
        }
        if (typeof result === "string") {
          newResult = result.lastIndexOf('kg') > -1 ? result : `${result} kg`;
        }
        console.log("After convert getter", newResult);
        return newResult as Value;
      },
      set(v: Value) {
        let newValue: any = v;
        console.log("Before convert setter", newValue)
        if (typeof v === 'string') {
          if (v.lastIndexOf('kg') > -1) {
            newValue = Number(v.slice(0, -2));
          } else {
            newValue = Number(v);
          }
        }
        console.log("After convert setter", newValue)
        return Set.call(this, newValue);
      },
      init(value: Value): Value {
        return value;
      }
    }
  }

}


@Decorator.sealed
class Dog {
  @Decorator.observable
  name: string;
  // 私有变量，无法直接方法，需要使用getter和setter进行访问
  #age: number;
  // 使用unit装饰器，实现以下效果：
  // 1. setter时如果传入的value携带kg单位后缀，则自动去除。
  // 2. getter时如果为携带kg单位，则自动添加kg单位后缀。
  @Decorator.unit
  // accessor 属性修饰符表示自动为属性生成getter和setter方法
  accessor weight: number | string = 10;

  @Decorator.transform
  get age(): number {
    return this.#age;
  }

  @Decorator.validate
  set age(value: number) {
    this.#age = value;
  }

  constructor(name: string, age: number) {
    this.name = name;
    this.#age = age;
  }

  @Decorator.logger
  bark() {
    console.log(`Woof, My name is ${this.name}, I'm ${this.age} years old, and I weigh ${this.weight}`);
  }
}

const dog = new Dog("Wang cai", 0);
dog.name = "Wang cai2";
// 由于限制了年龄必须在1~10之间，因此下方代码会报错
// dog.age = 15;
dog.age = 5; // 5在1~10之间，因此不会报错
// 以下代码会调用setter方法，通过装饰器将10kg转换为数字10
dog.weight = "10kg";
// 以下代码会调用由于调用了weight的getter方法，通过装饰器将数字10转换为10kg
dog.bark();
console.log("Dog age:", dog.age);
console.log("Dog is sealed:", Object.isSealed(Dog));
```

## 5.装饰器执行顺序

> 装饰器的执行分为两个阶段： \
> （1）评估（evaluation）：计算@符号后面的表达式的值，得到的应该是函数。\
> （2）应用（application）：将评估装饰器后得到的函数，应用于所装饰对象。\
> 也就是说，装饰器的执行顺序是，先评估所有装饰器表达式的值，再将其应用于当前类。应用装饰器时，顺序依次为方法装饰器和属性装饰器，然后是类装饰器。同一类型的装饰器，则内层的装饰器先执行，外层的装饰器后执行。

以上文本节选自大神阮一峰的[《TypeScript 教程》](https://typescript.p6p.net/typescript-tutorial/decorator.html#%E8%A3%85%E9%A5%B0%E5%99%A8%E7%9A%84%E6%89%A7%E8%A1%8C%E9%A1%BA%E5%BA%8F)。

## 6. 装饰器的使用场景

1. 日志记录：记录函数的调用日志。
2. 权限校验：检查函数是否有权限执行。
3. 缓存：缓存函数的结果。
4. 性能监控：监控函数的执行性能。
5. 异常处理：捕获函数的异常。
6. 函数拓展：为函数添加额外的功能。

## 7. 参考链接

1. <https://devblogs.microsoft.com/typescript/announcing-typescript-5-0/#decorators>
2. <https://www.typescriptlang.org/docs/handbook/decorators.html>
3. <https://typescript.p6p.net/typescript-tutorial/decorator.html>
