import { deepMerge, isFunction } from "@/utils";
import { __inst } from "@/global";

export const bootstrap = (that) => {
	// eslint-disable-next-line
	const { conf, refresh, event, id, fn } = that;

	const app = {
		refresh(d) {
			return isFunction(d) ? d(that.params, refresh) : refresh(d);
		}
	};

	const ctx = (data) => {
		deepMerge(that, data);

		return ctx;
	};

	ctx.id = id;

	ctx.conf = (d) => {
		deepMerge(conf, d);

		return ctx;
	};

	ctx.service = (d) => {
		that.service = d;

		if (fn.permission) {
			that.permission = fn.permission(that);
		}

		return ctx;
	};

	ctx.permission = (x) => {
		if (isFunction(x)) {
			that.permission = x(that);
		} else {
			deepMerge(that.permission, x);
		}

		return ctx;
	};

	ctx.set = (key, value) => {
		deepMerge(that[key], value);

		return ctx;
	};

	["on", "once"].forEach((n) => {
		ctx[n] = (name, cb) => {
			event[name] = {
				mode: n,
				callback: cb
			};

			return ctx;
		};
	});

	ctx.done = () => {
		that.done();
	};

	return { ctx, app };
};
