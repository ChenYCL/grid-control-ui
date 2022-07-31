//@ts-ignore
import qs from 'qs'
export const queryString = {
    stringify: qs.stringify as (obj: any) => string,
    parse: qs.parse as (str: string) => any,
}