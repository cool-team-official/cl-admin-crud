export default {
	name: "cl-pagination",
	componentName: "ClPagination",
	inject: ["crud"],
	props: {
		props: {
			type: Object,
			default: () => {
				return {};
			}
		},
		on: Object
	},
	data() {
		return {
			total: 0,
			currentPage: 1,
			pageSize: 20
		};
	},
	watch: {
		props: {
			immediate: true,
			handler: "setPagination"
		}
	},
	created() {
		this.$on("crud.refresh", this.setPagination);
	},
	methods: {
		currentChange(index) {
			this.crud.refresh({
				page: index
			});
		},
		sizeChange(size) {
			this.crud.refresh({
				page: 1,
				size
			});
		},
		setPagination(res) {
			if (res) {
				this.currentPage = res.currentPage || res.page || 1;
				this.pageSize = res.pageSize || res.size || 20;
				this.total = res.total | 0;
				this.crud.params.size = this.pageSize;
			}
		}
	},
	render() {
		return (
			<el-pagination
				{...{
					on: {
						"size-change": this.sizeChange,
						"current-change": this.currentChange,
						...this.on
					},
					props: {
						background: true,
						layout: "total, sizes, prev, pager, next, jumper",
						"page-sizes": [10, 20, 30, 40, 50, 100],
						...this.props,
						total: this.total,
						"current-page": this.currentPage,
						"page-size": this.pageSize
					}
				}}
			/>
		);
	}
};
