# def uni(name):
#     print(f"Инициализация: {name}")

#     def decorator(func):
#         # Сработает СРАЗУ при определении
#         print("Декоратор")
#         return func

#     return decorator


# class MyClass:
#     @uni("Метод")
#     def method(self, a):
#         print(a)


# obj = MyClass()
# obj.method(100)


import types

# === Шаг 1: Создаем примитивный Future для наглядности ===
class FakeFuture:
    def __init__(self):
        self._state = "PENDING"
        print("      [FakeFuture.__init__] Создан Future")
    
    def __await__(self):
        print("      [FakeFuture.__await__] Меня дёрнули через await!")
        # Именно здесь происходит магия: yield self
        yield self
        print("      [FakeFuture.__await__] Меня разбудили! Возвращаю результат")
        return "РЕЗУЛЬТАТ_ИЗ_FUTURE"

# === Шаг 2: Имитация asyncio.sleep ===
async def sleep(seconds):
    print(f"  [sleep] Начало (сек={seconds})")
    future = FakeFuture()
    print(f"  [sleep] Создал FakeFuture, делаю await...")
    result = await future
    print(f"  [sleep] Проснулся, получил: {result}")
    return f"sleep({seconds}) done"

# === Шаг 3: Цепочка корутин ===
async def test():
    print(f"[test] Начало")
    res = await sleep(1)
    print(f"[test] sleep вернул: {res}")
    return "test_result"

async def main():
    print(f"[main] Начало")
    res = await test()
    print(f"[main] test вернул: {res}")
    return "main_result"

# === ШАГ 4: РУЧНОЙ ЗАПУСК (эмуляция Task._step) ===

print("\n>>> СОЗДАЕМ КОРУТИНУ main()")
coro = main()  # Это корутина (объект типа coroutine)
print(f"Тип coro: {type(coro)}")
print(f"Это генератор? {isinstance(coro, types.GeneratorType)}")

print("\n>>> ПЕРВЫЙ ВЫЗОВ coro.send(None)")
try:
    # === ТОТ САМЫЙ result = self._coro.send(None) ===
    result = coro.send(None)
    print(f"\n[Task._step] ПОЛУЧЕН result: {result}")
    print(f"[Task._step] Тип result: {type(result)}")
    print(f"[Task._step] Это Future-like объект: {result}")

except StopIteration as e:
    print(f"СРАЗУ ЗАВЕРШИЛОСЬ с результатом: {e.value}")

print("\n>>> ИМИТАЦИЯ ПРОБУЖДЕНИЯ (через 1 сек)")
# Эмулируем вызов Future.set_result() и колбэка __wakeup
print("Event Loop: Таймер сработал, вызываем Future.__wakeup -> Task._step")

# В реальности Future вызывает колбэк, который делает coro.send(None) снова
try:
    # === ВТОРОЙ ВЫЗОВ coro.send(None) ПОСЛЕ ПРОБУЖДЕНИЯ ===
    final_result = coro.send(None)
    print(f"[Task._step] ПОЛУЧЕН result после пробуждения: {final_result}")

except StopIteration as e:
    # === ЛОВИМ StopIteration ===
    print(f"\n[Task._step] ПОЙМАЛ StopIteration!")
    print(f"[Task._step] Результат задачи: {e.value}")
    print(f"[Task] Вызываю self.set_result({e.value})")