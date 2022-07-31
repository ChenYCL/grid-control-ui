import x from 'js-sha256'
export const sha256_hmac = (p: { key: string, text: string }) =>
    x.sha256.hmac(p.key, p.text)