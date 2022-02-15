const store = new Map();

export function putData(key: string, value: any): void{
    store.set(key, value);
    // console.log({storedData: value});
}

export function getData(key: string): any {
    return store.get(key);
}

