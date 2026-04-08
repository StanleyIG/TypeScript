// function Uni(name: string): any {
//   console.log(`Инициализация: ${name}`);
//   return function () {
//     console.log(`Вызов: ${name}`);
//   };
// }

// // На заметку:
// // TypeScript делает примерно следующее:

// // const originalDescriptor = Object.getOwnPropertyDescriptor(MyClass.prototype, 'method');
// // const decoratorResult = Uni("Метод")()(MyClass.prototype, 'method', originalDescriptor);

// // // Если decoratorResult === undefined, используем originalDescriptor
// // const finalDescriptor = decoratorResult || originalDescriptor;
// // Object.defineProperty(MyClass.prototype, 'method', finalDescriptor);
// // Тут поведение отличается от Python

// @Uni("Класс1")
// @Uni("Класс2")
// class MyClass {
//   @Uni("Метод")
//   method(@Uni("Параметр метода") _: any) {}

//   constructor(@Uni("Параметр конструктора") _: any) {}

//   @Uni("Свойство 3")
//   props3?: any;

//   @Uni("Свойство 1")
//   props?: any;

//   @Uni("Свойство static")
//   static prop2?: any;

//   @Uni("Метод static")
//   static method2(@Uni("Параметр метода static") _: any) {}
// }

// const obj = new MyClass(1);
// obj.method(2);


class Flight<T> {
	constructor(private dest: readonly T[]) {

	}

	fly(to: T) {

	}
}

const obj = new Flight(["RU", "GB"])
obj.fly('asdfsad')