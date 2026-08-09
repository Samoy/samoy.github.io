---
layout: post
title: Typescript装饰器简介（下）
category: Web
date: 2024-01-05 14:43:13.000000000 +08:00
---

在上一篇文章中，我们介绍了装饰器的基本概念，并通过一个简单的例子来展示了装饰器的使用方法。然后，Typescript同时支持装饰器的新语法和旧语法。本文来介绍Typescript的旧语法。
在本文中，所使用的语法均为旧语法。
## 1.装饰器配置
如果通过旧语法使用装饰器，需要在tsconfig.json中配置compilerOptions.experimentalDecorators为true。
```json
{
  "compilerOptions": {
    "experimentalDecorators": true
  }
}
```

## 2.装饰器的类型
- 属性装饰器
- 方法装饰器
- 参数装饰器
- 类装饰器

## 3. 装饰器语法
### 3.1 属性装饰器
```typescript
function propertyDecorator(target: Object, propertyKey: string | symbol) {
  // 目标对象
  console.log(target);
  // 目标对象的属性名
  console.log(propertyKey);
}
```
### 3.2 方法装饰器
```typescript
function methodDecorator(target: Object, propertyKey: string | symbol, descriptor: TypedPropertyDescriptor) {
  // 目标对象
  console.log(target);
  // 目标对象的属性名
  console.log(propertyKey);
  // 目标对象的属性描述符
  console.log(descriptor);
}
```

### 3.3 参数装饰器
```typescript
function parameterDecorator(target: Object, propertyKey: string | symbol | undefined, parameterIndex: number) {
  // 目标对象
  console.log(target);
  // 目标对象的属性名
  console.log(propertyKey);
  // 目标对象的参数索引
  console.log(parameterIndex);
}
```
### 3.4 类装饰器
```typescript
function classDecorator(target: Function) {
  // 目标对象
  console.log(target);
}
```

## 4.装饰器的使用
```typescript
/**
 * 定义装饰器命名空间
 */
namespace LegacyDecorators {
  /**
   * 最大值的key
   * @private
   */
  const maxKey = Symbol("maxKey");
  /**
   * 最小值的key
   * @private
   */
  const minKey = Symbol("minKey");

  /**
   * 属性装饰器：使属性变成可观察的
   */
  export function observable(): PropertyDecorator {

    function observe(type: 'setter' | 'getter', value: any) {
      console.log(`【observable】 ${value} is ${type}`)
    }

    return function (target: Object, propertyKey: string | symbol) {
      let temp: any;
      Object.defineProperty(target, propertyKey, {
        get() {
          observe('getter', temp);
          return temp;
        },
        set(value) {
          temp = value;
          observe('setter', temp);
        }
      });
    }
  }

  /**
   * 方法装饰器：打印日志
   */
  export function logger(): MethodDecorator {
    return function (target: Object, propertyKey: string | symbol, descriptor: TypedPropertyDescriptor<any>) {
      const originalMethod = descriptor.value;
      descriptor.value = function (...args: any[]) {
        console.log(`%c【logger】${target.constructor.name}.${propertyKey.toString()} has been invoked.`, "color: #ff00ff");
        originalMethod.apply(this, args);
      }
    }
  }


  /**
   * 方法装饰器：校验参数
   */
  export function validate(): MethodDecorator {
    return function (target: Object, propertyKey: string | symbol, descriptor: TypedPropertyDescriptor<any>) {
      const {min, index: minIndex} = Reflect.get(target, minKey);
      const {max, index: maxIndex} = Reflect.get(target, maxKey);
      const originalMethod = descriptor.value;
      descriptor.value = function (...args: any[]) {
        const minValue = args[minIndex];
        const maxValue = args[maxIndex];
        if (minValue !== undefined && minValue < min) {
          throw new Error(`The min value must be greater than ${min}.`);
        }
        if (maxValue !== undefined && maxValue > max) {
          throw new Error(`The max value must be less than ${max}.`);
        }
        return originalMethod.apply(this, args);
      }
    }
  }

  /**
   * 参数装饰器：最大值，需要配合@validate使用
   * @param max
   */
  export function max(max: number): ParameterDecorator {
    return function (target: Object, propertyKey: string | symbol | undefined, index: number) {
      Reflect.set(target, maxKey, {max, index});
    }
  }

  /**
   * 参数装饰器：最小值，需要配合@validate使用
   * @param min
   */
  export function min(min: number): ParameterDecorator {
    return function (target: Object, propertyKey: string | symbol | undefined, index: number) {
      Reflect.set(target, minKey, {min, index});
    }
  }

  /**
   * 类装饰器：密封类，使其不可拓展
   */
  export function sealed(): ClassDecorator {
    return function <T extends Function>(target: T): T | void {
      Object.seal(target);
    }
  }
}

// 以下通过实例演示装饰器的使用
@LegacyDecorators.sealed() // 这里表示类被密封
class Cat {
  @LegacyDecorators.observable() // 这里使name属性变成了可观察的
  name?: string;

  @LegacyDecorators.logger() // 这里进行日志打印
  @LegacyDecorators.validate() // 这里进行参数校验
  sayHello(/*最大值为10，最小值为1*/@LegacyDecorators.max(10) @LegacyDecorators.min(1) age: number) {
    console.log(`Hello, my name is ${this.name}, I'm ${age} years old.`);
  }
}

// 实例化对象
const cat = new Cat();
// 调用name属性的setter
cat.name = "Tom";
// 调用sayHello方法
cat.sayHello(3);
// 打印Cat是否被密封
console.log(`Cat is sealed: ${Object.isSealed(Cat)}`);
```



## 5.装饰器的执行顺序
装饰器的执行顺序是先执行属性装饰器，再执行方法装饰器，再执行参数装饰器，最后执行类装饰器。同一类型装饰器，按照由下到上的顺序执行。

## 6. 总结
虽然Typescript同时支持装饰器的新旧两种语法，但不能混用，要么使用新语法，要么使用旧语法。而且两种装饰器在功能和类型上也不尽相同。需要根据具体场景来决定使用哪种装饰器。
