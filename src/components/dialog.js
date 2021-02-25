import { renderNode } from "@/utils/vnode";
import { isBoolean } from "@/utils";
import { Screen } from '@/mixins'

export default {
	name: "cl-dialog",
	componentName: "ClDialog",
	props: {
		visible: Boolean,
		title: {
			type: String,
			default: "对话框"
		},
		width: {
			type: String,
			default: '50%'
		},
		drag: {
			type: Boolean,
			default: true
		},
		// el-dialog attributes
		props: {
			type: Object,
			default: () => {
				return {};
			}
		},
		// el-dialog event
		on: {
			type: Object,
			default: () => {
				return {};
			}
		},
		controls: {
			type: Array,
			default: () => ["fullscreen", "close"]
		},
		hiddenControls: {
			type: Boolean,
			default: false
		},
		hiddenHeader: {
			type: Boolean,
			default: false
		}
	},
	mixins: [Screen],
	data() {
		return {
			cacheKey: 0
		}
	},
	watch: {
		"props.fullscreen"(f) {
			if (this.$el && this.$el.querySelector) {
				const el = this.$el.querySelector(".el-dialog");

				if (el) {
					if (f) {
						el.style = {
							top: 0,
							left: 0
						};
					} else {
						el.style.marginBottom = "50px";
					}

					// Set header cursor state
					el.querySelector(".el-dialog__header").style.cursor = f ? "text" : "move";
				}
			}

			if (this.crud) {
				// Fullscreen change event
				this.crud.$emit("fullscreen-change");
			}
		},
		visible: {
			immediate: true,
			handler(f) {
				if (f) {
					this.dragEvent();
				} else {
					setTimeout(() => {
						this.changeFullscreen(false);
					}, 300);
				}
			}
		}
	},
	methods: {
		open() {
			this.cacheKey++;
			this.$emit("update:visible", true);
			this.$emit("open");
		},

		onOpened() {
			this.$emit('opened')
		},

		beforeClose() {
			if (this.props['before-close']) {
				this.props['before-close'](this.close)
			} else {
				this.close()
			}
		},

		close() {
			this.$emit("update:visible", false);
		},

		onClose() {
			this.$emit("close");
			this.close();
		},

		onClosed() {
			this.$emit('closed')
		},

		// Change dialog fullscreen status
		changeFullscreen(f) {
			this.$set(this.props, "fullscreen", isBoolean(f) ? f : !this.props.fullscreen);
			this.$emit("update:props:fullscreen", this.props.fullscreen);
		},

		// Drag event
		dragEvent() {
			this.$nextTick(() => {
				const dlg = this.$el.querySelector(".el-dialog");
				const hdr = this.$el.querySelector(".el-dialog__header");

				if (!hdr) {
					return false;
				}

				hdr.onmousedown = (e) => {
					// Props
					const { fullscreen, top = "15vh" } = this.props;

					// Body size
					const { clientWidth, clientHeight } = document.body;

					// Try drag
					const isDrag = (() => {
						if (fullscreen) {
							return false;
						}

						if (!this.drag) {
							return false;
						}

						// Determine height of the box is too large
						let marginTop = 0;

						if (["vh", "%"].some((e) => top.includes(e))) {
							marginTop = clientHeight * (parseInt(top) / 100);
						}

						if (top.includes("px")) {
							marginTop = top;
						}

						if (dlg.clientHeight > clientHeight - 50 - marginTop) {
							return false;
						}

						return true;
					})();

					// Set header cursor state
					if (!isDrag) {
						return (hdr.style.cursor = "text");
					} else {
						hdr.style.cursor = "move";
					}

					// Set el-dialog style, hidden scroller
					dlg.style.marginTop = 0;
					dlg.style.marginBottom = 0;
					dlg.style.top = dlg.style.top || top;

					// Distance
					const dis = {
						left: e.clientX - hdr.offsetLeft,
						top: e.clientY - hdr.offsetTop
					};

					// Calc left and top of the box
					const box = (() => {
						const { left, top } =
							dlg.currentStyle || window.getComputedStyle(dlg, null);

						if (left.includes("%")) {
							return {
								top: +clientHeight * (+top.replace(/\%/g, "") / 100),
								left: +clientWidth * (+left.replace(/\%/g, "") / 100)
							};
						} else {
							return {
								top: +top.replace(/\px/g, ""),
								left: +left.replace(/\px/g, "")
							};
						}
					})();

					// Screen limit
					const pad = 5;
					const minLeft = -(clientWidth - dlg.clientWidth) / 2 + pad;
					const maxLeft =
						(dlg.clientWidth >= clientWidth / 2
							? dlg.clientWidth / 2 - (dlg.clientWidth - clientWidth / 2)
							: dlg.clientWidth / 2 + clientWidth / 2 - dlg.clientWidth) - pad;

					const minTop = pad;
					const maxTop = clientHeight - dlg.clientHeight - pad;

					// Start move
					document.onmousemove = function (e) {
						let left = e.clientX - dis.left + box.left;
						let top = e.clientY - dis.top + box.top;

						if (left < minLeft) {
							left = minLeft;
						} else if (left >= maxLeft) {
							left = maxLeft;
						}

						if (top < minTop) {
							top = minTop;
						} else if (top >= maxTop) {
							top = maxTop;
						}

						// Set dialog top and left
						dlg.style.top = top + "px";
						dlg.style.left = left + "px";
					};

					// Clear event
					document.onmouseup = function () {
						document.onmousemove = null;
						document.onmouseup = null;
					};
				};
			});
		},

		// Header
		headerRender() {
			return this.hiddenHeader ? null : (
				<div
					class="cl-dialog__header"
					{...{
						on: {
							dblclick: () => {
								this.changeFullscreen();
							}
						}
					}}>
					{/* Title */}
					<span class="cl-dialog__title">{this.title}</span>
					{/* Controls */}
					<div class="cl-dialog__controls">
						{this.hiddenControls ? null : this.controls.map((vnode) => {
							// Fullscreen
							if (vnode === "fullscreen") {
								// Hidden fullscreen btn
								if (this.screen === 'xs') {
									return null
								}

								// Show diff icon
								if (this.props.fullscreen) {
									return (
										<button type="button" class="minimize" on-click={() => { this.changeFullscreen(false) }}>
											<i class="el-icon-minus" />
										</button>
									)
								} else {
									return (
										<button type="button" class="maximize" on-click={() => { this.changeFullscreen(true) }}>
											<i class="el-icon-full-screen" />
										</button>
									)
								}
							}
							// Close
							else if (vnode === "close") {
								return (
									<button type="button" class="close" on-click={this.beforeClose}>
										<i class="el-icon-close" />
									</button>
								);
							}
							// Custom node render
							else {
								return renderNode(vnode, {
									$scopedSlots: this.$scopedSlots
								});
							}
						})}
					</div>
				</div>
			);
		},
	},

	render() {
		return (
			<el-dialog
				{...{
					props: {
						width: this.width,
						...this.props,
						fullscreen: this.isFullscreen ? true : this.props.fullscreen,
						visible: this.visible,
						"show-close": false,
						'custom-class': `cl-dialog ${this.props.customClass || ''}`
					},
					on: {
						open: this.open,
						opened: this.onOpened,
						close: this.onClose,
						closed: this.onClosed
					}
				}}>
				{/* Header */}
				<template slot="title">{this.headerRender()}</template>
				{/* Container */}
				<div class="cl-dialog__container" key={this.cacheKey}>
					{this.$slots.default}
				</div>
				{/* Footer */}
				<div class="cl-dialog__footer" slot="footer">
					{this.$slots.footer}
				</div>
			</el-dialog>
		);
	}
};
