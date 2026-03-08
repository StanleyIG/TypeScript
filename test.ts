// Когда вы вызываете new User(25) - это число, но какой это параметр? age или name? TypeScript не знает.

// constructor(name?: string, age?: number) дерьмо

// class User {
//   name: string;
//   age: number;

//   constructor(age?: number);
//   constructor(name?: string);
//   constructor(name?: string, age?: number) {
//     if (typeof age == "number") {
//       this.age = age;
//     }
//     if (typeof name == "string") {
//       this.name = name;
//     }
//   }
// }


class User {
    name: string;
    age: number;

    constructor();
    constructor(age: number);
    constructor(name: string);
    constructor(param?: string | number) {
        if (typeof param === 'number') {
            this.age = param;
        } else if (typeof param === 'string') {
            this.name = param;
        }
    }
}