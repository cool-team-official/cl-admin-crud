import { isArray } from "@/utils";

export default {
	name: "cl-form-tabs",
	props: {
		value: [String, Number],
		labels: {
			type: Array,
			default: () => []
		},
		justify: {
			type: String,
			default: "center"
		}
	},
	data() {
		return {
			active: null,
			list: []
		};
	},
	mounted() {
		if (isArray(this.labels) && this.labels.length > 0) {
			this.list = this.labels;
			this.update(this.list[0].value);
		}
	},
	methods: {
		update(val) {
			this.active = val;
			this.$emit("input", val);
		}
	},
	render() {
		return (
			<div class="cl-form-tabs">
				<ul style={{ "justify-content": this.justify }}>
					{this.list.map((e) => {
						return (
							<li
								class={{ "is-active": e.value === this.active }}
								onclick={() => {
									this.update(e.value);
								}}>
								{e.label}
							</li>
						);
					})}
				</ul>
			</div>
		);
	}
};
