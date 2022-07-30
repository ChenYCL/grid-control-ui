export class SubPub<T = void> {

    private arr: ((obj: T) => void)[] = []

    subscribe(f: (obj: T) => void) {
        this.arr.push(f)
    }

    publish(obj: T) {
        this.arr.forEach(f => f(obj))
    }
}