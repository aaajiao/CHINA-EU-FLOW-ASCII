# CHINA-EU FLOW ASCII

数据可视化作品:中国→欧洲跨境电商小包裹物流(Shein / Temu,2020–2025,"de minimis" 免税通道)。
用 [glyphcss](https://github.com/apresmoi/glyphcss)(ASCII 3D 渲染)实现,1-bit 墨/纸 TUI 风格。
发布仓库:https://github.com/aaajiao/CHINA-EU-FLOW-ASCII

## 现状

唯一产物:`index.html`(单文件,自包含,唯一外部请求是 esm.sh 的 glyphcss import)。

历史:最初有两个原型(React+D3 的琥珀 HUD 版、Three.js 真实地球版),2026-07-04 合并重实现为本作品后已删除;两者的数据(年总量+航线强度 / 日均量+平台份额+年度事件)全部并入 `index.html` 的 data.js 片段,来源注释保留。

## glyphcss 关键事实(已验证)

- 把 3D 多边形网格光栅化为单个 `<pre>` 里的 ASCII 字符,无 WebGL/canvas。
- CDN:`https://esm.sh/glyphcss`(ESM);npm 包 `glyphcss` / `@glyphcss/react`。
- Headless API:`createGlyphOrthographicCamera({rotX, rotY, zoom})` + `createGlyphScene(host, {camera, mode, useColors, glyphPalette, directionalLight, ambientLight, autoSize})`;`scene.add(polygons)` 返回可 `dispose()` 的 handle;`scene.rerender()` 手动重渲。
- Polygon 格式:`{ vertices: [x,y,z][], color?: string }` 数组(球面 quad 即可)。
- 坐标约定:Z-up,经度取反(`latLonToXYZ` 里 Y = -cosLat·sin(lon)),与官方 world 示例一致。
- 模式:`solid` / `wireframe` / `voxel`(scene 级,不能按 mesh 混用)。palette:default/ascii/dots/blocks 等。
- DOM 覆盖层(标签/热点):用 `camera.project([x,y,z], cols, rows, cellAspect)` 得到网格坐标,depth < 0 为朝向相机的正面。官方 world 示例的国家标签即此做法。
- 拖拽旋转/滚轮缩放:自行监听 pointer 事件改 `camera.rotX/rotY/zoom` 后 `scene.rerender()`;pointer capture 要设在稳定的 host 元素上(`<pre>` 每帧被替换)。
- 官方 world 示例源码:glyphcss 仓库 `website/src/pages/examples/world.astro`;地形烘焙脚本 `website/scripts/bake-globe.mjs`(球面 quad + 按高程分色,可参考其 latLonToXYZ 与配色思路)。

## 项目定位(2026-07-04 更新)

本可视化服务于 aaajiao 的 **Symbiosis** 项目(https://github.com/aaajiao/poly-cam-work/blob/main/docs/aaajiao_symbiosis_project.md),是其"通缩输出"(deflation export)叙事的数据可视化组件;视觉风格对标同项目的 **1bit 游戏/嵌合体废墟**(https://github.com/aaajiao/1bit ,Three.js + 1-bit 抖动渲染)。1bit 游戏关键源码副本在 scratchpad `1bit-refs/` 下(DitherShader、RoomConfig、main.css 等)。

## 1-bit 风格改造决定(2026-07-04)

- **墨/纸双色调**:默认纸白底深色字(木刻感),提供 [ INVERT ] 切换(交换 --ink/--paper)。
- **双色调 + 货物专色**(2026-07-04 晚,应作者要求从"严格 1-bit"升级):地形/UI/框线保持 ink/paper 两色;**货物是唯一的例外**,以双墨套印(riso spot ink)方式叠印——Shein=朱色 `--shein-ink`(#C2410C,反色态 #FFA94D)、Temu=深青 `--temu-ink`(#0E7490,反色态 #5BE3E0)。实现:场景引擎保持单色(字符重量 @/* 区分),彩色标记是投影 DOM 覆盖层(`updateCargoOverlay`,与标签同一套 camera.project + depth>0 机制);反色变体靠 paletteEngine 切 `:root.inverted` 类。图例/份额条/modal 同步着色。专色不随年份漂移。
- **年份→房间色调漂移**:2020 ABSORPTION 琥珀(paper #F0EED4/ink #221E0A)→ 2022 IN_BETWEEN 紫灰(#EADDF3/#1C1228)→ 2023 INFO_OVERFLOW 冷青(#DCEDF2/#0A1A22)→ 2025 POLARIZED 暖红(#F3E9E4/#1E0C0E),年份切换时平滑过渡。全部 UI 颜色走 CSS 变量 --ink/--paper。
- **UI 语言保持英文**;扫描线覆盖层照搬游戏 main.css;进入面板(game 式标题+操作说明+CLICK TO ENTER)。

## 全套 TUI 化决定(2026-07-04,叠加在双色调之上)

- **字体**:内嵌 WebPlus_IBM_VGA_8x16 位图字体(base64 WOFF ~30KB,CC BY-SA 4.0,INFO modal 页脚署名 int10h.org/VileR);场景 `.glyph-output` 与 UI 统一;16px 整数尺寸、line-height:1;层级靠 reverse-video 与留白,不靠小字号。
- **框线**:Unicode 制表符——单线 `┌─│` 常规面板、双线 `╔═║` 进入面板与 modal;旧 CSS 2px 边框退役,面板尺寸锁 ch 网格。
- **组件字符化**:年度柱状图=`█` 字符柱;份额条=`SHEIN @@@@···· 65%`(@/* 与粒子编码统一);仪表=`[####----] 22%`;按钮=`[ 2020 ]`,选中态 reverse-video;`▶⏹×▪`→`|> [] [X] *`;动效硬切/steps(),仅年份色调漂移保留 600ms 过渡。
- 增补规格:scratchpad `ASCII_UI_SPEC.md`;字体资产:scratchpad `vga-font-base64.txt`。

## 已确认的设计决定(2026-07-04)

- 两个原型**合并成一个新页面**(数据互补:年度总量+航线 / 日均量+平台份额+事件)。
- 地图形态:**ASCII 球体 + ASCII 平面,可切换**(球体↔平面优先尝试顶点插值 morph,性能不行则降级为交叉淡入切换)。
- 工程形态:**单文件 HTML + esm.sh CDN**。
- UI 全保留:粒子流动动画(Shein=琥珀/Temu=青)、年份时间轴+自动播放、数据面板、Info & Context 弹窗。
- 配色:对标 glyphcss.com world 示例的暗底琥珀(rgba(255,232,184) 系),与原型1的 HUD 琥珀色一致。

## glyphcss 0.0.9 与官网 world 示例的约定差异(实测发现,2026-07-04)

产物 `index.html` 已按以下实测结论修正,改动时不要按官网示例"改回去":

- **深度符号相反**:`camera.project()` 返回的 depth,**> 0 = 朝向相机**(官网示例注释写的 `depth < 0 = front` 在 0.0.9 里是反的)。影响标签可见性判断和 flat 视图法线选择。
- **经度方向相反**:官网示例的 `latLonToXYZ` 用 `-sin(lon)`,在 0.0.9 下渲染出东西镜像的地球(华沙跑到马德里西边)。本项目改用 `+sin(lon)`,配套:相机初始 rotY 取正(+65)、拖拽两轴符号取负(`rotY -= dx`、`rotX -= dy`)。quad 绕序由 `orientPoly` 按期望法线自动归一化,无需手工反转。
- **拖拽灵敏度**:`pixelsPerUnit` 不能只投影 +Z 轴(rotX=25 俯视下极轴透视缩短 ~2.4 倍导致拖拽过冲),要取三个世界轴投影的最大值。
- esm.sh 偶发瞬时加载失败 → 页面有 15s 超时提示(module boot 会 clearTimeout 取消误报);重新加载即可。
- **验证陷阱**:Chrome 窗口被遮挡时 `document.hidden=true`,rAF 完全停摆——色调漂移 lerp 看似"不工作"。paletteEngine 已加 hidden 时直接 snap 的守卫;用无头/遮挡窗口验证动画前先查 `document.hidden`。
- 左侧数据面板在矮视口下靠 `.tui-body` 的 overflow-y:auto(墨色块滚动条)防止内容穿透字符框线(flex 列 + max-height 组合的固有行为)。

## 约束

- 产物保持单文件 HTML(除 glyphcss CDN import 外自包含);陆地网格数据烘焙后内联进 HTML,不依赖运行时抓取 world-atlas。
- 用 ES module(`<script type="module">`),需要通过本地静态服务器打开(如 `python3 -m http.server`),file:// 下 CDN ESM import 可能受限。
- 无 lint/测试等自动化检查;验证方式 = 浏览器打开实际操作(可用 Claude in Chrome 截图验证)。
- 数据口径以已合并进 data.js 的数值为准,保留来源注释(Eurostat、European Commission、IATA 等),不要编造数据。
