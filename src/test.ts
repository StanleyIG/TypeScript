// Chain of Command

// interface IMiddleware {
// 	next(mid: IMiddleware): IMiddleware;
// 	handle(request: any): any;
// }

// abstract class AbstractMiddleware implements IMiddleware {
// 	private nextMiddleware: IMiddleware;

// 	next(mid: IMiddleware): IMiddleware {
// 		this.nextMiddleware = mid;
// 		return mid;
// 	}

// 	handle(request: any) {
// 		if (this.nextMiddleware) {
// 			return this.nextMiddleware.handle(request);
// 		}
// 		return;
// 	}
// }

// class AuthMiddleware extends AbstractMiddleware {
// 	override handle(request: any) {
// 		console.log('AuthMiddleware');
// 		if (request.userId === 1) {
// 			return super.handle(request);
// 		}
// 		return { error: 'Вы не авторизованы' };
// 	}
// }

// class ValidateMiddleware extends AbstractMiddleware {
// 	override handle(request: any) {
// 		console.log('ValidateMiddleware');
// 		if (request.body) {
// 			return super.handle(request);
// 		}
// 		return { error: 'Нет body' };
// 	}
// }

// class Controller extends AbstractMiddleware {
// 	override handle(request: any) {
// 		console.log('Controller');
// 		return { success: request };
// 	}
// }

// const controller = new Controller();
// const validate = new ValidateMiddleware();
// const auth = new AuthMiddleware();

// auth.next(validate).next(controller);

// console.log(auth.handle({
// 	userId: 1,
// 	body: 'I am OK!'
// }));


////////////////// Middleware //////////////////

// // Middleware (цикличный):
// // Auth (до) -> Validate (до) -> Controller
// // Auth (после) <- Validate (после) <- (Ответ)
// // Пример:
// // 📝 Logger: --> POST /api/data <-- 1
// // 🔐 AuthMiddleware: Начало проверки <-- 2
// // ✅ ValidateMiddleware: Проверка body <-- 3
// // Controller: Обработка запроса <-- 4
// // ✅ ValidateMiddleware: Валидация ответа пройдена <-- 3
// // 🔐 AuthMiddleware: Завершение (логирование выхода) <-- 2
// // 📝 Logger: <-- POST /api/data 200 (1ms) <-- 1
// // Итоговый ответ: { success: true, data: 'I am OK!', userId: 1 }

// // В middleware используется "луковичная" (onion) модель: запрос проходит цепочку вниз, а ответ проходит ту же цепочку обратно вверх.

// interface IMiddleware {
//     use(context: any, next: () => Promise<void>): Promise<void>;
// }

// // --- Middleware Implementations ---

// class AuthMiddleware implements IMiddleware {
//     async use(ctx: any, next: () => Promise<void>) {
//         console.log('🔐 AuthMiddleware: Начало проверки');
        
//         if (ctx.userId === 1) {
//             await next(); // Идем вглубь
//             console.log('🔐 AuthMiddleware: Завершение (логирование выхода)');
//         } else {
//             console.log('🔐 AuthMiddleware: Доступ запрещен');
//             ctx.body = { error: 'Вы не авторизованы' };
//             ctx.status = 401;
//             // next() не вызываем, цепочка прерывается
//         }
//     }
// }

// class ValidateMiddleware implements IMiddleware {
//     async use(ctx: any, next: () => Promise<void>) {
//         console.log('✅ ValidateMiddleware: Проверка body');
        
//         if (ctx.body) {
//             await next();
//             console.log('✅ ValidateMiddleware: Валидация ответа пройдена');
//         } else {
//             ctx.body = { error: 'Нет body' };
//             ctx.status = 400;
//         }
//     }
// }

// class LoggerMiddleware implements IMiddleware {
//     async use(ctx: any, next: () => Promise<void>) {
//         const start = Date.now();
//         console.log(`📝 Logger: --> ${ctx.method} ${ctx.path}`);
        
//         await next();
        
//         const ms = Date.now() - start;
//         console.log(`📝 Logger: <-- ${ctx.method} ${ctx.path} ${ctx.status} (${ms}ms)`);
//     }
// }

// class Controller implements IMiddleware {
//     async use(ctx: any, next: () => Promise<void>) {
//         console.log('Controller: Обработка запроса');
        
//         // Имитация работы с БД
//         ctx.body = { 
//             success: true, 
//             data: ctx.body,
//             userId: ctx.userId 
//         };
//         ctx.status = 200;
        
//         await next(); 
//     }
// }

// // --- Компоновщик (Composer / Dispatcher) ---
// // Это "сердце" фреймворка, которое превращает список в луковицу

// class MiddlewareRunner {
//     private middlewares: IMiddleware[] = [];

//     use(middleware: IMiddleware) {
//         this.middlewares.push(middleware);
//         return this; // Для чейнинга .use().use()
//     }

//     // Рекурсивная функция, которая строит цепочку next() вызовов
//     private compose(ctx: any): () => Promise<void> {
//         let index = -1;
        
//         const dispatch = (i: number): Promise<void> => {
//             // Защита от множественного вызова next() в одном middleware
//             if (i <= index) return Promise.reject(new Error('next() called multiple times'));
//             index = i;
            
//             const middleware = this.middlewares[i];
            
//             if (!middleware) {
//                 // Дошли до конца цепочки
//                 return Promise.resolve();
//             }
            
//             try {
//                 // Вызываем middleware.use, передавая ctx и функцию вызова следующего
//                 return Promise.resolve(middleware.use(ctx, () => dispatch(i + 1)));
//             } catch (err) {
//                 return Promise.reject(err);
//             }
//         };
        
//         return () => dispatch(0);
//     }

//     async run(initialContext: any) {
//         const ctx = {
//             status: 404,
//             body: undefined,
// 			...initialContext,
//         };
        
//         try {
//             const fn = this.compose(ctx);
//             await fn();
//         } catch (err) {
//             console.error('💥 Ошибка в цепочке middleware:', err);
//             ctx.status = 500;
//             ctx.body = { error: 'Внутренняя ошибка сервера' };
//         }
        
//         return ctx;
//     }
// }

// --- Использование (имитация HTTP запроса) ---

// async function main() {
//     const app = new MiddlewareRunner();

//     // Регистрируем middleware в нужном порядке
//     app.use(new LoggerMiddleware())
//        .use(new AuthMiddleware())
//        .use(new ValidateMiddleware())
//        .use(new Controller());

//     console.log('\n--- 🟢 Сценарий 1: Успешный запрос (userId = 1) ---');
//     const ctx1 = await app.run({
//         userId: 1,
//         body: 'I am OK!',
//         method: 'POST',
//         path: '/api/data'
//     });
//     console.log('Итоговый ответ:', ctx1.body);

//     console.log('\n--- 🔴 Сценарий 2: Ошибка авторизации (userId = 2) ---');
//     const ctx2 = await app.run({
//         userId: 2,
//         body: 'Hack attempt',
//         method: 'POST',
//         path: '/api/data'
//     });
//     console.log('Итоговый ответ:', ctx2.body);

//     console.log('\n--- 🟡 Сценарий 3: Нет body ---');
//     const ctx3 = await app.run({
//         userId: 1,
//         // body отсутствует
//         method: 'POST',
//         path: '/api/data'
//     });
//     console.log('Итоговый ответ:', ctx3.body);
// }

// main();

/////////////////////////// Mediator /////////////////////////

// interface Mediator {
// 	notify(sender: string, event: string, data?: any): void;
// }

// abstract class Mediated {
// 	mediator: Mediator;
// 	setMediator(mediator: Mediator) {
// 		this.mediator = mediator;
// 	}
// }

/////////////////////////// Сервисы (получатели) /////////////////////////

// class Notifications {
// 	send(message: string = 'Уведомление') {
// 		console.log(`📧 Отправляю уведомление: ${message}`);
// 	}
// }

// class Log {
// 	log(message: string) {
// 		console.log(`📝 [LOG]: ${message}`);
// 	}
// }

// class Database {
// 	save(data: any) {
// 		console.log(`💾 Сохраняю в БД:`, data);
// 	}
	
// 	delete(id: number) {
// 		console.log(`🗑️ Удаляю из БД запись с ID: ${id}`);
// 	}
// }

// class MyCache {
// 	clear() {
// 		console.log(`🧹 Очищаю кэш`);
// 	}
// }

// class EmailService {
// 	sendWelcome(email: string) {
// 		console.log(`✉️ Отправляю приветственное письмо на ${email}`);
// 	}
// }

/////////////////////////// Компоненты-инициаторы /////////////////////////

// class EventHandler extends Mediated {
// 	myEvent() {
// 		console.log('\n🔵 EventHandler: Сработало myEvent');
// 		this.mediator.notify('EventHandler', 'myEvent');
// 	}
	
// 	importantEvent(data: string) {
// 		console.log('\n🔵 EventHandler: Важное событие с данными:', data);
// 		this.mediator.notify('EventHandler', 'importantEvent', { payload: data });
// 	}
// }

// class UserService extends Mediated {
// 	createUser(name: string, email: string) {
// 		console.log(`\n👤 UserService: Создаю пользователя ${name}`);
// 		this.mediator.notify('UserService', 'userCreated', { name, email });
// 	}
	
// 	deleteUser(id: number) {
// 		console.log(`\n👤 UserService: Удаляю пользователя ${id}`);
// 		this.mediator.notify('UserService', 'userDeleted', { id });
// 	}
// }

// class PaymentProcessor extends Mediated {
// 	processPayment(amount: number) {
// 		console.log(`\n💰 PaymentProcessor: Обрабатываю платеж на сумму ${amount}`);
// 		this.mediator.notify('PaymentProcessor', 'paymentSuccess', { amount });
// 	}
	
// 	paymentFailed(reason: string) {
// 		console.log(`\n💰 PaymentProcessor: Платеж не прошел: ${reason}`);
// 		this.mediator.notify('PaymentProcessor', 'paymentFailed', { reason });
// 	}
// }

// class AuthService extends Mediated {
// 	login(username: string) {
// 		console.log(`\n🔐 AuthService: Пользователь ${username} вошел в систему`);
// 		this.mediator.notify('AuthService', 'userLoggedIn', { username });
// 	}
	
// 	logout(username: string) {
// 		console.log(`\n🔐 AuthService: Пользователь ${username} вышел из системы`);
// 		this.mediator.notify('AuthService', 'userLoggedOut', { username });
// 	}
// }

// /////////////////////////// Главный Медиатор /////////////////////////

// class AppMediator implements Mediator {
// 	constructor(
// 		private notifications: Notifications,
// 		private logger: Log,
// 		private database: Database,
// 		private cache: MyCache,
// 		private emailService: EmailService
// 	) {}

// 	notify(sender: string, event: string, data?: any): void {
// 		this.logger.log(`Получено событие "${event}" от ${sender}`);
		
// 		switch (event) {
// 			// События от EventHandler
// 			case 'myEvent':
// 				this.notifications.send('Простое событие');
// 				this.logger.log('Обработано простое событие');
// 				break;
				
// 			case 'importantEvent':
// 				this.notifications.send(`ВАЖНО: ${data?.payload}`);
// 				this.database.save({ type: 'important', data: data?.payload });
// 				this.logger.log('Важное событие сохранено в БД');
// 				break;
			
// 			// События от UserService
// 			case 'userCreated':
// 				this.database.save({ type: 'user', ...data });
// 				this.emailService.sendWelcome(data.email);
// 				this.cache.clear();
// 				this.notifications.send(`Новый пользователь: ${data.name}`);
// 				this.logger.log(`Пользователь ${data.name} создан, кэш очищен`);
// 				break;
				
// 			case 'userDeleted':
// 				this.database.delete(data.id);
// 				this.cache.clear();
// 				this.logger.log(`Пользователь ${data.id} удален`);
// 				break;
			
// 			// События от PaymentProcessor
// 			case 'paymentSuccess':
// 				this.database.save({ type: 'payment', ...data });
// 				this.notifications.send(`Платеж на сумму ${data.amount} успешно обработан`);
// 				this.logger.log(`Платеж ${data.amount} сохранен`);
// 				break;
				
// 			case 'paymentFailed':
// 				this.logger.log(`ОШИБКА ПЛАТЕЖА: ${data.reason}`);
// 				this.notifications.send(`Проблема с платежом: ${data.reason}`);
// 				break;
			
// 			// События от AuthService
// 			case 'userLoggedIn':
// 				this.logger.log(`Пользователь ${data.username} авторизован`);
// 				this.cache.clear();
// 				break;
				
// 			case 'userLoggedOut':
// 				this.logger.log(`Пользователь ${data.username} вышел`);
// 				this.cache.clear();
// 				break;
				
// 			default:
// 				this.logger.log(`Неизвестное событие: ${event}`);
// 		}
// 	}
// }

/////////////////////////// Инициализация и демонстрация /////////////////////////

// Создаем сервисы
// const notifications = new Notifications();
// const logger = new Log();
// const database = new Database();
// const cache = new MyCache();
// const emailService = new EmailService();

// // Создаем медиатор
// const mediator = new AppMediator(
// 	notifications,
// 	logger,
// 	database,
// 	cache,
// 	emailService
// );

// // Создаем и связываем компоненты
// const eventHandler = new EventHandler();
// const userService = new UserService();
// const paymentProcessor = new PaymentProcessor();
// const authService = new AuthService();

// eventHandler.setMediator(mediator);
// userService.setMediator(mediator);
// paymentProcessor.setMediator(mediator);
// authService.setMediator(mediator);

// // Демонстрация работы
// console.log('=== ДЕМОНСТРАЦИЯ ПАТТЕРНА MEDIATOR ===\n');

// eventHandler.myEvent();
// eventHandler.importantEvent('Нужно срочно проверить сервер!');

// userService.createUser('Иван Петров', 'ivan@example.com');
// userService.deleteUser(42);

// paymentProcessor.processPayment(1500);
// paymentProcessor.paymentFailed('Недостаточно средств');

// authService.login('ivan_petrov');
// authService.logout('ivan_petrov');

// console.log('\n=== РАБОТА ЗАВЕРШЕНА ===');


/////////////////////////// Паттерн COMMAND (базовые классы) /////////////////////////

// class User {
// 	constructor(public userId: number, public name?: string) { }
// }

// class CommandHistory {
// 	public commands: Command[] = [];
// 	push(command: Command) {
// 		this.commands.push(command);
// 	}
// 	remove(command: Command) {
// 		this.commands = this.commands.filter(c => c.commandId !== command.commandId);
// 	}
// }

// abstract class Command {
// 	public commandId: number;
// 	abstract execute(): void;
// 	abstract undo(): void;

// 	constructor(public history: CommandHistory) {
// 		this.commandId = Math.random();
// 	}
// }

// /////////////////////////// Разные ПОЛУЧАТЕЛИ (Receivers) /////////////////////////

// // 1. Локальный сервис
// class UserService {
// 	saveUser(user: User) {
// 		console.log(`💾 [UserService] Сохраняю пользователя ${user.userId} в БД`);
// 	}
// 	deleteUser(userId: number) {
// 		console.log(`🗑️ [UserService] Удаляю пользователя ${userId} из БД`);
// 	}
// }

// // 2. WebSocket сервис (отправка на сервер)
// class WebSocketService {
// 	private ws: any = { send: (data: string) => console.log(`📡 [WebSocket] Отправляю: ${data}`) };
	
// 	sendCreateUser(user: User) {
// 		this.ws.send(JSON.stringify({ action: 'CREATE_USER', userId: user.userId }));
// 		console.log(`📡 [WebSocket] Запрос на создание пользователя ${user.userId} отправлен`);
// 	}
	
// 	sendDeleteUser(userId: number) {
// 		this.ws.send(JSON.stringify({ action: 'DELETE_USER', userId }));
// 		console.log(`📡 [WebSocket] Запрос на удаление пользователя ${userId} отправлен`);
// 	}
// }

// // 3. Email сервис
// class EmailService {
// 	sendWelcomeEmail(user: User) {
// 		console.log(`📧 [Email] Отправляю приветственное письмо пользователю ${user.userId}`);
// 	}
// 	sendGoodbyeEmail(userId: number) {
// 		console.log(`📧 [Email] Отправляю прощальное письмо пользователю ${userId}`);
// 	}
// }

// // 4. Кэш сервис
// class CacheService {
// 	set(key: string, value: any) {
// 		console.log(`🗃️ [Cache] Сохраняю в кэш: ${key}`);
// 	}
// 	remove(key: string) {
// 		console.log(`🧹 [Cache] Удаляю из кэша: ${key}`);
// 	}
// }

// /////////////////////////// Команды для РАЗНЫХ получателей /////////////////////////

// // Команда для локального сохранения
// class AddUserCommand extends Command {
// 	constructor(
// 		private user: User,
// 		private receiver: UserService,
// 		history: CommandHistory
// 	) {
// 		super(history);
// 	}

// 	execute(): void {
// 		this.receiver.saveUser(this.user);
// 		this.history.push(this);
// 	}

// 	undo(): void {
// 		this.receiver.deleteUser(this.user.userId);
// 		this.history.remove(this);
// 	}
// }

// // Команда для WebSocket (асинхронная операция)
// class AddUserWebSocketCommand extends Command {
// 	constructor(
// 		private user: User,
// 		private receiver: WebSocketService,
// 		history: CommandHistory
// 	) {
// 		super(history);
// 	}

// 	execute(): void {
// 		this.receiver.sendCreateUser(this.user);
// 		this.history.push(this);
// 	}

// 	undo(): void {
// 		this.receiver.sendDeleteUser(this.user.userId);
// 		this.history.remove(this);
// 	}
// }

// // Команда, затрагивающая НЕСКОЛЬКО сервисов (композитная)
// class AddUserWithEmailCommand extends Command {
// 	constructor(
// 		private user: User,
// 		private dbService: UserService,
// 		private emailService: EmailService,
// 		private cacheService: CacheService,
// 		history: CommandHistory
// 	) {
// 		super(history);
// 	}

// 	execute(): void {
// 		this.dbService.saveUser(this.user);
// 		this.emailService.sendWelcomeEmail(this.user);
// 		this.cacheService.set(`user_${this.user.userId}`, this.user);
// 		this.history.push(this);
// 		console.log('✅ Пользователь создан полностью (БД + Email + Кэш)');
// 	}

// 	undo(): void {
// 		this.dbService.deleteUser(this.user.userId);
// 		this.emailService.sendGoodbyeEmail(this.user.userId);
// 		this.cacheService.remove(`user_${this.user.userId}`);
// 		this.history.remove(this);
// 		console.log('↩️ Создание пользователя отменено');
// 	}
// }

// /////////////////////////// РАЗНЫЕ источники команд (Invokers) /////////////////////////

// // 1. HTTP Controller (как у вас)
// class HttpController {
// 	private receiver: UserService;
// 	private history: CommandHistory = new CommandHistory();

// 	setReceiver(receiver: UserService) {
// 		this.receiver = receiver;
// 	}

// 	handleCreateUser(userId: number) {
// 		const command = new AddUserCommand(
// 			new User(userId, `User${userId}`),
// 			this.receiver,
// 			this.history
// 		);
// 		command.execute();
// 		return command; // Возвращаем для возможного undo
// 	}
// }

// // 2. WebSocket Server Handler (источник - входящее сообщение)
// class WebSocketHandler {
// 	private history: CommandHistory = new CommandHistory();
	
// 	constructor(
// 		private dbService: UserService,
// 		private wsService: WebSocketService,
// 		private emailService: EmailService,
// 		private cacheService: CacheService
// 	) {}

// 	// Имитация получения сообщения по WebSocket
// 	onMessage(message: string) {
// 		console.log(`\n📨 [WebSocket] Получено сообщение: ${message}`);
// 		const data = JSON.parse(message);
		
// 		let command: Command;
		
// 		switch(data.action) {
// 			case 'CREATE_USER':
// 				command = new AddUserWithEmailCommand(
// 					new User(data.userId, data.name),
// 					this.dbService,
// 					this.emailService,
// 					this.cacheService,
// 					this.history
// 				);
// 				break;
// 			case 'SYNC_TO_SERVER':
// 				command = new AddUserWebSocketCommand(
// 					new User(data.userId),
// 					this.wsService,
// 					this.history
// 				);
// 				break;
// 			default:
// 				console.log('Неизвестное действие');
// 				return;
// 		}
		
// 		command.execute();
// 	}
// }

// // 3. CLI (Command Line Interface) - источник команд из консоли
// class CliInterface {
// 	private history: CommandHistory = new CommandHistory();
// 	private commands: Map<string, Command> = new Map();
	
// 	constructor(private userService: UserService) {}
	
// 	parseInput(input: string) {
// 		const [cmd, userId] = input.split(' ');
		
// 		if (cmd === 'add') {
// 			const command = new AddUserCommand(
// 				new User(parseInt(userId)),
// 				this.userService,
// 				this.history
// 			);
// 			command.execute();
// 			this.commands.set(`user_${userId}`, command);
// 		}
		
// 		if (cmd === 'undo') {
// 			const lastCommand = this.history.commands[this.history.commands.length - 1];
// 			if (lastCommand) {
// 				lastCommand.undo();
// 			}
// 		}
// 	}
// }

// // 4. Планировщик задач (Cron) - источник команд по расписанию
// class MyScheduler {
// 	private timers: NodeJS.Timeout[] = [];
	
// 	scheduleCommand(command: Command, delayMs: number) {
// 		console.log(`⏰ Планирую выполнение команды через ${delayMs}мс`);
// 		const timer = setTimeout(() => {
// 			console.log(`\n⏰ Выполняю запланированную команду`);
// 			command.execute();
// 		}, delayMs);
// 		this.timers.push(timer);
// 	}
	
// 	clearAll() {
// 		this.timers.forEach(clearTimeout);
// 	}
// }

// // 5. Очередь сообщений (Message Queue) - асинхронные команды
// class MessageQueue {
// 	private queue: Command[] = [];
// 	private isProcessing = false;
	
// 	enqueue(command: Command) {
// 		console.log(`📥 Команда добавлена в очередь. Всего в очереди: ${this.queue.length + 1}`);
// 		this.queue.push(command);
// 		this.processQueue();
// 	}
	
// 	private async processQueue() {
// 		if (this.isProcessing) return;
// 		this.isProcessing = true;
		
// 		while (this.queue.length > 0) {
// 			const command = this.queue.shift()!;
// 			console.log(`\n🔄 Обрабатываю команду из очереди...`);
// 			command.execute();
// 			await new Promise(resolve => setTimeout(resolve, 1000)); // Имитация задержки
// 		}
		
// 		this.isProcessing = false;
// 	}
// }

/////////////////////////// ДЕМОНСТРАЦИЯ /////////////////////////

// console.log('=== ДЕМОНСТРАЦИЯ: РАЗНЫЕ ИСТОЧНИКИ КОМАНД ===\n');

// // Создаем сервисы
// const userService = new UserService();
// const wsService = new WebSocketService();
// const emailService = new EmailService();
// const cacheService = new CacheService();

// // 1. HTTP Controller (источник - HTTP запрос)
// console.log('1️⃣ Источник: HTTP Контроллер');
// const httpController = new HttpController();
// httpController.setReceiver(userService);
// httpController.handleCreateUser(1);

// // 2. WebSocket Handler (источник - входящее сообщение)
// console.log('\n2️⃣ Источник: WebSocket сообщение');
// const wsHandler = new WebSocketHandler(userService, wsService, emailService, cacheService);
// wsHandler.onMessage(JSON.stringify({ 
// 	action: 'CREATE_USER', 
// 	userId: 2, 
// 	name: 'Alice' 
// }));

// // 3. CLI (источник - команда из терминала)
// console.log('\n3️⃣ Источник: CLI (командная строка)');
// const cli = new CliInterface(userService);
// cli.parseInput('add 3');
// cli.parseInput('undo');

// // 4. Scheduler (источник - запланированная задача)
// console.log('\n4️⃣ Источник: Планировщик задач');
// const myScheduler = new MyScheduler();
// const scheduledCommand = new AddUserCommand(
// 	new User(4, 'Scheduled User'),
// 	userService,
// 	new CommandHistory()
// );
// myScheduler.scheduleCommand(scheduledCommand, 2000);

// // 5. Message Queue (источник - очередь сообщений)
// console.log('\n5️⃣ Источник: Очередь сообщений');
// const queue = new MessageQueue();
// queue.enqueue(new AddUserCommand(new User(5), userService, new CommandHistory()));
// queue.enqueue(new AddUserCommand(new User(6), userService, new CommandHistory()));
// queue.enqueue(new AddUserCommand(new User(7), userService, new CommandHistory()));

// // Даем время на выполнение отложенных команд
// setTimeout(() => {
// 	console.log('\n=== ДЕМОНСТРАЦИЯ ЗАВЕРШЕНА ===');
// 	process.exit(0);
// }, 4000);

// Ключевая идея: Полное разделение

// В этом примере одни и те же команды могут быть вызваны из:
// HTTP запроса (веб-интерфейс)
// WebSocket сообщения (реал-тайм обновления)
// CLI (скрипты/терминал)
// Планировщика (Cron/отложенные задачи)
// Очереди сообщений (асинхронная обработка)

// И выполнять они могут:
// Локальные операции (БД)
// Сетевые запросы (WebSocket)
// Отправку писем (Email)
// Работу с кэшем (Cache)

// Преимущества такого подхода:
// Единый интерфейс для всех операций — любое действие это command.execute()
// Undo/Redo работает везде — независимо от источника
// Логирование из коробки — все команды можно записывать в лог
// Тестирование — можно мокать любые источники и получатели

// Реальный пример из жизни:
// Представьте админ-панель, где кнопка "Удалить пользователя" может:
// Быть нажата в браузере → HTTP запрос → DeleteUserCommand
// Прийти по WebSocket от другого админа → WebSocket → DeleteUserCommand
// Выполниться ночью по расписанию → Cron → DeleteUserCommand
// Быть отменена через Ctrl+Z → command.undo()

////////////////////////////////////////// STATE /////////////////////////////////////////////////

// Паттерн State (Состояние) решает проблему сложных условных операторов и непредсказуемого 
// поведения объекта в зависимости от его текущего статуса.

// Какую конкретную проблему решает ваш код?
// Без паттерна State вам пришлось бы писать что-то вроде:

// typescript
// class DocumentItem {
//     public text: string;
//     private status: string = 'draft'; // или 'published'
    
//     publishDoc() {
//         if (this.status === 'draft') {
//             console.log(`На сайт отправлен текст ${this.text}`);
//             this.status = 'published';
//         } else if (this.status === 'published') {
//             console.log('Нельзя опубликовать опубликованный документ');
//         } else if (this.status === 'archived') {
//             console.log('Нельзя опубликовать архивный документ');
//         }
//         // ... и так в КАЖДОМ методе
//     }
    
//     deleteDoc() {
//         if (this.status === 'draft') {
//             console.log('Документ удалён');
//             // Удаляем навсегда
//         } else if (this.status === 'published') {
//             console.log('Снято с публикации');
//             this.status = 'draft';
//         } else if (this.status === 'archived') {
//             console.log('Нельзя удалить архивный документ');
//         }
//         // Условные операторы повсюду!
//     }
// }
// Проблемы такого подхода:
// Раздутые методы с множеством if/else или switch
// Сложность добавления нового состояния — нужно лезть в КАЖДЫЙ метод и дописывать else if
// Нарушение Open/Closed Principle из SOLID

// ┌─────────────────────────────────────────────────────────┐
// │                    DocumentItem                          │
// │  ┌──────────────────┐          ┌─────────────────────┐  │
// │  │   DraftState     │ publish  │   PublishedState    │  │
// │  │                  ├─────────►│                     │  │
// │  │ publish: ✅       │          │ publish: ❌          │  │
// │  │ delete: удалить  │          │ delete: снять с пуб.│  │
// │  └──────────────────┘          └──────────┬──────────┘  │
// │          ▲                                 │             │
// │          │            delete               │             │
// │          └─────────────────────────────────┘             │
// └─────────────────────────────────────────────────────────┘

////////////////////////////////////////// STATE /////////////////////////////////////////////////

class DocumentItem {
	public text: string;
	public author: string;
	private state: DocumentItemState;
	
	// Дополнительные свойства для демонстрации
	public moderationComment: string = '';
	public createdAt: Date;

	constructor(author: string, text: string) {
		this.author = author;
		this.text = text;
		this.createdAt = new Date();
		this.setState(new DraftDocumentItemState());
	}

	getState() {
		return this.state;
	}

	setState(state: DocumentItemState) {
		this.state = state;
		this.state.setContext(this);
	}

	// Делегируем методы текущему состоянию
	publishDoc() {
		this.state.publish();
	}

	deleteDoc() {
		this.state.delete();
	}
	
	sendToModeration() {
		this.state.sendToModeration?.();
	}
	
	rejectModeration(reason: string) {
		this.state.rejectModeration?.(reason);
	}
	
	restore() {
		this.state.restore?.();
	}
	
	getStatus(): string {
		return this.state.name;
	}
}

abstract class DocumentItemState {
	public name: string;
	public item: DocumentItem;

	public setContext(item: DocumentItem) {
		this.item = item;
	}

	public abstract publish(): void;
	public abstract delete(): void;
	
	// Опциональные методы для расширенных состояний
	public sendToModeration?(): void;
	public rejectModeration?(reason: string): void;
	public restore?(): void;
}

/////////////////////////// СОСТОЯНИЕ: ЧЕРНОВИК ///////////////////////////////

class DraftDocumentItemState extends DocumentItemState {
	constructor() {
		super();
		this.name = '📝 Черновик';
	}
	
	public publish(): void {
		console.log(`❌ Нельзя опубликовать черновик напрямую. Сначала отправьте на модерацию.`);
	}
	
	public delete(): void {
		console.log(`🗑️ Черновик "${this.item.text}" удалён навсегда`);
		// Полное удаление, переходим в "никуда"
		this.item.setState(new DeletedDocumentItemState());
	}
	
	public override sendToModeration(): void {
		console.log(`📤 Документ "${this.item.text}" отправлен на модерацию`);
		this.item.setState(new ModerationDocumentItemState());
	}
}

/////////////////////////// СОСТОЯНИЕ: НА МОДЕРАЦИИ ///////////////////////////////

class ModerationDocumentItemState extends DocumentItemState {
	constructor() {
		super();
		this.name = '🔍 На модерации';
	}
	
	public publish(): void {
		console.log(`✅ Модерация пройдена! Документ "${this.item.text}" опубликован на сайте`);
		this.item.setState(new PublishDocumentItemState());
	}
	
	public delete(): void {
		console.log(`↩️ Документ снят с модерации и возвращён в черновики`);
		this.item.setState(new DraftDocumentItemState());
	}
	
	public override rejectModeration(reason: string): void {
		console.log(`❌ Модерация отклонена. Причина: ${reason}`);
		this.item.moderationComment = reason;
		this.item.setState(new DraftDocumentItemState());
	}
}

/////////////////////////// СОСТОЯНИЕ: ОПУБЛИКОВАН ///////////////////////////////

class PublishDocumentItemState extends DocumentItemState {
	constructor() {
		super();
		this.name = '🌐 Опубликован';
	}
	
	public publish(): void {
		console.log(`⚠️ Документ уже опубликован. Нельзя опубликовать повторно.`);
	}
	
	public delete(): void {
		console.log(`📦 Документ "${this.item.text}" снят с публикации и перемещён в корзину`);
		this.item.setState(new TrashDocumentItemState());
	}
}

/////////////////////////// СОСТОЯНИЕ: В КОРЗИНЕ ///////////////////////////////

class TrashDocumentItemState extends DocumentItemState {
	private deletedAt: Date;
	
	constructor() {
		super();
		this.name = '🗑️ В корзине';
		this.deletedAt = new Date();
	}
	
	public publish(): void {
		console.log(`❌ Нельзя опубликовать документ из корзины. Сначала восстановите его.`);
	}
	
	public delete(): void {
		console.log(`💥 Документ "${this.item.text}" удалён из корзины НАВСЕГДА`);
		this.item.setState(new DeletedDocumentItemState());
	}
	
	public override restore(): void {
		console.log(`🔄 Документ "${this.item.text}" восстановлен из корзины в черновики`);
		this.item.setState(new DraftDocumentItemState());
	}
}

/////////////////////////// СОСТОЯНИЕ: УДАЛЁН (ТЕРМИНАЛЬНОЕ) ///////////////////////////////

class DeletedDocumentItemState extends DocumentItemState {
	constructor() {
		super();
		this.name = '☠️ Удалён навсегда';
	}
	
	public publish(): void {
		console.log(`❌ Документ удалён безвозвратно. Публикация невозможна.`);
	}
	
	public delete(): void {
		console.log(`❌ Документ уже удалён.`);
	}
}

/////////////////////////// СЕРВИС ДЛЯ РАБОТЫ С ДОКУМЕНТАМИ ///////////////////////////////

class DocumentService {
	private documents: DocumentItem[] = [];
	
	createDocument(author: string, text: string): DocumentItem {
		const doc = new DocumentItem(author, text);
		this.documents.push(doc);
		console.log(`\n📄 Создан новый документ: "${text}" (автор: ${author})`);
		console.log(`Статус: ${doc.getStatus()}`);
		return doc;
	}
	
	showStatus(doc: DocumentItem) {
		console.log(`\n📊 Статус документа "${doc.text}": ${doc.getStatus()}`);
		if (doc.moderationComment) {
			console.log(`   Комментарий модератора: ${doc.moderationComment}`);
		}
	}
	
	getStats() {
		console.log('\n📈 СТАТИСТИКА ПО ДОКУМЕНТАМ:');
		const stats = this.documents.reduce((acc, doc) => {
			const status = doc.getStatus();
			acc[status] = (acc[status] || 0) + 1;
			return acc;
		}, {} as Record<string, number>);
		
		Object.entries(stats).forEach(([status, count]) => {
			console.log(`   ${status}: ${count} шт.`);
		});
	}
}

/////////////////////////// ДЕМОНСТРАЦИЯ /////////////////////////////////

// console.log('═══════════════════════════════════════════════════════');
// console.log('     ДЕМОНСТРАЦИЯ ПАТТЕРНА STATE: ЖИЗНЬ ДОКУМЕНТА');
// console.log('═══════════════════════════════════════════════════════');

// const service = new DocumentService();

// // Сценарий 1: Успешная публикация
// console.log('\n🔵 СЦЕНАРИЙ 1: Успешная публикация документа');
// console.log('─────────────────────────────────────────────────');

// const doc1 = service.createDocument('Анна', 'Как я провела лето');
// service.showStatus(doc1);

// console.log('\n📤 Отправляем на модерацию...');
// doc1.sendToModeration();
// service.showStatus(doc1);

// console.log('\n✅ Модератор одобряет документ...');
// doc1.publishDoc();
// service.showStatus(doc1);

// // Сценарий 2: Отклонение модератором
// console.log('\n\n🔴 СЦЕНАРИЙ 2: Отклонение модератором');
// console.log('─────────────────────────────────────────────────');

// const doc2 = service.createDocument('Борис', 'Политический манифест');
// service.showStatus(doc2);

// console.log('\n📤 Отправляем на модерацию...');
// doc2.sendToModeration();
// service.showStatus(doc2);

// console.log('\n❌ Модератор отклоняет документ...');
// doc2.rejectModeration('Содержит недопустимые высказывания');
// service.showStatus(doc2);

// console.log('\n📝 Автор исправляет текст...');
// doc2.text = 'Нейтральная статья о погоде';
// console.log(`Новый текст: "${doc2.text}"`);

// console.log('\n📤 Повторно отправляем на модерацию...');
// doc2.sendToModeration();
// service.showStatus(doc2);

// console.log('\n✅ Модератор одобряет исправленный документ...');
// doc2.publishDoc();
// service.showStatus(doc2);

// // Сценарий 3: Удаление в корзину и восстановление
// console.log('\n\n🟡 СЦЕНАРИЙ 3: Работа с корзиной');
// console.log('─────────────────────────────────────────────────');

// const doc3 = service.createDocument('Виктор', 'Мои рецепты');
// service.showStatus(doc3);

// console.log('\n📤 Отправляем на модерацию и публикуем...');
// doc3.sendToModeration();
// doc3.publishDoc();
// service.showStatus(doc3);

// console.log('\n📦 Удаляем опубликованный документ...');
// doc3.deleteDoc();
// service.showStatus(doc3);

// console.log('\n🔄 Восстанавливаем из корзины...');
// doc3.restore();
// service.showStatus(doc3);

// // Сценарий 4: Удаление навсегда
// console.log('\n\n⚫ СЦЕНАРИЙ 4: Полное удаление');
// console.log('─────────────────────────────────────────────────');

// const doc4 = service.createDocument('Галина', 'Черновик, который не нужен');
// service.showStatus(doc4);

// console.log('\n🗑️ Удаляем черновик навсегда...');
// doc4.deleteDoc();
// service.showStatus(doc4);

// console.log('\n💥 Пытаемся восстановить или опубликовать удалённый документ...');
// doc4.restore?.();
// doc4.publishDoc();

// // Сценарий 5: Попытка невалидных операций
// console.log('\n\n🟣 СЦЕНАРИЙ 5: Проверка защиты от невалидных операций');
// console.log('─────────────────────────────────────────────────');

// const doc5 = service.createDocument('Дмитрий', 'Важная статья');
// service.showStatus(doc5);

// console.log('\n❌ Пытаемся опубликовать черновик без модерации...');
// doc5.publishDoc();

// console.log('\n📤 Отправляем на модерацию...');
// doc5.sendToModeration();

// console.log('\n❌ Пытаемся восстановить документ на модерации...');
// doc5.restore?.();

// console.log('\n✅ Публикуем...');
// doc5.publishDoc();

// console.log('\n❌ Пытаемся отправить на модерацию опубликованный документ...');
// doc5.sendToModeration();

// // Сценарий 6: Массовые операции
// console.log('\n\n🔷 СЦЕНАРИЙ 6: Массовые операции');
// console.log('─────────────────────────────────────────────────');

// console.log('\n📋 Создаём несколько документов...');
// const doc6 = service.createDocument('Елена', 'Статья 1');
// const doc7 = service.createDocument('Елена', 'Статья 2');
// const doc8 = service.createDocument('Елена', 'Статья 3');

// console.log('\n📤 Отправляем все на модерацию...');
// doc6.sendToModeration();
// doc7.sendToModeration();
// doc8.sendToModeration();

// console.log('\n✅ Публикуем doc6 и doc7, ❌ отклоняем doc8...');
// doc6.publishDoc();
// doc7.publishDoc();
// doc8.rejectModeration('Нужны правки');

// console.log('\n📊 Итоговая статистика:');
// service.getStats();

/////////////////////////// STRATEGY /////////////////////////////////

class User {
	guthubToken: string;
	jwtToken: string;
}

interface AuthStratagy {
	auth(user: User): boolean;
}

class Auth {
	constructor(private strategy: AuthStratagy) { }

	setStategy(strategy: AuthStratagy) {
		this.strategy = strategy;
	}

	public authUser(user: User): boolean {
		return this.strategy.auth(user);
	}
}

class JWTStrategy implements AuthStratagy {
	auth(user: User): boolean {
		if (user.jwtToken) {
			return true;
		}
		return false;
	}
}

class GithubStrategy implements AuthStratagy {
	auth(user: User): boolean {
		if (user.guthubToken) {
			// Идём в API
			return true;
		}
		return false;
	}
}

// const user = new User();
// user.jwtToken = 'token';
// const auth = new Auth(new JWTStrategy());
// console.log(auth.authUser(user));
// auth.setStategy(new GithubStrategy());
// console.log(auth.authUser(user));


/////////////////////////// ITERATOR /////////////////////////////////

class Task {
	constructor(public priority: number) { }
}

class TaskList {
	private tasks: Task[] = [];

	public sortByPriority() {
		this.tasks = this.tasks.sort((a, b) => {
			if (a.priority > b.priority) {
				return 1;
			} else if (a.priority == b.priority) {
				return 0;
			} else {
				return -1;
			}
		})
	}

	public addTask(task: Task) {
		this.tasks.push(task);
	}

	public getTasks() {
		return this.tasks;
	}

	public count() {
		return this.tasks.length;
	}

	public getIterator() {
		return new PriorityTaskItearator(this);
	}
}

interface IIterator<T> {
	current(): T | undefined;
	next(): T | undefined;
	prev(): T | undefined;
	index(): number;
}

class PriorityTaskItearator implements IIterator<Task> {
	private position: number = 0;
	private taskList: TaskList;

	constructor(taskList: TaskList) {
		taskList.sortByPriority();
		this.taskList = taskList;
	}

	current(): Task | undefined {
		return this.taskList.getTasks()[this.position];
	}
	next(): Task | undefined {
		this.position += 1;
		return this.taskList.getTasks()[this.position];
	}
	prev(): Task | undefined {
		this.position -= 1;
		return this.taskList.getTasks()[this.position];
	}
	index(): number {
		return this.position;
	}
}

// const taskList = new TaskList();
// taskList.addTask(new Task(8));	
// taskList.addTask(new Task(1));
// taskList.addTask(new Task(3));
// const iterator = taskList.getIterator();
// console.log(iterator.current())
// console.log(iterator.next())
// console.log(iterator.next())
// console.log(iterator.prev())
// console.log(iterator.index())


//////////////////////////////////////////// Template Method ////////////////////////////////////////////

// Когда использовать Template Method?
// ✅ Используйте, когда:
// Есть фиксированный алгоритм с изменяемыми шагами
// Хотите контролировать порядок выполнения шагов
// Нужно предоставить хуки для расширения
// Есть общий код, который не должен дублироваться

// ❌ Не используйте, когда:
// Алгоритм может меняться полностью → Strategy
// Нужно менять поведение во время выполнения → State
// Классы не связаны иерархически → Композиция

// Интересный факт: Factory Method — это частный случай Template Method, где шаблонный метод создает объект, а фабричный метод — это примитивная операция.

class Form {
	constructor(public name: string) { }
}

abstract class SaveForm<T> {
	public save(form: Form) {
		const res = this.fill(form);
		this.log(res);
		this.send(res);
	}

	protected abstract fill(form: Form): T;
	protected log(data: T): void {
		console.log(data);
	};
	protected abstract send(data: T): void;
}

class FirstAPI extends SaveForm<string> {
	protected fill(form: Form): string {
		return form.name;
	}
	protected send(data: string): void {
		console.log(`Отправляю ${data}`);
	}
}

class SecondAPI extends SaveForm<{ fio: string }> {
	protected fill(form: Form): { fio: string } {
		return { fio: form.name };
	}
	protected send(data: { fio: string }): void {
		console.log(`Отправляю ${data}`);
	}
}

// const form1 = new FirstAPI();
// form1.save(new Form('Вася'));

// const form2 = new SecondAPI();
// form2.save(new Form('Вася'));

//////////////////////////////////////////// Observer ////////////////////////////////////////////

// Какую проблему решает?
// Проблема «постоянного опроса» и сильной связанности.

// Представьте, что у вас нет этого паттерна. Чтобы сервис NotificationService узнал о новом лиде (NewLead), ему пришлось бы каждую секунду проверять объект NewLead:
// if (subject.state !== oldState) { /* делаем что-то */ }
// Это пустая трата ресурсов процессора.

// Либо пришлось бы внутри класса NewLead жёстко прописать вызовы конкретных сервисов:

// typescript
// // Плохой код (без Observer)
// class NewLead {
//     // Придется знать о всех сервисах напрямую
//     private notificationService: NotificationService;
//     private leadService: LeadService;
    
//     someAction() {
//         this.notificationService.doSomething();
//         this.leadService.doSomething();
//     }
// }
// Это делает систему хрупкой и нерасширяемой. Добавление нового сервиса (например, LogService) потребует изменения кода класса NewLead.
// Что даёт этот паттерн? (Польза)
// Паттерн Observer вводит механизм подписки. Он определяет зависимость один ко многим.
// Реактивность (Push-модель): NewLead (Субъект) не спрашивают «Ты уже изменился?», он сам кричит: «Я изменился!».
// Слабая связанность (Loose Coupling): NewLead вообще не знает, кто именно на него подписан. Он знает только интерфейс Observer (метод update). Это позволяет:
// Добавлять новых подписчиков (например, EmailSender) не меняя код NewLead.
// Менять логику работы NotificationService не ломая NewLead.
// Динамическое управление: Как показано в вашем коде с помощью attach и detach, вы можете на лету включать или отключать отправку уведомлений.
// Аналогия из жизни
// Это подписка на YouTube-канал (Subject).
// Зрители (Observers) нажимают «Подписаться» (attach).
// Когда выходит видео (state меняется), YouTube автоматически рассылает уведомления всем подписчикам (notify).
// Канал не знает лично каждого зрителя, он просто посылает сигнал «Новое видео», а зритель сам решает, что с этим делать (смотреть или нет).

interface Observer {
	update(subject: Subject): void;
}

interface Subject {
	attach(observer: Observer): void
	detach(observer: Observer): void
	notify(): void;
}

class Lead {
	constructor(public name: string, public phone: string) { }
}

class NewLead implements Subject {
	private observers: Observer[] = [];
	public state: Lead;

	attach(observer: Observer): void {
		if (this.observers.includes(observer)) {
			return;
		}
		this.observers.push(observer);
	}
	detach(observer: Observer): void {
		const observerIndex = this.observers.indexOf(observer);
		if (observerIndex == -1) {
			return;
		}
		this.observers.splice(observerIndex, 1);
	}

	notify(): void {
		for (const observer of this.observers) {
			observer.update(this);
		}
	}
}

class NotificationService implements Observer {
	update(subject: Subject): void {
		console.log(`NotificationService получил уведомление`);
		console.log(subject);
	}
}

class LeadService implements Observer {
	update(subject: Subject): void {
		console.log(`LeadService получил уведомление`);
		console.log(subject);
	}
}

const subject = new NewLead();
subject.state = new Lead('Антон', '00000');
const s1 = new NotificationService();
const s2 = new LeadService();

subject.attach(s1);
subject.attach(s2);
subject.notify();
subject.detach(s1);
subject.detach(s2);
subject.notify();