interface IPayment {
  sum: number;
  from: number;
  to: number;
}

enum PaymentStatus {
  Success = "success",
  Failed = "failed",
}

interface IPaymentRequest extends IPayment {}

interface IDataSuccess extends IPayment {
  databaseId: number;
}

interface IDataFailed {
  errorMessage: string;
  errorCode: number;
}

interface IResponseSuccess {
  status: PaymentStatus.Success;
  data: IDataSuccess;
}

interface IResponseFailed {
  status: PaymentStatus.Failed;
  data: IDataFailed;
}

// 1. Объявляем общий тип (Union Type) для ответа
type PaymentResponse = IResponseSuccess | IResponseFailed;

// 2. Создаем Type Guard функцию isSuccess
// Эта функция помогает TypeScript'у понять, с каким именно типом ответа мы имеем дело.
// Функция возвращает boolean, но благодаря конструкции "res is IResponseSuccess"
// TypeScript понимает: если true -> тип IResponseSuccess, если false -> IResponseFailed.
function isSuccess(res: PaymentResponse): res is IResponseSuccess {
  // Проверяем, равен ли статус в объекте значению Success из enum
  return res.status === PaymentStatus.Success;
}

// 3. Функция getIdFromData, которая использует наш Type Guard
// Принимает объект типа PaymentResponse и возвращает number (databaseId)
function getIdFromData(res: PaymentResponse): number | Error {
  // Используем isSuccess для проверки
  if (isSuccess(res)) {
    // В этой ветке TypeScript точно знает, что res — это IResponseSuccess.
    // Поэтому мы можем безопасно обратиться к res.data.databaseId.
    return res.data.databaseId;
  } else {
    // В этой ветке TypeScript точно знает, что res — это IResponseFailed.
    // Генерируем ошибку с данными из ответа.
    throw new Error(
      `Ошибка платежа: ${res.data.errorMessage} (Код: ${res.data.errorCode})`,
    );
  }
}

// --- Пример использования ---

// Пример успешного ответа (например, от API)
const successResponse: IResponseSuccess = {
  status: PaymentStatus.Success,
  data: {
    sum: 1000,
    from: 12345,
    to: 67890,
    databaseId: 555,
  },
};

// Пример неуспешного ответа
const failedResponse: IResponseFailed = {
  status: PaymentStatus.Failed,
  data: {
    errorMessage: "Недостаточно средств",
    errorCode: 422,
  },
};

// Пробуем получить ID из успешного ответа
try {
  const paymentId = getIdFromData(successResponse);
  console.log("Платеж успешен, ID в БД:", paymentId);
} catch (error) {
  // Проверяем, является ли ошибка экземпляром класса Error
  if (error instanceof Error) {
    console.error(error.message);
  } else {
    // Обрабатываем случай, если это не стандартная ошибка
    console.error("Произошла неизвестная ошибка", error);
  }
}

// Пробуем получить ID из неуспешного ответа
try {
  const paymentId = getIdFromData(failedResponse);
  console.log("Платеж успешен, ID в БД:", paymentId); // Этот код не выполнится
} catch (error) {
  // Сработает этот блок
  if (error instanceof Error) {
    console.error(error.message); // Выведет: Ошибка платежа: Недостаточно средств (Код: 422)
  } else {
    console.error("Произошла неизвестная ошибка", error, typeof error);
  }
}
