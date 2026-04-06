function RequireAuth(allowedRoles: string[]) {
    console.log('1. ВЫЗОВ ФАБРИКИ ДЕКОРАТОРА (выполняется при определении класса)');
    
    return function(target: any, propertyKey: string, descriptor: PropertyDescriptor) {
        console.log('2. ВЫЗОВ ФУНКЦИИ-ДЕКОРАТОРА (выполняется сразу после фабрики)');
        console.log('   target:', target);
        console.log('   propertyKey:', propertyKey);
        console.log('   descriptor:', descriptor);
        
        const originalMethod = descriptor.value;
        
        descriptor.value = function(this: any, ...args: any[]) {
            console.log('3. ВЫЗОВ ОБЕРНУТОЙ ФУНКЦИИ (выполняется при вызове метода)');
            console.log('   this:', this);
            console.log('   args:', args);
            
            const userRole = this.role;
            if (!allowedRoles.includes(userRole)) {
                throw new Error('Доступ запрещен');
            }
            
            return originalMethod.apply(this, args);
        };
        
        return descriptor;
    };
}

class AdminPanel {
    private role: string = 'user';
    
    @RequireAuth(['admin'])  // ← Здесь вызывается фабрика декоратора
    deleteUser(id: number) {
        console.log('4. ВЫПОЛНЕНИЕ ОРИГИНАЛЬНОГО МЕТОДА');
        console.log(`Пользователь ${id} удален`);
    }
}

console.log('=== КЛАСС ОПРЕДЕЛЕН ===\n');
const panel = new AdminPanel();
console.log('=== ЭКЗЕМПЛЯР СОЗДАН ===\n');
console.log('=== ВЫЗЫВАЕМ МЕТОД ===');
panel.deleteUser(123);