# Magnet Picker - Chrome扩展需求文档

## 1. 项目目标
对以下网站进行能力增强
- https://www.javbus.com/ （已实现）
- https://javdb.com/
- https://www.javlibrary.com/cn/
- https://jable.tv/

## 2. 核心功能

### 2.1 磁链保存
- 生效的目标URL：
  - `https://www.javbus.com/{code}` （如 https://www.javbus.com/WSA-001）
- 能力增强：点击悬浮按钮后，解析页面上所有磁链
  - 自动保存：按配置好的规则，自动保存磁链
  - 手工保存：在弹出的信息面板上手工保存磁链
- 保存规则配置
  - 在插件配置页，配置“自动保存”的磁链匹配规则
- 磁链导出
  - 在插件配置页面，导出已保存的磁链


## 规划中的功能

### 离线增强类 （需要远端数据库+本地浏览器缓存）
- 磁链维度
  - 已下载过的magnet置灰（离线数据库里也允许手工导入“已下载magnet”）
- 影片维度
  - 已阅标记，wbest的checkbox标记（或者ABC标记）
  - 已查看过的番号，加载到浏览器缓存，并从列表页面过滤掉
- 女优维度
  - 已阅标记，ABCD级别、标签（容颜/身材等）
- 系列维度
  - 已阅标记
- 未来：从chrome.storage.local替换为indexDB，基于操作时间异步同步

### 实时增强类 （参考jav老司机的脚本 https://github.com/hobbyfang/javOldDriver）
- 磁链保存，支持javdb
- 各个jav网站的番号页面快速相互跳转
- 无限列表滚动（瀑布流）
- 高清预览大图
- 一键保存javbus影片下方的图片到制定文件夹。