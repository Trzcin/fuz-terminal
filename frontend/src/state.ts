function store<T>(initialValue: T) {
    let value = initialValue;
    let subscribers: ((value: T) => void)[] = [];

    return {
        get value() {
            return value;
        },
        subscribe(handler: (value: T) => void) {
            subscribers.push(handler);
        },
        unsubscribe(handler: (value: T) => void) {
            subscribers = subscribers.filter((s) => s != handler);
        },
        set value(newValue: T) {
            value = newValue;
            subscribers.forEach((s) => s(newValue));
        },
    };
}

export interface TerminalState {
    id: string;
    title: string;
    subtitle: string;
    active: boolean;
}

export const terminals = store<TerminalState[]>([]);
