// function RequireAuth(allowedRoles: string[]) {
//     console.log('1. ВЫЗОВ ФАБРИКИ ДЕКОРАТОРА (выполняется при определении класса)');

//     return function(target: any, propertyKey: string, descriptor: PropertyDescriptor) {
//         console.log('2. ВЫЗОВ ФУНКЦИИ-ДЕКОРАТОРА (выполняется сразу после фабрики)');
//         console.log('   target:', target);
//         console.log('   propertyKey:', propertyKey);
//         console.log('   descriptor:', descriptor);

//         const originalMethod = descriptor.value;

//         descriptor.value = function(this: any, ...args: any[]) {
//             console.log('3. ВЫЗОВ ОБЕРНУТОЙ ФУНКЦИИ (выполняется при вызове метода)');
//             console.log('   this:', this);
//             console.log('   args:', args);

//             const userRole = this.role;
//             if (!allowedRoles.includes(userRole)) {
//                 throw new Error('Доступ запрещен');
//             }

//             return originalMethod.apply(this, args);
//         };

//         return descriptor;
//     };
// }

// class AdminPanel {
//     private role: string = 'user';

//     @RequireAuth(['admin'])  // ← Здесь вызывается фабрика декоратора
//     deleteUser(id: number) {
//         console.log('4. ВЫПОЛНЕНИЕ ОРИГИНАЛЬНОГО МЕТОДА');
//         console.log(`Пользователь ${id} удален`);
//     }
// }

// console.log('=== КЛАСС ОПРЕДЕЛЕН ===\n');
// const panel = new AdminPanel();
// console.log('=== ЭКЗЕМПЛЯР СОЗДАН ===\n');
// console.log('=== ВЫЗЫВАЕМ МЕТОД ===');
// panel.deleteUser(123);

// function setUsers(users: number) {
//     console.log('setUsers init');
//     return <T extends { new(...args: any[]): {} }>(target: T) => {
//         console.log('setUsers run');
//         target.prototype.users = users;
//         return target;
//     }
// }

// function log() {
//     console.log('log init');
//     return <T extends { new(...args: any[]): {} }>(target: T) => {
//         console.log('log run');
//         return target;
//     }
// }

// // 1. Сначала выполняются фабрики декораторов (сверху вниз)
// const logDecorator = log();           // "log init"
// const setUsersDecorator = setUsers(2); // "setUsers init"

// // 2. Оригинальный конструктор класса
// class UserService {
//     users: number;

//     // constructor() {
//     //     this.users = 1000;
//     // }
//     getUsersInDatabase() {
//         return this.users;
//     }
// }

// // 3. Применение декораторов
// const UserServiceAfterSetUsers = logDecorator(UserService)

// const FinalUserService = setUsersDecorator(UserServiceAfterSetUsers)

// // 4. Итоговый класс для создания экземпляров
// const finalObj = new FinalUserService()
// console.log(finalObj)
// console.log(finalObj.getUsersInDatabase());

// interface IUserService {
// 	users: number;
// 	getUsersInDatabase(): number;
// }

// // @nullUser
// @log()
// @setUsers(2)
// // @threeUserAdvanced
// // @setUserAdvanced(4)
// class UserService implements IUserService {
// 	users: number// = 1000;

// 	getUsersInDatabase(): number {
// 		return this.users;
// 	}
// }

// function nullUser(target: Function) {
// 	target.prototype.users = 0;
// }

// function setUsers(users: number) {
// 	console.log('setUsers init');
// 	return (target: Function) => {
// 		console.log('setUsers run');
// 		target.prototype.users = users;
// 	}
// }

// function log() {
// 	console.log('log init');
// 	return (target: Function) => {
// 		console.log('log run');
// 		// console.log(target);
// 	}
// }

// function setUserAdvanced(users: number) {
// 	return <T extends { new(...args: any[]): {} }>(constructor: T) => {
// 		return class extends constructor {
// 			users = users;
// 		}
// 	}
// }

// function threeUserAdvanced<T extends { new(...args: any[]): {} }>(constructor: T) {
// 	return class extends constructor {
// 		users = 3;
// 	}
// }

// console.log('вызов декорированого метода')
// // console.log(new UserService().getUsersInDatabase());

// function setUsers(users: number) {
// 	console.log('setUsers init');
// 	return (target: Function) => {
// 		console.log('setUsers run');
// 		target.prototype.users = users;
//         return target
// 	}
// }

// function log() {
// 	console.log('log init');
// 	return (target: Function) => {
// 		console.log('log run');
// 		// console.log(target);
//         return target
// 	}
// }

// function log(target: Function) {
// 	console.log('log run');
// 	return target
// }

// function setUserAdvanced(users: number) {
// 	return <T extends { new(...args: any[]): {} }>(constructor: T) => {
// 		return class extends constructor {
// 			users = users;
// 		}
// 	}
// }

// function setUserAdvanced2(users: number) {
// return <T extends { new(...args: any[]): {} }>(constructor: T) => {
// 	return class extends constructor {
// 		users = users;
// 	}
// }
// }

// interface IUserService {
// 	users: number;
// 	getUsersInDatabase(): number;
// }

// @setUserAdvanced(5)
// @setUserAdvanced2(10)
// class UserService implements IUserService {
// 	users: number// = 1000;

// 	getUsersInDatabase(): number {
// 		return this.users;
// 	}
// }

// // // Шаг 1: Получаем декораторы
// // const decorator1 = setUsers(2);  // "setUsers init"
// // const decorator2 = log();        // "log init"

// // decorator1(UserService)
// // decorator2(decorator1)

// // const finalObj = log(setUsers(2)(UserService))
// console.log(new UserService().getUsersInDatabase());

// function setUsers<T extends { new (...args: any[]): {} }>(users: number) {
//     console.log('setUsers init');
//     return (target: T): T => {
//         console.log('setUsers run');
//         target.prototype.users = users;
//         return target;  // TypeScript понимает, что это T
//     }
// }

// function setUsers(users: number) {
// 	console.log('setUsers init');
// 	return <T extends { new(...args: any[]): {} }>(constructor: T) => {
//         console.log('setUsers run');
// 		return class extends constructor {
// 			users = users;
// 		}
// 	}
// }

// interface IUserService {
// 	users: number;
// 	getUsersInDatabase(): number;
// }

// @setUsers(10)
// @setUsers(5)
// class UserService implements IUserService {
// 	users: number// = 1000;

// 	getUsersInDatabase(): number {
// 		return this.users;
// 	}
// }

// // // Шаг 1: Получаем декораторы
// // const decorator1 = setUsers(2);  // "setUsers init"
// // const decorator2 = log();        // "log init"

// // decorator1(UserService)
// // decorator2(decorator1)

// // const finalObj = log(setUsers(2)(UserService))
// console.log(new UserService().getUsersInDatabase());

// function setUsers(users: number) {
//     console.log(`setUsers init ${users}`,);
//     return <T extends { new(...args: any[]): {} }>(constructor: T) => {
//         console.log(`setUsers run ${users}`);
//         const instance = new constructor()
//         console.log(instance)
//         const newClass = class extends constructor {
//             users = users;
//         }
//         return newClass;
//     }
// }

// @setUsers(10)
// @setUsers(5)
// class UserService {
//     users: number = 0;
//     getUsersInDatabase(): number {
//         return this.users;
//     }
// }

// const instance = new UserService();

// interface IUserService {
// 	users: number;
// 	getUsersInDatabase(): number;
// }

// @log()
// @setUsers(2)
// class UserService implements IUserService {
// 	users: number;

// 	getUsersInDatabase(): number {
// 		return this.users;
// 	}
// }

// function setUsers(users: number) {
// 	console.log('setUsers init');
// 	return (target: Function) => {
// 		console.log('setUsers run');
// 		target.prototype.users = users;
// 	}
// }

// function log() {
// 	console.log('log init');
// 	return (target: Function) => {
// 		console.log('log run');
// 		console.log(target.prototype.users);
// 	}
// }

// console.log(new UserService().getUsersInDatabase());

// Опции декоратора (рефакторинг через объект)
interface CatchOptions {
  rethrow?: boolean; // пробрасывать ошибку дальше
  logError?: boolean; // логировать ошибку
  customMessage?: string; // кастомное сообщение
}

// Фабрика декоратора
function Catch(options: CatchOptions = { rethrow: false, logError: true }) {
  return function (
    _: any,
    propertyKey: string,
    descriptor: PropertyDescriptor,
  ) {
    const originalMethod = descriptor.value;

    // Определяем, асинхронный ли метод
    const isAsync = originalMethod.constructor.name === "AsyncFunction";

    if (isAsync) {
      // Для асинхронных функций
      descriptor.value = async function (...args: any[]) {
        try {
          return await originalMethod.apply(this, args);
        } catch (error) {
          handleError(error, options, propertyKey);
        }
      };
    } else {
      // Для синхронных функций
      descriptor.value = function (...args: any[]) {
        try {
          return originalMethod.apply(this, args);
        } catch (error) {
          handleError(error, options, propertyKey);
        }
      };
    }

    return descriptor;
  };
}

// Вспомогательная функция обработки ошибок
function handleError(error: any, options: CatchOptions, methodName: string) {
  // Логирование ошибки
  if (options.logError !== false) {
    console.error(
      `[Error in ${methodName}]:`,
      options.customMessage || error.message || error,
    );
    console.error(error.stack);
  }

  // Проброс ошибки дальше
  if (options.rethrow) {
    throw error;
  }

  // Если не пробрасываем, возвращаем undefined или значение по умолчанию
  return undefined;
}

class UserService {
  // Синхронный метод с перехватом ошибки (без проброса)
  @Catch({ logError: true, rethrow: false })
  findUser(id: number) {
    if (id <= 0) {
      throw new Error("Invalid user id");
    }
    return { id, name: "John" };
  }

  // Асинхронный метод с пробросом ошибки
  @Catch({ logError: true, rethrow: true, customMessage: "API Error" })
  async fetchUserFromAPI(id: number) {
    const response = await fetch(`/api/users/${id}`);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    return response.json();
  }

  // Метод с тихим логированием (только стек)
  @Catch({ logError: true, rethrow: false })
  processData(data: any) {
    JSON.parse(data); // может выбросить ошибку
    return data;
  }
}

// Использование
const service = new UserService();

// Ошибка перехвачена, залогирована, но не проброшена
const result1 = service.findUser(-1);
console.log(result1); // undefined

// Ошибка перехвачена, залогирована И проброшена дальше
async function testFetchUserFromAPI() {
  try {
    await service.fetchUserFromAPI(999);
  } catch (error) {
    console.log("Поймали в вызывающем коде:", error);
  }
}

testFetchUserFromAPI()