export default [
  {
    path: '/example/crud',
    name: 'CrudExample',
    component: () => import('@/views/example/crud/index.vue'),
    meta: {
      icon: 'ep/grid',
      title: 'CRUD 示例',
      rank: 1,
    },
  },
  {
    path: '/example/markdown',
    name: 'MarkdownExample',
    component: () => import('@/views/example/markdown/index.vue'),
    meta: {
      icon: 'ep/document',
      title: 'Markdown 编辑器',
      rank: 2,
    },
  },
  {
    path: '/example/image-compressor',
    name: 'ImageCompressor',
    component: () => import('@/views/example/image-compressor/index.vue'),
    meta: {
      icon: 'ep/picture',
      title: '图片压缩',
      rank: 3,
    },
  },
] satisfies Array<RouteConfigsTable>
