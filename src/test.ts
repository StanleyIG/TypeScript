// ============ BRIDGE ============
interface IProvider {
	sendMessage(message: string): void;
	connect(config: unknown): void;
	disconnect(): void;
}

class TelegramProvider implements IProvider {
	sendMessage(message: string): void {
		console.log(`[Telegram] ${message}`);
	}
	connect(config: string): void {
		console.log(`[Telegram] Connected with config: ${config}`);
	}
	disconnect(): void {
		console.log('[Telegram] Disconnected');
	}
}

class WhatsUpProvider implements IProvider {
	sendMessage(message: string): void {
		console.log(`[WhatsUp] ${message}`);
	}
	connect(config: string): void {
		console.log(`[WhatsUp] Connected with config: ${config}`);
	}
	disconnect(): void {
		console.log('[WhatsUp] Disconnected');
	}
}

class NotificationSender {
	constructor(private provider: IProvider) { }

	send() {
		this.provider.connect('default-config');
		this.provider.sendMessage('Hello from Bridge pattern!');
		this.provider.disconnect();
	}
}

class DelayNotificationSender extends NotificationSender {
	constructor(provider: IProvider) {
		super(provider);
	}
	
	sendDelayed(delayMs: number) {
		console.log(`[Delay] Waiting ${delayMs}ms...`);
		setTimeout(() => {
			this.send();
		}, delayMs);
	}
}

// ============ FACADE ============
interface INotify {
    send(message: string, to: string): void;
}

interface ILog {
	log(message: string): void;
}

interface ITemplate {
	getByName(name: string): { name: string, template: string } | undefined;
}

class EmailNotify implements INotify { 
	send(template: string, to: string) {
		console.log(`[Email] Отправляю "${template}" получателю: ${to}`);
	} 
}

class TelegramNotify implements INotify {
	send(template: string, to: string) {
		console.log(`[TelegramNotify] Отправляю "${template}" получателю: ${to}`);
	}
}

class Log implements ILog {
	log(message: string) {
		console.log(`[LOG] ${new Date().toISOString()}: ${message}`);
	}
}

class Template implements ITemplate {
	private templates = [
		{ name: 'other', template: '<h1>Шаблон!</h1>' },
		{ name: 'welcome', template: '<h1>Добро пожаловать!</h1>' }
	];

	getByName(name: string) {
		return this.templates.find(t => t.name === name);
	}
}

class NotificationFacade {
	constructor(
        private notify: INotify,
        private logger: ILog,
        private template: ITemplate
    ) {}

	send(to: string, templateName: string) {
		const data = this.template.getByName(templateName);
		if (!data) {
			this.logger.log(`Не найден шаблон: ${templateName}`);
			return;
		}
		this.notify.send(data.template, to);
		this.logger.log(`Шаблон "${templateName}" отправлен получателю ${to}`);
	}
}

// ============ ADAPTER ============

class KVDatabase {
	private db: Map<string, string> = new Map();
	save(key: string, value: string) {
		this.db.set(key, value);
	}
}

class PersistentDB {
	savePersistent(data: Object) {
		console.log(data);
	}
}

class PersistentDBAdaper extends KVDatabase {
	constructor(public database: PersistentDB) {
		super();
	}

	override save(key: string, value: string): void {
		this.database.savePersistent({ key, value });
	}
}

function run(base: KVDatabase) {
	base.save('key', 'myValue');
}

// Суть проблемы
// Есть:

// Старая/клиентская система, которая ожидает работать с интерфейсом KVDatabase (метод save(key, value)).
// Новая/сторонняя библиотека PersistentDB, которая имеет несовместимый интерфейс (savePersistent(object)).
// Вы не можете просто взять и передать PersistentDB в функцию run(), потому что там ожидается метод save().


// ============ PROXY ============

interface IPaymentAPI {
	getPaymentDetail(id: number): IPaymentDetail | undefined;
}

interface IPaymentDetail {
	id: number;
	sum: number;
}

class PaymentAPI implements IPaymentAPI {
	private data = [{ id: 1, sum: 10000 }];
	getPaymentDetail(id: number): IPaymentDetail | undefined {
		return this.data.find(d => d.id === id);
	}
}

class PaymentAccessProxy implements IPaymentAPI {
	constructor(private api: PaymentAPI, private userId: number) { }

	getPaymentDetail(id: number): IPaymentDetail | undefined {
		if (this.userId === 1) {
			return this.api.getPaymentDetail(id)
		}
		console.log('Попытка получить данные платежа!');
		return undefined;
	}
}

// Основная концепция:

// Паттерн "Прокси" представляет собой дополнительный слой между клиентом и реальным объектом, позволяющий контролировать 
// доступ к этому объекту, добавляя при этом дополнительную логику.

// ============ Composite ============

abstract class DeliveryItem {
	items: DeliveryItem[] = [];

	addItem(item: DeliveryItem) {
		this.items.push(item);
	}

	getItemPrices(): number {
		return this.items.reduce((acc: number, i: DeliveryItem) => acc += i.getPrice(), 0)
	}

	abstract getPrice(): number;
}

export class DeliveryShop extends DeliveryItem {
	constructor(private deliveryFee: number) {
		super();
	}

	getPrice(): number {
		return this.getItemPrices() + this.deliveryFee;
	}
}

export class Package extends DeliveryItem {
	getPrice(): number {
		return this.getItemPrices();
	}
}

export class Product extends DeliveryItem {
	constructor(private price: number) {
		super();
	}
	getPrice(): number {
		return this.price;
	}
}

// ============ ИСПОЛЬЗОВАНИЕ ============
console.log('=== BRIDGE PATTERN ===');
const tgSender = new NotificationSender(new TelegramProvider());
tgSender.send();

console.log('\n=== BRIDGE WITH DELAY ===');
const delayedSender = new DelayNotificationSender(new WhatsUpProvider());
delayedSender.sendDelayed(1000);

console.log('\n=== FACADE PATTERN ===');
const facade = new NotificationFacade(
	new EmailNotify(),
	new Log(),
	new Template()
);
facade.send('a@a.ru', 'other');

// Демонстрация гибкости - меняем Email на Telegram без изменения фасада
console.log('\n=== FACADE WITH DIFFERENT PROVIDER ===');
const facadeTelegram = new NotificationFacade(
	new TelegramNotify(),
	new Log(),
	new Template()
);
facadeTelegram.send('user123', 'welcome');

console.log('\n=== ADAPTER PATTERN ===');
run(new PersistentDBAdaper(new PersistentDB));

console.log('\n=== PROXY PATTERN ===');
const proxy = new PaymentAccessProxy(new PaymentAPI(), 1);
console.log(proxy.getPaymentDetail(1));

const proxy2 = new PaymentAccessProxy(new PaymentAPI(), 2);
console.log(proxy2.getPaymentDetail(1));

console.log('\n=== Composite PATTERN ===');
const shop = new DeliveryShop(100);
shop.addItem(new Product(1000));

const pack1 = new Package()
pack1.addItem(new Product(200));
pack1.addItem(new Product(300));
shop.addItem(pack1);

const pack2 = new Package()
pack2.addItem(new Product(30));
shop.addItem(pack2);

console.log(shop.getPrice());
////////////////////////////////////////////////////////////////////////////////////


// function test(a: number, b: number) {
// 	console.log(a, b)
// }

// test(100, 500)

// function test(data: {a: number, b: number}) {
// 	console.log(data)
// }

// test({a: 100, b: 500})

// function test(a: number, b: number) {
// 	console.log(a, b)
// }

// test(...[100, 500])

// function test(a: number, b: number): void {
// 	console.log(a, b)
// }

// test(...[100, 500])

// interface ITest {
// 	test(): void
// }

// // class Test {
// // 	test(a: string, b: string): void
// // 	test(a: number, b: number): void
// // 	test(a: number, b: ITest): void
// // 	test(a: number | string, b: number | string | ITest): void {
// // 		console.log(a, b)
// // 	}

// // }

// class Test {
//     test(a: string): void;
//     test(a: string, b: string): void;
//     test(a: string, b: string, c: string): void;
//     test(...args: string[]): void {
// 		console.log(args)
// 		const [ a, b, c ] = args
//         console.log(a, b, c);
//     }
// }

// const test = new Test()
// test.test(...['a', 'b', 'c'])
// test.test('a', 'b', 'c')


// interface Test {
//   [k: string]: string // индексная сигнатура
// }

// type ReadonlyType<T> = {
//   readonly [K in keyof T]: T[K]
// }

// type ReadonlyTest = ReadonlyType<Test>