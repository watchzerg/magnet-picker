# Magnet Picker Chrome扩展

一个用于自动解析并保存磁力链接的Chrome浏览器扩展。

## 功能特点

- 自动匹配特定网页的磁力链接
- 一键解析并保存磁力链接
- 美观的浮动按钮界面
- 磁力链接历史记录管理

## 开发环境设置

1. 安装依赖：
```bash
npm install
```

2. 开发模式：
```bash
npm run dev
```

3. 构建：
```bash
npm run build
```

## 在Chrome中加载扩展

1. 打开Chrome浏览器，访问 `chrome://extensions/`
2. 开启"开发者模式"
3. 点击"加载已解压的扩展程序"
4. 选择项目的 `dist` 目录

## 使用方法

1. 访问目标网站（https://www.javbus.com/）
2. 在详情页面，点击右侧的"解析磁力链接"按钮
3. 扩展会自动解析并保存页面中的磁力链接
4. 点击扩展图标可以查看已保存的磁力链接列表

## 技术栈

- TypeScript
- Chrome Extension Manifest V3
- Tailwind CSS
- React (用于UI组件)

## 注意事项

- 仅支持特定格式的URL
- 需要授予扩展相应的权限
- 请遵守相关网站的使用条款 