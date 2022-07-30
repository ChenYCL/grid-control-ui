import { mapObjIndexed } from "ramda"

export const toType = <T>(sample: T) => (data: any): T => {
    if (typeof sample === 'number') {
        let n = Number(data) as any
        if (isNaN(n)) n = 0
        return n
    }
    else if (typeof sample === 'string') {
        return String(data) as any
    }
    else if (typeof sample === 'boolean') {
        return Boolean(data) as any
    }
    else if (Array.isArray(sample)) {
        const arr = data instanceof Array ? data : []
        return arr.map(toType(sample[0])) as any
    }
    else if (typeof sample === 'object') {
        const obj = typeof data === 'object' && data !== null && Array.isArray(data) === false ? data : {}
        return mapObjIndexed((value, key) => toType(value)(obj[key]), sample as any) as any
    } else {
        return {} as any
    }
}