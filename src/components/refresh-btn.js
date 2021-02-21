export default {
	name: "cl-refresh-btn",
	componentName: "ClRefreshBtn",
	inject: ["crud"],
	props: {
		// el-button props
		props: Object
	},
	render() {
		return (
			<el-button
				{...{
					props: {
						size: "mini",
						...this.props
					},
					on: {
						click: this.crud.refresh
					}
				}}>
				{this.$slots.default || "刷新"}
			</el-button>
		);
	}
};
