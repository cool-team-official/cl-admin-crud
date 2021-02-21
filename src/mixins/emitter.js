function broadcast(componentName, eventName, params) {
	this.$children.forEach((child) => {
		let name = child.$options._componentTag;

		if (name === componentName) {
			child.$emit.apply(child, [eventName].concat(params));
		} else {
			broadcast.apply(child, [componentName, eventName].concat([params]));
		}
	});
}

export default {
	methods: {
		dispatch(componentName, eventName, params) {
			let parent = this.$parent || this.$root;
			let name = parent.$options._componentTag;

			while (parent && (!name || name !== componentName)) {
				parent = parent.$parent;

				if (parent) {
					name = parent.$options._componentTag;
				}
			}
			if (parent) {
				parent.$emit.apply(parent, [eventName].concat(params));
			}
		},
		broadcast(componentName, eventName, params) {
			broadcast.call(this, componentName, eventName, params);
		}
	}
};
