import request from 'request'
import { safeJSONParse } from "../func/safeJSONParse"

export const httpRequest = <T>({
    method = 'GET',
    url,
    body = undefined,
    headers = {},
}: {
    method?: string
    url: string
    body?: any
    headers?: { [key: string]: string }
}) =>
    new Promise<T | undefined>((resolve) => request({
        timeout: 1000 * 60, //超时1分钟
        method,
        url,
        headers,
        body: body === undefined ? undefined : JSON.stringify(body),
        // agent: getAgentWithURL(url),
    }, (_, response) => {
        if (response.statusCode >= 200 && response.statusCode < 400 && response !== undefined) {
            resolve(safeJSONParse(String(response.body)))
        } else {
            // console.log(
            //     url,
            //     response.statusCode,
            //     response.body,
            // )
            resolve(undefined)
        }
    }))