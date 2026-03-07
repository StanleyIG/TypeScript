type PaymentStatus = "new" | "paid";

class Payment {
  id: number;
  status: PaymentStatus = "new";

  constructor(id: number) {
    this.id = id;
  }

  pay() {
    this.status = "paid";
  }
}

class PersistedPayment extends Payment {
  // databaseId: number;
  paidAt: Date;

  constructor(paidAt: Date) {
    const id = Math.random();
    super(id);
    this.paidAt = paidAt;
  }

  save() {
    // Сохраняет в базу
  }

  //   override pay(): void; // Сигнатура перегрузки несовместима с ее сигнатурой реализации
  //   override pay(date: Date): void {
  //     super.pay();
  //     if (date) {
  //       this.paidAt = date;
  //     } else {
  //       this.paidAt = new Date();
  //     }
  //   }

//   override pay(): void;
//   override pay(date: Date): void;
//   override pay(date?: Date): void {
//     super.pay();
//     if (date) {
//       this.paidAt = date;
//     } else {
//       this.paidAt = new Date();
//     }
//   }
  // либо так:

  override pay(date?: Date): void {
    super.pay();
    if (date) {
      this.paidAt = date;
    } else {
      this.paidAt = new Date();
    }
  }
}

// new PersistedPayment();


class User {
	name: string = 'user';

	constructor() {
		console.log(this.name);
	}
}

class Admin extends User {
	name: string = 'admin';

	constructor() {
		super(); // сначала надо делегировать инициализацию конструктора базового класса
		console.log(this.name);
	}
}

new Admin();
// user
// admin

// new Error('');

class HttpError extends Error {
	code: number;

	constructor(message: string, code?: number) {
		super(message);
		this.code = code ?? 500;
	}
}
