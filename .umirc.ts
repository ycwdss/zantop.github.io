import { defineConfig } from 'dumi';
export default defineConfig({
  title: 'zantop',
  mode: 'site',
  logo: 'https://open.zantop.cn/logo.jpeg',
  favicon: 'https://open.zantop.cn/logo.jpeg',
  styles: [
    `
    .index-txt {padding-top:30px;font-size: 16px;}
    .markdown img{border-radius: 10px;}
    .__dumi-default-navbar nav > a > ul a{ text-decoration:none}
    iframe{ width:100%;height:500px; border: 0;border-radius:4px;overflow:hidden}
    #root .__dumi-default-layout-hero{background-color:#fff;padding:100px 0 0 0;}
    #root .__dumi-default-layout-footer{border-top: 1px solid #f9f9f9;}
    `,
  ],
  // menus: {},
  exportStatic: {},
  navs: [
    {
      title: '分类',
      children: [
        { title: 'css', path: '/css' },
        { title: 'js', path: '/js' },
        { title: 'react', path: '/react' },
        { title: 'vue', path: '/vue' },
        { title: 'node', path: '/node' },
        { title: 'ts', path: '/ts' },
        { title: 'futter', path: '/futter' },
        { title: 'os', path: '/os' },
        { title: 'mongodb', path: '/mongodb' },
        { title: 'interview', path: '/interview' },
      ],
    },
    {
      title: '工具',
      path: '/tool',
    },
    {
      title: '站点',
      path: '/site',
    },
    {
      title: '关于',
      path: '/about',
    },
  ],
});
