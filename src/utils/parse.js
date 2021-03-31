import { isString, isBoolean, isFunction } from "./index";

/**
 * 解析 hidden 参数的几个场景
 * 1 Boolean
 * 2 Function({ scope })
 * 3 :[prop] is bind form[prop] value
 * @param {*} value
 */
export default function (method, { value, scope, data = {} }) {
	if (method === "hidden") {
		if (isBoolean(value)) {
			return value;
		} else if (isString(value)) {
			const prop = value.substring(1, value.length);

			switch (value[0]) {
				case "@":
					return !scope[prop];
				case ":":
					return data[prop];
			}
		} else if (isFunction(value)) {
			return value({ scope, ...data });
		}

		return false;
	}
}
