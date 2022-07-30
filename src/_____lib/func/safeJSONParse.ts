const JSONbigString =
    typeof window === 'undefined' ?
        require('json-bigint')({ storeAsString: true })
        : JSON

export const safeJSONParse = (str: string) => {
    try {
        return JSONbigString.parse(str, (_: any, v: any) => {
            if (v && typeof v === 'object' && !Array.isArray(v)) {
                return Object.assign(Object.create(null), v)
            }
            return v
        })
    } catch (e) {
        return undefined
    }
}