const store = new Map();

function putData(key, value){
    store.set(key, value);
    // console.log({storedData: value});
}

function getData(key) {
    return store.get(key);
}

