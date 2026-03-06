// class User {
//   skills: string[] = [];

//   addSkill(skill?: string): void;
//   addSkill(skills?: string[]): void;
//   addSkill(skillOrSkills?: string | string[]) {
//     if (typeof skillOrSkills === "string") {
//       this.skills.push(skillOrSkills);
//     } else if (skillOrSkills instanceof Array) {
//       //     this.skills = this.skills.concat(skillOrSkills);
//       this.skills.push(...skillOrSkills);
//     }
//   }
// }

// const user = new User();
// user.addSkill("TypeScript");
// user.addSkill(["Go", "React", "Redux"]);
// user.addSkill();

// console.log(user.skills);


// class UserService {
//     // Три ОБЕЩАНИЯ, но одна реализация
//     findUser(id: number): void;
//     findUser(name: string): void;
//     findUser(age: number, city: string): void;
//     // findUser(age: number, name: string): void; // проблема
//     findUser(a: number | string, b?: string) {
//         // Здесь адский код с instanceof, typeof, проверкой количества аргументов
//         if (typeof a === 'number' && b === undefined) {
//             // поиск по id
//         } else if (typeof a === 'string') {
//             // поиск по имени  
//         } else if (typeof a === 'number' && typeof b === 'string') {
//             // поиск по возрасту и городу
//         }
//     }
// }

// const user = new UserService()
// user.findUser()

// type SearchParams = 
//     | { type: 'id', id: number }
//     | { type: 'name', name: string }
//     | { type: 'age-city', age: number, city: string }
//     | { type: 'age-name', age: number, name: string };

// class UserService {
//     findUser(params: SearchParams) {
//         switch (params.type) {
//             case 'id':
//                 // поиск по id
//                 break;
//             case 'name':
//                 // поиск по имени
//                 break;
//             case 'age-city':
//                 // поиск по возрасту и городу
//                 break;
//             case 'age-name':
//                 // поиск по возрасту и имени
//                 break;
//         }
//     }
// }


// class UserService {
//     findUser(params: {
//         id?: number;
//         name?: string;
//         age?: number;
//         city?: string;
//     }) {
//         if (params.id !== undefined) {
//             console.log('Поиск по id:', params.id);
//         } else if (params.name !== undefined && params.age === undefined) {
//             console.log('Поиск по имени:', params.name);
//         } else if (params.age !== undefined && params.city !== undefined && params.name === undefined) {
//             console.log('Поиск по возрасту и городу:', params.age, params.city);
//         } else if (params.age !== undefined && params.name !== undefined && params.city === undefined) {
//             console.log('Поиск по возрасту и имени:', params.age, params.name);
//         }
//     }
// }

// // Использование:
// service.findUser({ id: 123 });
// service.findUser({ name: "Иван" });
// service.findUser({ age: 25, city: "Москва" });
// service.findUser({ age: 25, name: "Иван" });

// Но тут есть проблема — нужно следить за уникальностью комбинаций. Может быть ситуация, когда передали несколько параметров одновременно.

// Поэтому discriminated union с type все же надежнее — он явно говорит, какой именно поиск нужен:

// typescript
// service.findUser({ type: 'id', id: 123 });
// service.findUser({ type: 'name', name: "Иван" });
// service.findUser({ type: 'age-city', age: 25, city: "Москва" });
// service.findUser({ type: 'age-name', age: 25, name: "Иван" });
// Да, это чуть многословнее, зато однозначно и типобезопасно!