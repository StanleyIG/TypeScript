// TypeScript

// Абстрактный класс Logger
abstract class Logger {
    // Абстрактный метод - должен быть реализован в наследниках
    abstract log(message: string): void;
    
    // Конкретный метод для вывода даты
    printDate(date: Date): void {
        this.log(date.toString());
    }
}

// Класс-наследник
class MyLogger extends Logger {
    // Реализация абстрактного метода
    log(message: string): void {
        console.log(message);
    }
    
    // Метод для вывода даты и сообщения
    logWithDate(message: string): void {
        // Сначала выводим дату
        this.printDate(new Date());
        // Потом выводим сообщение
        this.log(message);
    }
}

// Пример использования
const logger = new MyLogger();
logger.logWithDate('Hello, World!');