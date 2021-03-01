import { Emitter } from "@/mixins";
import { __inst } from "@/store";

export default {
	name: "cl-upsert",
	componentName: "ClUpsert",
	mixins: [Emitter],
	inject: ["crud"],
	props: {
		// Bind value
		value: {
			type: Object,
			default: () => {
				return {};
			}
		},
		// Form items
		items: Array,
		// el-dialog attributes
		props: {
			type: Object,
			default: () => {
				return {};
			}
		},
		// Edit sync
		sync: Boolean,
		// Op buttons
		op: Object,
		// Dialog header object
		dialog: Object,
		// Hook by open { isEdit, data, { submit, done, close } }
		onOpen: Function,
		// Hook by close { action, done }
		onClose: Function,
		// Hook by info { data, { next, done, close } }
		onInfo: Function,
		// Hook by submit { isEdit, data, { next, done, close } }
		onSubmit: Function
	},
	data() {
		return {
			isEdit: false,
			form: {}
		};
	},
	watch: {
		value: {
			immediate: true,
			deep: true,
			handler(val) {
				this.form = val;
			}
		}
	},
	created() {
		this.$on("crud.add", this.add);
		this.$on("crud.append", this.append);
		this.$on("crud.edit", this.edit);
		this.$on("crud.close", this.close);
	},
	mounted() {
		this.extendApi();
	},
	methods: {
		// Add
		async add() {
			this.isEdit = false;
			this.form = {};
			await this.open();
			this.$emit("open", false, {});
		},

		// Append data
		async append(data) {
			this.isEdit = false;

			// Assign data
			if (data) {
				for (let i in data) {
					this.$set(this.form, i, data[i]);
				}
			}

			await this.open();
			this.$emit("open", false, this.form);
		},

		// Edit
		edit(data) {
			const { showLoading, hiddenLoading } = this.$refs["form"];

			// Is edit
			this.isEdit = true;
			// Start loading
			showLoading();

			// Async open form
			if (!this.sync) {
				this.open();
			}

			// Finish
			const done = (data) => {
				// Assign data
				Object.assign(this.form, data);
				hiddenLoading();
			};

			// Close
			const close = () => {
				hiddenLoading();
				this.close();
			};

			// Submit
			const next = (data) => {
				// Get Service and Dict
				const { dict, service } = this.crud;
				// Get api.info
				const reqName = dict.api.info;

				return new Promise((resolve, reject) => {
					// Validate
					if (!service[reqName]) {
						reject(`Request function '${reqName}' is not fount!`);
						hiddenLoading();
						return null;
					}

					// Send request
					service[reqName]({
						id: data.id
					})
						.then((res) => {
							// Finish
							done(res);
							resolve(res);

							// Sync open form
							if (this.sync) {
								this.open();
							}

							// Callback
							this.$emit("open", this.isEdit, this.form);
						})
						.catch((err) => {
							this.$message.error(err);
							reject(err);
						})
						.done(() => {
							hiddenLoading();
						});
				});
			};

			// Hook by onInfo
			if (this.onInfo) {
				this.onInfo(data, {
					next,
					done: (data) => {
						done(data);
						this.$emit("open", true, this.form);
					},
					close
				});
			} else {
				next(data);
			}
		},

		// Open
		open() {
			const { saveButtonText, closeButtonText } = this.crud.dict.label;

			return new Promise((resolve) => {
				this.$refs["form"].open({
					title: this.isEdit ? "编辑" : "新增",
					props: {
						...this.props
					},
					on: {
						open: (data, { done, close }) => {
							if (this.onOpen) {
								this.onOpen(this.isEdit, this.form, {
									submit: () => {
										this.submit(this.form);
									},
									done,
									close
								});
							}

							resolve();
						},
						submit: this.submit,
						close: this.beforeClose
					},
					op: {
						saveButtonText,
						closeButtonText,
						...this.op
					},
					dialog: this.dialog,
					items: this.items,
					_data: {
						isEdit: this.isEdit
					},
				});
			});
		},

		// Close
		close() {
			this.$refs["form"].close();
			this.$emit("close");
		},

		// Before close
		beforeClose() {
			if (this.onClose) {
				this.onClose(this.close);
			} else {
				this.close();
			}
		},

		/**
		 * Submit form
		 * @param {object} data
		 */
		submit(data, { done }) {
			// Get Service and Dict
			const { dict, service } = this.crud;

			// Submit
			const next = (data) => {
				return new Promise((resolve, reject) => {
					// Judge update or add
					const func = this.isEdit ? "update" : "add";
					// Get request function
					const reqName = dict.api[func];

					// Validate
					if (!service[reqName]) {
						done();
						return reject(`Request function '${reqName}' is not fount!`);
					}

					// Send request
					service[reqName](data)
						.then((res) => {
							this.$message.success("保存成功");
							// Close
							this.close("submit");
							// Refresh
							this.crud.refresh();
							// Callback
							resolve(res);
						})
						.catch((err) => {
							this.$message.error(err);
							reject(err);
						})
						.done(done);
				});
			};

			// Hook by onSubmit
			if (this.onSubmit) {
				// Get mount variable
				const { $refs } = __inst;

				this.onSubmit(this.isEdit, data, {
					$refs,
					done,
					next,
					close: () => {
						this.close("submit");
					}
				});
			} else {
				next(data);
			}
		},

		// Extends form api
		extendApi() {
			const list = [
				"getForm",
				"setForm",
				"setData",
				"setOptions",
				"toggleItem",
				"hiddenItem",
				"showItem",
				"showLoading",
				"hiddenLoading",
				"resetFields",
				"clearValidate",
				"validateField",
				"validate",
			];

			list.forEach((n) => {
				this[n] = this.$refs["form"][n];
			});
		}
	},

	render() {
		return (
			<div class="cl-upsert">
				<cl-form
					ref="form"
					v-model={this.form}
					{...{
						scopedSlots: {
							...this.$scopedSlots
						}
					}}></cl-form>
			</div>
		);
	}
};
