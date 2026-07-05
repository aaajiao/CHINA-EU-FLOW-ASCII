# CHINA-EU FLOW ASCII

数据可视化作品:中国→欧洲跨境电商小包裹物流(Shein / Temu,2020–2025,"de minimis" 免税通道)。
用 [glyphcss](https://github.com/apresmoi/glyphcss)(ASCII 3D 渲染)实现,1-bit 墨/纸 TUI 风格。
发布仓库:https://github.com/aaajiao/CHINA-EU-FLOW-ASCII

## 现状

唯一产物:`index.html`(单文件,自包含,唯一外部请求是 esm.sh 的 glyphcss import)。

历史:最初有两个原型(React+D3 的琥珀 HUD 版、Three.js 真实地球版),2026-07-04 合并重实现为本作品后已删除;两者的数据(年总量+航线强度 / 日均量+平台份额+年度事件)全部并入 `index.html` 的 data.js 片段,来源注释保留。

## 数据全面刷新(2026-07-04,workflow 研究+对抗验证后落地)

原 proto 合并数值(2022=2.5B、2023=3.8B、2024=4.5B、2025=5.2B 预估等)被证实虚高/过期,已整体替换为一手 EU 数据。**当前 data.js 的 YEARS 是权威口径,不要回退到 proto 旧值。**

- **口径决定(作者拍板)**:volume = **进入欧盟的全部 <€150 低价包裹总量**(European Commission / DG TAXUD 官方系列),其中约 91%(2024)来自中国;不是"仅中国→欧洲"。选此口径因为它能拿到 2022–2025 连续四年一手官方数、且与所有新闻/EC 通稿引用的数字一致。中国占比在 UI 里显著标注,不冒充"纯中国"。
- **年度总量**:2020 ~0.8B、2021 ~1.0B(均为估算,`isEstimate:true`,早于 2021-07-01 IOSS/H7 系统性清关计数);2022 1.4B、2023 2.3B、2024 4.6B(~12.6M/日,91% 中国=4.17B)、2025 ~5.9B(完成年实际值,精确 DG TAXUD 5.88B,不再是预估)。
- **dailyAvg = rawVolume / 365**(百万/日),内部自洽;saturation 仪表满量程 DAILY_MAX 从 15 提到 18(峰值 16.2 不再顶格),刻度改 0/9M/18M。
- **Shein/Temu 份额**是模型估算(无一手逐包裹口径),由 DSA 月活(2024 Shein 108M vs Temu 92M;2025 145.7M vs 115.7M)+ Cargo Facts 空运吨位(5000 vs 4000 t/日)三角推算。**修正了旧数据"Temu 反超"的错误**:2024/2025 直邮空运包裹流里 Shein 仍以微弱优势领先(2024 0.53/0.47、2025 0.54/0.46)。
- **终局事件**:欧盟理事会 2025-12-12 通过 €3/件关税,2026-07-01 生效——de minimis 时代结束,已写入 2025 event 与 INFO modal。
- 航线级(机场对)强度保持不变(示意性,无一手逐航线数据)。proto 的 `volumeMultiplier` 字段已删除(未被引用,柱高由 rawVolume 推导)。
- 来源族:EC/DG TAXUD、COM(2025)37、European Parliament、Council of the EU (Consilium)、Cargo Facts Consulting、Cross-Border Commerce Europe。footer/INFO modal 同步更新。
- **文案/时态**:今天(2026-07-04)已过 2026-07-01,de minimis 时代已闭幕——全站文案改过去时(INFO intro:"parcels below €150 *entered* the EU free of duty";"duty *took effect* 1 July 2026, closing the loophole";README 的 "ended de minimis" 同步)。旧 "2024–2025 figures include projections" 脚注已删,换成"哪些年官方/哪些年估算"的说明。以后再改文案,先核对时态与最新数据逻辑一致(作者明确要求全站文案都要符合新数据逻辑)。
- **UI 渲染小改**:growth 为 "—"(基准年 2020)时不再追加 " YoY"(`/\d/.test(d.growth)` 守卫);估算年份(`isEstimate:true`)的 SRC 行前缀 "EST ·"。
- **两处口径判断(可回退)**:2025 日均取 **16.2M**(=年量/365,与本作 dailyAvg 口径自洽),而非新闻常引的 16.1M(来自精确 5.88B);2025 中国占比写 **"over 90%"**,未采用单一二手源的 93%(与 2024 已确认的 91% 保持一致)。

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

## PWA 化(2026-07-04,workflow 设计+对抗评审后落地)

整个项目已 PWA 化:可安装、离线可用。图标来自作者提供的 ChatGPT 生成图(1254px 方图,黑底霓虹 HUD 像素地球:红=中国/@/弧线=Shein 专色,青=网格,绿=角标),原图存 `icons/icon-master-1254.png`。

- **新增 sidecar 文件**:`manifest.webmanifest`、`sw.js`(根目录)、`icons/`(9 个:full-bleed `any` 192/512/1024 + padded `maskable` 192/512 + apple-touch 180 + favicon 32/16 + master 1254)。
- **图标生成**:`sips` 从 master 缩放;maskable = 先缩到 80%(410/154px)再 `sips -p 512 512 --padColor 000000` 居中补黑边,避免 launcher 圆角/圆形裁切吃掉 HUD 边框与角标(源图边缘有 `[+]` 角标)。
- **路径全部相对(关键红线)**:GitHub Pages 是项目子路径 `/CHINA-EU-FLOW-ASCII/`。manifest href、icon src、`start_url:"."`、`scope:"./"`、`id:"./"`、`register("sw.js")`、以及 SW 内 precache(`new URL(path, self.location)`)全用相对路径。**任何绝对 `/…` 都会在子路径下 404**——别改成绝对路径。
- **离线策略(sw.js)**:两个 cache——app-shell(同源:导航 network-first+缓存兜底,静态资源 cache-first)+ runtime(跨源 `esm.sh` cache-first)。esm.sh 带 CORS,响应非 opaque,可正常缓存。**关键修复(评审抓到的真 bug)**:每个 `cache.put` 都用 `event.waitUntil()` 绑定 fetch 事件生命周期,否则 SW 在 `respondWith` 结算瞬间被终止,esm.sh 模块图偶发写不进缓存 → 离线时 glyphcss 起不来、假性通过。`VERSION` 常量 bump 可失效 shell 预缓存。
- **首屏不完全缓存是预期行为**:SW 靠 activate 的 `clients.claim()` 接管,首次加载时 esm.sh 子导入在接管前已发出、未被拦截;**再加载一次**(SW 从头控制)才会把 4 个 esm.sh 传递依赖(`glyphcss` stub → `@glyphcss/core` 解析 → 两个 pinned `.mjs`)全部进 runtime cache。已实测:第二次 load 后杀本地服务器再 reload,ASCII 地球仍从缓存渲染、无 FAILED 横幅、控制台零页面报错。
- **boot 安全**:SW 注册是独立 classic `<script>`,仅在 window `load` 触发,不碰 `window.__cdnFailTimer` / module 的 `clearTimeout` / 首屏渲染。
- **theme-color 跟随年份漂移**:一个防御性 IIFE 每秒把 `<meta name="theme-color">` 同步为当前 `--paper`;splash 仍用 manifest 的 `#000000` background_color(与图标黑底无缝)。name/short_name = `CHINA-EU FLOW ASCII` / `CN-EU FLOW`。
- 集成方式:用一次性 Node 脚本从 workflow 输出 JSON 精确抽取 manifest/sw/head/registration 并写入(带**幂等守卫**;曾因重复插入过一次全部 PWA 块,已 `git checkout` 回滚+加守卫修复)。手动改 PWA 时注意别重复注入:`grep -c 'rel="manifest"' index.html` 应为 1。

## PLAY → 引导式巡航(2026-07-05,workflow 实现+对抗评审后落地,commit 4e5e451)

原 2s/年 `setInterval` 自动播放已替换为**引导式巡航**(guided tour):按 PLAY 后逐年走三种节拍,相机、口岸标注、左面板轮流成为焦点。作者已浏览器实测通过,**节奏(全程约 2 分 20 秒)已由作者认可——不要为了早期方案里的 "~72s" 估算去压缩 `TOUR_BEAT_*_MS` 常量**。

- **节拍结构**(每年):Beat A 年份卡(setYear + 相机步进回 home 视角 + volume 数字 8 步 count-up,growth 徽标最后一步才出)→ Beat B 口岸聚焦 ×2(按当年 activeRoutes intensity 选主航线,先 src 后 dst;`prevFocused` 与上一年去重保证六年覆盖更多口岸)→ Beat C 语境(相机回 home + STRATEGIC CONTEXT 反白 + `>>` event 行打字机)。2025 之后出终幕卡(双线框:€3/件关税 12 Dec 2025 通过、2026-07-01 生效、de minimis 时代闭幕;3s 自动关或点按关)。
- **停止/复原语义**:`stopPlayback` **保留原函数名与全部既有调用点**(年份按钮、柱状图列、openModal),函数体现在=取消巡航+同步复原(清 callout/标签强调/航线聚光/面板高亮/终幕卡,打字机残句恢复为全文);`requestView` 也先 stopPlayback。拖拽/滚轮(globe host)、年份、视图切换、modal、Escape 都停;**INVERT/`I` 不停**。相机中断时留在原地(用户抢走就归用户),自然结束由终幕卡步骤回 home。
- **取消机制**:单一 `tourToken`(对象身份),每个 await 后复查;`sleep()` 在 `document.hidden` 时冻结时钟(只累计可见时间)——巡航在遮挡窗口下会暂停而非跳拍。`prefers-reduced-motion`:相机 snap、打字机瞬显,节拍时长不变。
- **新 scene API**:`focusCamera(target,frames,stepMs)`(12 帧 setTimeout 步进 smoothstep,与 morph 同款纪律;用户 pointerdown 或 morph 开始即中止让位;**取消/被替代/销毁都会 settle Promise**——`settleFocus()` 防止 beat 协程悬挂在永不 resolve 的 await 上,这是评审抓到的真 bug)、`focusHub`(初猜 rotX≈lat/rotY≈lng,再对符号/±180 偏移候选做 `camera.project` 数值验证 + 坐标下降精调——**对 0.0.9 符号约定免疫,别改回解析公式**)、`setHubEmphasis`(必须在 `updateLabels` 内部应用才挺得过每帧重投影)、`setRouteSpotlight`(只重建 arcs 层,非相关航线用 `SCN_ARC_COLOR_DIM`;routesGeom/粒子不动)、callout 覆盖层(34 列盒绘卡,`camera.project` 定位+视口 clamp,满文本尺寸在 showCallout 时先量好,reveal 期间位置不漂)、`isMorphing()`/`getHomeCamera()`/`cancelFocus()`;`destroy()` 清理以上全部。
- **FLAT 起播**:先 `setView("globe")` 再轮询 `isMorphing()` 等 morph 完成才开始;结束后不自动切回 FLAT。
- **巡航文案红线**:`tourDesc`(12 个 hub,全大写、≤32 字符/行、纯定性、**禁止任何数字**);callout 的 TYPE 行 LHR 特判为 **"UK DESTINATION"**(post-Brexit,不能写 EU DESTINATION——评审抓到的事实错误);面板高亮箭头用 **► U+25BA**(CP437,内嵌 VGA 字体有此字形;U+25B6 ▶ 会 fallback 到系统字体破坏点阵观感)。
- 时长常量集中在 ui 片段顶部:`TOUR_BEAT_A_MS 2500 / B 3500(每口岸) / C 3000 / ENDCARD 3000`;callout 打字 2 字符/16ms,event 行 60cps。
- **改 `index.html` 必须同步 bump `sw.js` 的 `VERSION`**(当前 v2),否则老访客拿 SW 缓存旧 shell。

## 约束

- 产物核心仍是自包含的 `index.html`(land grid + 字体内联,运行时只抓 glyphcss CDN);**PWA 化后新增 `manifest.webmanifest` / `sw.js` / `icons/` 三类 sidecar——这是"单文件"约束的既定例外**(PWA 本质需要独立的 service worker 与 manifest;icon 也不宜内联)。可视化逻辑本身仍单文件。陆地网格数据烘焙后内联进 HTML,不依赖运行时抓取 world-atlas。
- 用 ES module(`<script type="module">`),需要通过本地静态服务器打开(如 `python3 -m http.server`),file:// 下 CDN ESM import 可能受限。
- 无 lint/测试等自动化检查;验证方式 = 浏览器打开实际操作(可用 Claude in Chrome 截图验证)。
- 数据口径以 data.js 的 YEARS 数值为准(2026-07-04 全面刷新后,详见上方「数据全面刷新」节),保留来源注释(EC/DG TAXUD、COM(2025)37、European Parliament、Consilium、Cargo Facts、Cross-Border Commerce Europe),不要编造数据,也不要回退到 proto 旧值。
