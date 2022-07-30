import { safeJSONParse } from "../func/safeJSONParse"

export enum OPCode {
    set = 0,
    updateLast,
    push,
}

type OP_set = [
    type: OPCode.set,
    path: string[],
    value: any,
]

type OP_updateLast = [
    type: OPCode.updateLast,
    path: string[],
    value: any,
]

type OP_push = [
    type: OPCode.push,
    path: string[],
    value: any[],
    pushTo: number,//同一个路径 必须相同
]

export type OP = OP_set | OP_updateLast | OP_push
type RemoveArray<T> = T extends Array<infer A> ? A : never

export class RealDB<T>{
    mutableData: T
    private allBuf: string
    private OPList: OP[] = []

    constructor(mutableData: T) {
        this.mutableData = mutableData
        this.allBuf = JSON.stringify(mutableData)
    }

    getBuffer() {
        if (this.OPList.length === 0) {
            return {
                allBuf: this.allBuf,
                diffBuffer: undefined,
            }
        }





        /*
        let set: { [key: string]: OP_set } = {}
        let push: { [key: string]: OP_push } = {}
        let updateLast: { [key: string]: OP_updateLast } = {}

        this.OPList.forEach(op => {
            const [type, path] = op
            const key = path.join('\n')
            if (type === OPCode.set) {
                //子节点 set updateLast push 清空 
                Object.keys(set).forEach(k => {
                    if (k.indexOf(key) === 0) delete set[k]
                })

                Object.keys(updateLast).forEach(k => {
                    if (k.indexOf(key) === 0) delete updateLast[k]
                })
                Object.keys(push).forEach(k => {
                    if (k.indexOf(key) === 0) delete push[k]
                })
                set[key] = op //覆盖
            }
            else if (type === OPCode.push) {
                const 删掉 = updateLast[key]
                delete updateLast[key]

                if (push[key] === undefined) {
                    if (删掉) {
                        //修改last
                        op[2][op[2].length - 1] = 删掉[2]
                    }
                    push[key] = op
                } else {
                    if (删掉) {
                        //修改last
                        push[key][2][push[key][2].length - 1] = 删掉[2]
                    }
                    push[key][2].push(...op[2])
                }

            }
            else if (type === OPCode.updateLast) {
                updateLast[key] = op //覆盖就行了
            }
        })

        this.OPList = []
        this.allBuf = JSON.stringify(this.mutableData)

        //set push updateLast 按顺序
        return {
            allBuf: this.allBuf,
            diffBuffer: JSON.stringify([
                ...Object.values(set),
                ...Object.values(push),
                ...Object.values(updateLast),
            ])
        }
        */
        //有BUG




        //
        const diffBuffer = JSON.stringify(this.OPList)
        this.OPList = []
        this.allBuf = JSON.stringify(this.mutableData)

        return {
            allBuf: this.allBuf,
            diffBuffer,
        }
    }

    setFirstBuffer(buf: string) {
        this.allBuf = buf
        this.mutableData = safeJSONParse(buf) as any
    }

    setDiffBuffer(buf: string) {
        const arr = safeJSONParse(buf) as OP[]
        arr.forEach(v => this.exeOP(v, 'client'))
        return arr
    }

    需要保存 = false
    private exeOP = (op: OP, __type__: 'server' | 'client') => {
        if (op[1][0] === 'state') {
            this.需要保存 = true
        }

        if (__type__ === 'server') {
            this.OPList.push(op)
        }
        const [type, path, value, pushTo] = op
        if (path.length !== 0) {
            const key = path[path.length - 1]
            const obj = path.reduce((prev: any, current, i) => i === path.length - 1 ? prev : prev[current], this.mutableData)

            if (type === OPCode.set) {
                if (value === undefined || value === null) {//JSON传输变成了null  TODO
                    delete obj[key]
                } else {
                    obj[key] = value
                }
            }
            else if (type === OPCode.push) {
                const arr = obj[key] as any[]
                arr.push(...value) //<---------------array
                if (pushTo !== undefined && arr.length > pushTo) {
                    arr.splice(0, arr.length - pushTo)
                }
            }
            else if (type === OPCode.updateLast) {
                const arr = obj[key] as any[]
                arr[arr.length - 1] = value
            }
        }
    }




    //不支持 数组的 key ！！！ 
    __ = <R>(f: (v: T) => R) => {
        let path: string[] = []
        let proxy: any = new Proxy({}, {
            get: (_, k) => {
                path.push(String(k))
                return proxy
            }
        })

        f(proxy) as any as string[]

        return {
            set: (value: R | undefined) => this.exeOP([
                OPCode.set,
                path,
                value,
            ], 'server'),
            push: (value: RemoveArray<R>[], pushTo: number) => this.exeOP([
                OPCode.push,
                path,
                value,//<----------------------- array
                pushTo,
            ], 'server'),
            updateLast: (value: RemoveArray<R>) => this.exeOP([
                OPCode.updateLast,
                path,
                value,
            ], 'server'),
        }
    }
}