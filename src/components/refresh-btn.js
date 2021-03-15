export default {
	name: "cl-refresh-btn",
	componentName: "ClRefreshBtn",
	inject: ["crud"],
	props: {
		props: Object
	},
	render() {
		const { refresh, dict, style } = this.crud;

		return (
			<el-button
				{...{
					props: {
						size: "mini",
						...this.props,
						...style.refreshBtn
					},
					on: {
						click: () => {
							refresh();
						}
					}
				}}>
				{this.$slots.default || dict.label.refresh}
			</el-button>
		);
	}
};
