// Абстракция
interface Logger {
  log(message: string): void;
  error(message: string): void;
}

// Одна имплементация
class ConsoleLogger implements Logger {
  log(message: string): void {
    console.log(`[LOG]: ${message}`);
  }
  
  error(message: string): void {
    console.error(`[ERROR]: ${message}`);
  }
}

// Другая имплементация
class FileLogger implements Logger {
  log(message: string): void {
    // Запись в файл
  }
  
  error(message: string): void {
    // Запись ошибки в файл
  }
}

// Класс, который получает зависимость через конструктор (DI)
class UserService {
  constructor(private logger: Logger) {} // Внедрение зависимости!
  
  createUser(name: string): void {
    try {
      // логика создания пользователя
      this.logger.log(`User ${name} created`);
    } catch (error) {
      this.logger.error(`Failed to create user: ${error}`);
    }
  }
}

// Использование с разными реализациями
const consoleLogger = new ConsoleLogger();
const userServiceWithConsole = new UserService(consoleLogger); // DI

const fileLogger = new FileLogger();
const userServiceWithFile = new UserService(fileLogger); // DI


// Репозиторий с разными источниками данных

// interface ProductRepository {
//   getProducts(): Promise<Product[]>;
//   getProductById(id: string): Promise<Product | null>;
// }

// // Имплементация для REST API
// class ApiProductRepository implements ProductRepository {
//   async getProducts(): Promise<Product[]> {
//     const response = await fetch('/api/products');
//     return response.json();
//   }
// }

// // Имплементация для локального хранилища
// class LocalProductRepository implements ProductRepository {
//   async getProducts(): Promise<Product[]> {
//     const data = localStorage.getItem('products');
//     return data ? JSON.parse(data) : [];
//   }
// }

// Имплементация интерфейсов классами

// // Объявление контракта
// interface UserRepository {
//   findById(id: string): Promise<User | null>;
//   save(user: User): Promise<void>;
//   delete(id: string): Promise<boolean>;
// }

// // Имплементация конкретным классом
// class PostgresUserRepository implements UserRepository {
//   async findById(id: string): Promise<User | null> {
//     // Конкретная логика работы с PostgreSQL
//     const result = await db.query('SELECT * FROM users WHERE id = $1', [id]);
//     return result.rows[0] || null;
//   }

//   async save(user: User): Promise<void> {
//     // Имплементация сохранения
//     await db.query('INSERT INTO users ...', [user]);
//   }

//   async delete(id: string): Promise<boolean> {
//     // Имплементация удаления
//     const result = await db.query('DELETE FROM users WHERE id = $1', [id]);
//     return result.rowCount > 0;
//   }
// }