import { isArray, isEmpty } from "@/utils";

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
		},
		color: {
			type: String,
			default: "#409EFF"
		}
	},

	data() {
		return {
			active: null,
			list: [],
			line: {
				width: "",
				offsetLeft: ""
			}
		};
	},

	watch: {
		value: {
			handler(val) {
				this.update(val)
			}
		}
	},

	mounted() {
		if (isArray(this.labels) && this.labels.length > 0) {
			this.list = this.labels;
			this.update(isEmpty(this.value) ? this.list[0].value : this.value);
		}
	},

	methods: {
		update(val) {
			this.$nextTick(() => {
				let index = this.list.findIndex((e) => e.value === val);
				let item = this.$refs[`tab-${index}`];

				if (item) {
					// 下划线位置
					this.line = {
						width: item.clientWidth + "px",
						transform: `translateX(${item.offsetLeft}px)`,
						"background-color": this.color
					};

					// 靠左位置
					let left =
						item.offsetLeft + (item.clientWidth - document.body.clientWidth) / 2 + 15;

					if (left < 0) {
						left = 0;
					}

					// 设置滚动距离
					this.$refs.tabs.scrollLeft = left;
				}
			});

			this.active = val;

			this.$emit("input", val);
			this.$emit("change", val);
		}
	},

	render() {
		return (
			<div class="cl-form-tabs">
				<ul style={{ "text-align": this.justify }} ref="tabs">
					{this.list.map((e, i) => {
						return (
							<li
								ref={`tab-${i}`}
								class={{ "is-active": e.value === this.active }}
								style={{
									color: e.value === this.active ? this.color : "#444"
								}}
								onclick={() => {
									this.update(e.value);
								}}>
								{e.label}
							</li>
						);
					})}

					{this.line.width && <div class="cl-form-tabs__line" style={this.line}></div>}
				</ul>
			</div>
		);
	}
};
