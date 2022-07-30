// import { createHmac } from "crypto"
// export const sha256_hmac = (p: { key: string, text: string }) =>
//     createHmac('sha256', p.key).update(p.text).digest('hex')


import * as x from 'js-sha256'
export const sha256_hmac = (p: { key: string, text: string }) =>
    x.sha256.hmac(p.key, p.text)