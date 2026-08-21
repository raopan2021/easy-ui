const Layout = () => import('@/layout/index.vue')

export default {
  path: '/example',
  name: 'Example',
  component: Layout,
  redirect: '/example/crud',
  meta: {
    icon: 'ep/grid',
    title: '基础示例',
    rank: 1,
  },
  children: [
    {
      path: '/example/crud',
      name: 'CrudExample',
      component: () => import('@/views/example/crud/index.vue'),
      meta: {
        title: 'CRUD 示例',
      },
    },
    {
      path: '/example/markdown',
      name: 'MarkdownExample',
      component: () => import('@/views/example/markdown/index.vue'),
      meta: {
        title: 'Markdown 编辑器',
      },
    },
  ],
} satisfies RouteConfigsTable
