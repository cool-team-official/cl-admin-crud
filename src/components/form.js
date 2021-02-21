import { deepMerge, isFunction, cloneDeep } from "@/utils";
import { renderNode } from "@/utils/vnode";
import Parse from "@/utils/parse";
import { Form, Emitter, Screen } from "@/mixins";
import { __inst } from "@/global";

export default {
	name: "cl-form",
	componentName: "ClForm",
	mixins: [Emitter, Screen, Form],
	props: {
		// Bind value
		value: {
			type: Object,
			default: () => {
				return {};
			}
		}
	},
	data() {
		return {
			visible: false,
			saving: false,
			loading: false,
			form: {},
			conf: {
				on: {
					open: null,
					submit: null,
					close: null
				},
				props: {
					fullscreen: false,
					"close-on-click-modal": false,
					"append-to-body": true,
				},
				op: {
					hidden: false,
					saveButtonText: "保存",
					closeButtonText: "取消",
					layout: ["close", "save"]
				},
				hdr: {
					hidden: false,
					opList: ["fullscreen", "close"]
				},
				items: [],
				_data: {}
			}
		};
	},
	watch: {
		value: {
			immediate: true,
			deep: true,
			handler(val) {
				this.form = val;
			}
		},
		form: {
			immediate: true,
			handler(val) {
				this.$emit("input", val);
			}
		}
	},
	methods: {
		open(options = {}) {
			// Merge conf
			for (let i in this.conf) {
				if (i == "items") {
					this.conf.items = cloneDeep(options.items || []);
				} else {
					deepMerge(this.conf[i], options[i]);
				}
			}

			// Show dialog
			this.visible = true;

			// Preset form
			if (options.form) {
				for (let i in options.form) {
					this.$set(this.form, i, options.form[i]);
				}
			}

			// Set form data by items
			this.conf.items.map((e) => {
				if (e.prop) {
					// Priority use form data
					this.$set(this.form, e.prop, this.form[e.prop] || cloneDeep(e.value));
				}
			});

			// Open callback
			const { open } = this.conf.on;

			if (open) {
				this.$nextTick(() => {
					open(this.form, {
						close: this.close,
						submit: this.submit,
						done: this.done
					});
				});
			}
		},

		beforeClose() {
			if (this.conf.on.close) {
				this.conf.on.close(this.close);
			} else {
				this.close()
			}
		},

		close() {
			this.visible = false;
			this.clear();
			this.done();
		},

		done() {
			this.saving = false;
		},

		clear() {
			for (let i in this.form) {
				delete this.form[i]
			}
			this.clearForm()
		},

		submit() {
			// Validate form
			this.$refs["form"].validate(async (valid) => {
				if (valid) {
					this.saving = true;

					// Hooks event
					const { submit } = this.conf.on;

					// Get mount variable
					const { $refs } = __inst;

					// Hooks by onSubmit
					if (isFunction(submit)) {
						let d = cloneDeep(this.form);

						// Filter hidden data
						this.conf.items.forEach((e) => {
							if (e._hidden) {
								delete d[e.prop];
							}
						});

						submit(d, {
							done: this.done,
							close: this.close,
							$refs
						});
					} else {
						console.error("on[submit] is not found");
					}
				}
			});
		},

		showLoading() {
			this.loading = true;
		},

		hiddenLoading() {
			this.loading = false;
		},

		collapseItem(item) {
			if (item.collapse !== undefined) {
				item.collapse = !item.collapse;
			}
		},

		formRender() {
			const { props, items } = this.conf;

			return (
				<el-form
					ref="form"
					class="cl-form"
					{...{
						props: {
							size: "small",
							"label-width": "100px",
							"label-position": this.isFullscreen ? "top" : "",
							disabled: this.saving,
							model: this.form,
							...props
						}
					}}>
					<el-row gutter={10} v-loading={this.loading}>
						{items.map((e, i) => {
							// Is hidden
							e._hidden = Parse("hidden", {
								value: e.hidden,
								scope: this.form,
								data: this.conf._data
							});

							// Is flex
							if (e.flex === undefined) {
								e.flex = true;
							}

							return (
								!e._hidden && (
									<el-col
										key={`form-item-${i}`}
										{...{
											props: {
												key: i,
												span: 24,
												...e
											}
										}}>
										{e.component && (
											<el-form-item
												{...{
													props: {
														label: e.label,
														prop: e.prop,
														rules: e.rules,
														...e.props
													}
												}}>
												{/* Redefine label */}
												<template slot="label">
													<span
														on-click={() => {
															this.collapseItem(e);
														}}>
														{e.label}
													</span>
												</template>

												{/* Form item */}
												<div class="cl-form-item">
													{/* Component */}
													{["prepend", "component", "append"].map(
														(name) => {
															return (
																e[name] && (
																	<div
																		class={[
																			`cl-form-item__${name}`,
																			{
																				"is-flex": e.flex
																			}
																		]}
																		v-show={!e.collapse}>
																		{renderNode(e[name], {
																			prop: e.prop,
																			scope: this.form,
																			$scopedSlots: this
																				.$scopedSlots
																		})}
																	</div>
																)
															);
														}
													)}

													{/* Collapse button */}
													<div
														class="cl-form-item__collapse"
														v-show={e.collapse}
														on-click={() => {
															this.collapseItem(e);
														}}>
														<el-divider content-position="center">
															点击展开，查看更多
															<i class="el-icon-arrow-down"></i>
														</el-divider>
													</div>
												</div>
											</el-form-item>
										)}
									</el-col>
								)
							);
						})}
					</el-row>
				</el-form>
			);
		},

		footerRender() {
			const { hidden, layout, saveButtonText, closeButtonText } = this.conf.op;
			const { size = "small" } = this.conf.props;

			return (
				!hidden &&
				layout.map((vnode) => {
					if (vnode == "save") {
						return (
							<el-button
								{...{
									props: {
										size,
										type: "success",
										disabled: this.loading,
										loading: this.saving
									},
									on: {
										click: this.submit
									}
								}}>
								{saveButtonText}
							</el-button>
						);
					} else if (vnode == "close") {
						return (
							<el-button
								{...{
									props: {
										size
									},
									on: {
										click: this.beforeClose
									}
								}}>
								{closeButtonText}
							</el-button>
						);
					} else {
						return renderNode(vnode, {
							scope: this.form,
							$scopedSlots: this.$scopedSlots
						});
					}
				})
			);
		}
	},

	render() {
		const { props, hdr } = this.conf;

		return (
			<div class="cl-form">
				<cl-dialog
					visible={this.visible}
					{...{
						props: {
							title: props.title,
							opList: hdr.opList,
							props: {
								...props,
								'before-close': this.beforeClose
							}
						},
						on: {
							'update:visible': (v) => (this.visible = v),
							"update:props:fullscreen": (v) => (props.fullscreen = v)
						}
					}}>
					<div class="cl-form__container">{this.formRender()}</div>
					<div class="cl-form__footer" slot="footer">
						{this.footerRender()}
					</div>
				</cl-dialog>
			</div>
		);
	}
};
