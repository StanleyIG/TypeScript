interface IUserService {
	users: number;
	getUsersInDatabase(): number;
}

class UserService implements IUserService {
	@Max(100)
	users: number;

	getUsersInDatabase(): number {
		throw new Error('Ошибка');
	}
}

// function Max(max: number) {
// 	return (
// 		target: Object,
// 		propertyKey: string | symbol
// 	) => {
// 		let value: number | undefined;
//         console.log(`value: ${value}`)
// 		const setter = function (newValue: number) {
// 			if (newValue > max) {
// 				console.log(`Нельзя установить значение больше ${max}`);
// 			} else {
// 				value = newValue;
// 			}
// 		}

// 		const getter = function () {
// 			return value;
// 		}

// 		Object.defineProperty(target, propertyKey, {
// 			set: setter,
// 			get: getter
// 		});
// 	}
// }

// Это можно сказать баг в коде. Для всех инстансов свойство users теперь будет 1 по дефолту.

// Исправление:

function Max(max: number) {
    return (target: Object, propertyKey: string | symbol) => {
        // Использовать WeakMap для хранения значений каждого экземпляра
        const values = new WeakMap<any, number>();
        
        Object.defineProperty(target, propertyKey, {
            set: function(newValue: number) {
                if (newValue > max) {
                    console.log(`Нельзя установить значение больше ${max}`);
                } else {
                    values.set(this, newValue);  // храним для конкретного экземпляра
                }
            },
            get: function() {
                return values.get(this);
            }
        });
    }
}

// new WeakMap<any, number>() Хранит слабые ссылки, так что запись автоматически исчезнет из WeakMap.
// Код проверила языковая модель DeepSeek v3. Я просто спросил пару моментов, но она ещё и этот баг выявила.

const userService = new UserService();
userService.users = 1;
console.log(userService.users);

const userService2 = new UserService();
console.log(userService2.users);
userService2.users = 7
console.log(userService2.users);