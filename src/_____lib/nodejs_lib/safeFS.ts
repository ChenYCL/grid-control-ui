import * as fs from "fs"
import { safeJSONParse } from "../func/safeJSONParse"
import { dirname } from "path"

export namespace safeFS {
    export const readdirSync = (s: string) => {
        try {
            return fs.readdirSync(s)
        } catch (err) {
            return []
        }
    }

    // 递归创建目录 同步方法
    export const mkdirsSync = (path: string) => {
        if (fs.existsSync(path)) {
            return true
        } else if (mkdirsSync(dirname(path))) {
            fs.mkdirSync(path)
            return true
        } else {
            return false
        }
    }

    const readFileSync = (path: string) => {
        try {
            return fs.readFileSync(path, { encoding: 'utf8' })
        } catch {
            return ''
        }
    }

    export const readJSONFile = (path: string) =>
        safeJSONParse(readFileSync(path))

    export const writeJSONFile = (path: string, obj: any) => {
        const dir = dirname(path)
        if (fs.existsSync(dir) === false) {
            mkdirsSync(dir)
        }
        fs.writeFileSync(path, JSON.stringify(obj, null, 4), { encoding: 'utf8' })
    }

    export const readBufferFile = (path: string) => {
        try {
            return fs.readFileSync(path)
        } catch {
            return Buffer.alloc(0)
        }
    }
    export const writeBufferFile = (path: string, buffer: Buffer) => {
        const dir = dirname(path)
        if (fs.existsSync(dir) === false) {
            mkdirsSync(dir)
        }
        fs.writeFileSync(path, buffer)
    }


}