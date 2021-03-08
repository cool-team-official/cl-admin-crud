import { isArray, isFunction, isObject, isString } from '@/utils'

export const format = {
    number(value) {
        return isArray(value) ? value.map(Number) : Number(value)
    },
    string(value) {
        return isArray(value) ? value.map(String) : String(value)
    },
    split(value, separator = ',') {
        return value.split(separator)
    },
    join(value, separator = ',') {
        return value.join(separator)
    },
    boolean(value) {
        return Boolean(value)
    },
    booleanNumber(value) {
        return Boolean(value) ? 1 : 0
    }
}

export const api = {
    'multiple'() {

    }
}

function parse(method, { value, pipe, form }) {
    if (value === undefined) {
        return value
    }

    if (!pipe) {
        return value
    }

    let pipes = []

    if (isString(pipe)) {
        if (api[pipe]) {
            pipes = api[pipe][method]
        } else {
            if (format[pipe]) {
                pipes = [pipe]
            } else {
                console.error(`${piep} is not found.`)
                return value
            }
        }
    } else if (isArray(pipe)) {
        pipes = pipe
    } else if (isObject(pipe)) {
        pipes = isArray(pipe[method]) ? pipe[method] : [pipe[method]]
    } else if (isFunction(pipe)) {
        pipes = [pipe]
    } else {
        console.error(`Pipe data error!`)
        return value
    }

    let d = value;

    pipes.forEach(e => {
        if (isString(e)) {
            d = format[e](d)
        } else {
            d = e(d, form)
        }
    })

    return d
}

export default {
    bind(value, pipe, form) {
        return parse('bind', { value, pipe, form })
    },

    submit(value, pipe, form) {
        return parse('submit', { value, pipe, form })
    }
}