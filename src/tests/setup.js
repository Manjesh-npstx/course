const createStorageMock = () => {
    let store = {};
    return {
        getItem: (key) => store[key] || null,
        setItem: (key, val) => {
            store[key] = String(val);
        },
        removeItem: (key) => {
            delete store[key];
        },
        clear: () => {
            store = {};
        },
    };
};

if (!globalThis.localStorage) {
    globalThis.localStorage = createStorageMock();
}
