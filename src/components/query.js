export default {
	name: "cl-query",

	componentName: "ClQuery",

	inject: ["crud"],

	props: {
		value: null,
		multiple: Boolean,
		list: {
			type: Array,
			required: true
		},
		callback: Function,
		field: {
			type: String,
			default: "query"
		}
	},

	data() {
		return {
			list2: []
		};
	},

	watch: {
		value: {
			immediate: true,
			handler: 'setList'
		},

		list() {
			this.setList(this.value)
		}
	},

	methods: {
		setList(val) {
			let arr = [];

			if (val instanceof Array) {
				arr = val;
			} else {
				arr = [val];
			}

			if (!this.multiple) {
				arr.splice(1);
			}

			this.list2 = (this.list || []).map((e) => {
				this.$set(
					e,
					"active",
					arr.some((v) => v === e.value)
				);
				return e;
			});
		},

		selectRow(item) {
			if (item.active) {
				item.active = false;
			} else {
				if (this.multiple) {
					item.active = true;
				} else {
					this.list2.map((e) => {
						e.active = e.value == item.value;
					});
				}
			}

			const selects = this.list2.filter((e) => e.active).map((e) => e.value);
			const value = this.multiple ? selects : selects[0];

			if (this.callback) {
				this.callback(value);
			} else {
				this.crud.refresh({
					[this.field]: value
				});

				this.$emit('change', value)
			}
		}
	},

	render() {
		return (
			<div class="cl-query">
				{this.list2.map((item, index) => {
					return (
						<button
							key={index}
							class={{ "is-active": item.active }}
							on-click={(event) => {
								this.selectRow(item);
								event.preventDefault();
							}}>
							<span>{item.label}</span>
						</button>
					);
				})}
			</div>
		);
	}
};
