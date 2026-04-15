// Factory pattern

interface IInsurance {
	id: number;
	status: string;
	setVehicle(vehicle: any): void;
	submit(): Promise<boolean>;
}

class TFInsurance implements IInsurance {
	id: number;
	status: string;
	private vehicle: any;

	setVehicle(vehicle: any): void {
		this.vehicle = vehicle;
	}

	async submit(): Promise<boolean> {
		const res = await fetch('',
			{
				method: 'POST',
				body: JSON.stringify({ vehicle: this.vehicle })
			});
		const data = await res.json();
		return data.isSuccess;
	}
}

class ABInsurance implements IInsurance {
	id: number;
	status: string;
	private vehicle: any;

	setVehicle(vehicle: any): void {
		this.vehicle = vehicle;
	}

	async submit(): Promise<boolean> {
		const res = await fetch('ab',
			{
				method: 'POST',
				body: JSON.stringify({ vehicle: this.vehicle })
			});
		const data = await res.json();
		return data.yes;
	}
}

abstract class InsuranceFactory {
	db: any;

	abstract createInsurance(): IInsurance;

	saveHistory(ins: IInsurance) {
		this.db.save(ins.id, ins.status);
	}
}

class TFInsuranceFactory extends InsuranceFactory {
	createInsurance(): TFInsurance {
		return new TFInsurance();
	}
}

class ABInsuranceFactory extends InsuranceFactory {
	createInsurance(): ABInsurance {
		return new ABInsurance();
	}
}

const tfInsuranceFactory = new TFInsuranceFactory();
const ins = tfInsuranceFactory.createInsurance();
tfInsuranceFactory.saveHistory(ins);

// Singleton

class MyMap {
	private static instance: MyMap;

	map: Map<number, string> = new Map();

	private constructor() { }

	clean() {
		this.map = new Map();
	}

	public static get(): MyMap {
		if (!MyMap.instance) {
			MyMap.instance = new MyMap();
		}
		return MyMap.instance;
	}
}

class Service1 {
	addMap(key: number, value: string) {
		const myMap = MyMap.get();
		myMap.map.set(key, value);
	}
}

class Service2 {
	getKeys(key: number) {
		const myMap = MyMap.get();
		console.log(myMap.map.get(key));
		myMap.clean();
		console.log(myMap.map.get(key));
	}
}

// new Service1().addMap(1, 'Работает!');
// new Service2().getKeys(1);

// Prototype pattern

interface Prototype<T> {
	clone(): T;
}

class UserHistory implements Prototype<UserHistory> {
	createdAt: Date;

	constructor(public email: string, public name: string) {
		this.createdAt = new Date();
	}

	clone(): UserHistory {
		let target = new UserHistory(this.email, this.name);
		target.createdAt = this.createdAt;
		return target;
	}
}

let user = new UserHistory('a@a.ru', 'Антон');
console.log(user);
let user2 = user.clone();
user2.email = 'b@b.ru'
console.log(user2);
console.log(user);

