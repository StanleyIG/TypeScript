def uni(name):
    print(f"Инициализация: {name}")

    def decorator(func):
        # Сработает СРАЗУ при определении
        print("Декоратор")
        return func

    return decorator


class MyClass:
    @uni("Метод")
    def method(self, a):
        print(a)


obj = MyClass()
obj.method(100)
