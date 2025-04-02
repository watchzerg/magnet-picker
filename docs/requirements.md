# Magnet Picker - Chrome扩展需求文档

## 1. 项目概述
开发一个Chrome浏览器扩展，用于自动解析并一键保存特定网页的磁力链接。

## 2. 功能规格

### 2.1 URL匹配规则
- 目标网站：https://www.javbus.com/
- URL模式：仅匹配形如 `https://www.javbus.com/{code}` 的详情页面
  - 示例有效URL：https://www.javbus.com/WSA-001
  - 示例无效URL：https://www.javbus.com/studio/abc

### 2.2 磁力链接解析
- 定位目标：页面中的磁力链接表格
- 解析内容：
  - 磁力链接：`href` 属性中的 `magnet:?xt=urn:btih:...` 
  - 文件名：链接文本内容
  - 文件大小：对应单元格内容
  - 发布日期：对应单元格内容

### 2.3 用户界面
#### 2.3.1 下载触发器
- 类型：半透明浮动按钮
- 位置：页面右侧
- 显示规则：仅在匹配的页面自动显示
- 交互：点击触发磁力链接解析

### 2.4 技术规范
- 使用 Manifest V3
- 采用 TypeScript 开发
- 实现模块化设计
- 遵循 Chrome 扩展最佳实践
