// Asserts в TypeScript
// Assertion functions (функции-утверждения) — это специальный тип функций, которые сообщают TypeScript о том, что некоторое условие выполняется.

// function assertString(value: unknown): asserts value is string {
//   if (typeof value !== "string") {
//     throw new Error("Value must be a string");
//   }
// }

// function processValue(value: unknown) {
//   assertString(value); // TypeScript теперь знает: value — строка
//   console.log(value.toUpperCase()); // ✅ OK
// }

interface User {
  name: string;
  age?: number;
  email?: string;
}

// // Простая функция-проверка
// function isUser(obj: unknown): obj is User {
//   return (
//     typeof obj === "object" &&
//     !!obj &&
//     "name" in obj &&
//     typeof (obj as any).name === "string"
//   );
// }

// // Использование - требует проверки в if
// function processUserData(data: unknown) {
//   if (isUser(data)) {
//     // Только здесь TypeScript знает, что data - User
//     console.log(`User name: ${data.name}`);
//   } else {
//     throw new Error("Invalid user data");
//   }
// }

////////////////
// Реализация с asserts

// Функция с asserts - выбрасывает ошибку при несоответствии
function assertUser(obj: unknown): asserts obj is User {
  if (
    typeof obj === "object" &&
    !!obj &&
    "name" in obj &&
    typeof (obj as any).name === "string"
  ) {
    return;
  }
  throw new Error("User object is null or undefined");
}

// Использование - чисто и лаконично
function processUserData(data: unknown) {
  assertUser(data); // Если ошибка - выбрасывается исключение
  // TypeScript уверен, что data - User!
  console.log(`User name: ${data.name}`);

  if (data.age) {
    console.log(`User age: ${data.age}`);
  }

  if (data.email) {
    console.log(`User email: ${data.email}`);
  }
}

// Пример использования
try {
  const apiResponse: unknown = {
    name: "John Doe",
    age: 30,
    email: "john@example.com",
  };

  processUserData(apiResponse); // ✅ Работает корректно

  const invalidResponse: unknown = {
    age: 25,
    // Нет свойства name
  };

  processUserData(invalidResponse); // ❌ Выбросит ошибку "User must have a name property"
} catch (error) {
  if (error instanceof Error) {
    console.error("Error processing user:", error.message);
  }
}
