// Класс продукта
class Product {
  constructor(
    public id: number,
    public title: string,
    public price: number,
  ) {}
}

// Базовый класс доставки
abstract class Delivery {
  constructor(public date: Date) {}
}

// Доставка на дом
class HomeDelivery extends Delivery {
  constructor(
    date: Date,
    public address: string,
  ) {
    super(date);
  }
}

// Доставка в магазин
class ShopDelivery extends Delivery {
  constructor(public shopId: number) {
    super(new Date()); // Дата всегда сегодня
  }
}

// Класс корзины
class Cart {
  private products: Product[] = [];
  private delivery: Delivery | null = null;

  // Добавить продукт в корзину
  addProduct(product: Product): void {
    this.products.push(product);
    console.log(`Товар "${product.title}" добавлен в корзину`);
  }

  // Удалить продукт из корзины по ID
  deleteProduct(productId: number): void {
    const index = this.products.findIndex((p) => p.id === productId);
    if (index !== -1) {
      const deletedProduct = this.products[index];
      if (deletedProduct) {
        // Дополнительная проверка
        this.products.splice(index, 1);
        console.log(`Товар "${deletedProduct.title}" удален из корзины`);
      }
    } else {
      console.log(`Товар с ID ${productId} не найден в корзине`);
    }
  }

  // Посчитать стоимость товаров в корзине
  getSum(): number {
    const sum = this.products.reduce(
      (total, product) => total + product.price,
      0,
    );
    console.log(`Общая стоимость товаров: ${sum} руб.`);
    return sum;
  }

  // Задать способ доставки
  setDelivery(delivery: Delivery): void {
    this.delivery = delivery;

    if (delivery instanceof HomeDelivery) {
      console.log(
        `Установлена доставка на дом по адресу: ${delivery.address} на дату ${delivery.date.toLocaleDateString()}`,
      );
    } else if (delivery instanceof ShopDelivery) {
      console.log(
        `Установлена доставка в магазин ID: ${delivery.shopId} на сегодня`,
      );
    }
  }

  // Проверить готовность к оформлению заказа
  checkout(): boolean {
    if (this.products.length === 0) {
      console.log("Ошибка: Корзина пуста");
      return false;
    }

    if (!this.delivery) {
      console.log("Ошибка: Не выбран способ доставки");
      return false;
    }

    console.log("✓ Все готово к оформлению заказа!");
    return true;
  }

  // Получить содержимое корзины (для демонстрации)
  getCartInfo(): void {
    console.log("\n=== Содержимое корзины ===");
    if (this.products.length === 0) {
      console.log("Корзина пуста");
    } else {
      this.products.forEach((p) => {
        console.log(`- ${p.title}: ${p.price} руб.`);
      });
      console.log(`Итого: ${this.getSum()} руб.`);
    }

    if (this.delivery) {
      if (this.delivery instanceof HomeDelivery) {
        console.log(
          `Доставка на дом: ${this.delivery.address}, ${this.delivery.date.toLocaleDateString()}`,
        );
      } else if (this.delivery instanceof ShopDelivery) {
        console.log(`Самовывоз из магазина №${this.delivery.shopId} сегодня`);
      }
    }
    console.log("=========================\n");
  }
}

// Демонстрация работы
function demo() {
  // Создаем продукты
  const product1 = new Product(1, "Ноутбук", 75000);
  const product2 = new Product(2, "Мышь", 1500);
  const product3 = new Product(3, "Клавиатура", 3500);

  // Создаем корзину
  const cart = new Cart();

  // Добавляем продукты
  cart.addProduct(product1);
  cart.addProduct(product2);
  cart.addProduct(product3);

  cart.getCartInfo();

  // Удаляем продукт
  cart.deleteProduct(2);
  cart.getCartInfo();

  // Устанавливаем доставку на дом
  const homeDelivery = new HomeDelivery(
    new Date("2024-12-25"),
    "ул. Ленина, д. 10, кв. 25",
  );
  cart.setDelivery(homeDelivery);

  cart.getCartInfo();

  // Проверяем готовность к оформлению
  cart.checkout();

  console.log("\n--- Другой пример: доставка в магазин ---\n");

  // Создаем новую корзину
  const cart2 = new Cart();
  cart2.addProduct(product1);

  // Устанавливаем доставку в магазин
  const shopDelivery = new ShopDelivery(123);
  cart2.setDelivery(shopDelivery);

  cart2.getCartInfo();
  cart2.checkout();
}

// Запускаем демонстрацию
demo();
