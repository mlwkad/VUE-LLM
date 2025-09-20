// 存储所有性能数据的实例
let performanceData = {}

// FCP（First Contentful Paint，首次内容绘制）：
// 页面首次出现文字/图片等"内容"的时间点，标志着用户首次看到页面有意义内容的时间
// LCP（Largest Contentful Paint，最大内容绘制）：
// 页面中最大的内容元素（如大图片、大段文字）绘制完成的时间，反映主内容加载速度
// CLS（Cumulative Layout Shift，累积布局偏移）：
// 页面元素意外位移的累计分数，值越小说明页面越稳定，用户体验越好
export function setupPaintMetrics() {
  // 监控FCP(首次内容绘制)
  const fcpObserver = new PerformanceObserver((list) => {
    // 遍历所有性能条目
    for (const entry of list.getEntries()) {
      // 找到"首次内容绘制"的条目
      if (entry.name === 'first-contentful-paint') {
        performanceData.fcp = entry.startTime
        console.log(`🎯 FCP(首次内容绘制): ${performanceData.fcp.toFixed(2)}ms`)
        // FCP只会发生一次，获取后可以停止观察
        fcpObserver.disconnect()
      }
    }
  })
  // 启动观察器，buffered: true表示捕获页面加载早期的事件
  fcpObserver.observe({ type: 'paint', buffered: true })

  // 监控LCP（最大内容绘制）
  const lcpObserver = new PerformanceObserver((list) => {
    const entries = list.getEntries()
    // 取最后一个条目，因为最大内容元素可能会随着页面加载而变化
    const lastEntry = entries[entries.length - 1]
    if (lastEntry) {
      performanceData.lcp = lastEntry.startTime
      console.log(`🎯 LCP(最大内容绘制): ${performanceData.lcp.toFixed(2)}ms`)
    }
  })
  lcpObserver.observe({ type: 'largest-contentful-paint', buffered: true })

  // 监控CLS（累积布局偏移）
  let clsValue = 0  // 用于累加布局偏移分数
  const clsObserver = new PerformanceObserver((list) => {
    for (const entry of list.getEntries()) {
      // 忽略用户交互（如点击、输入）导致的布局偏移，这些是预期内的
      if (!entry.hadRecentInput) {
        clsValue += entry.value  // 累加偏移分数
        performanceData.cls = clsValue
        console.log(`📐 CLS(累积布局偏移): ${clsValue.toFixed(3)}`)
      }
    }
  })
  clsObserver.observe({ type: 'layout-shift', buffered: true })
}

// FID（First Input Delay，首次输入延迟）：
// 用户第一次与页面交互（点击、输入等）到浏览器开始处理该交互的延迟时间
// 反映页面对用户首次操作的响应速度
// TBT（Total Blocking Time，总阻塞时间）：
// 主线程中所有长任务（执行时间超过50ms）的超出部分之和
// 反映主线程被阻塞的严重程度，值越小说明页面响应越流畅
export function setupInteractionMetrics() {
  // 监控FID（首次输入延迟）
  const fidObserver = new PerformanceObserver((list) => {
    const entry = list.getEntries()[0]
    if (entry) {
      // 计算延迟时间：处理开始时间 - 输入发生时间
      performanceData.fid = entry.processingStart - entry.startTime
      console.log(`🖱️ FID(首次输入延迟): ${performanceData.fid.toFixed(2)}ms`)
      // FID只会发生一次，获取后停止观察
      fidObserver.disconnect()
    }
  })
  fidObserver.observe({ type: 'first-input', buffered: true })

  // 监控TBT（总阻塞时间）
  let tbtValue = 0  // 用于累加总阻塞时间
  const tbtObserver = new PerformanceObserver((list) => {
    for (const entry of list.getEntries()) {
      // 长任务是指执行时间超过50ms的任务
      // 阻塞时间 = 任务总时间 - 50ms（50ms是浏览器能流畅处理的阈值）
      const blockingTime = entry.duration - 50
      if (blockingTime > 0) {
        tbtValue += blockingTime
        performanceData.tbt = tbtValue
      }
    }
  })
  tbtObserver.observe({ type: 'longtask', buffered: true })

  // 页面加载完成后输出TBT结果
  window.addEventListener('load', () => {
    setTimeout(() => {
      console.log(`⏱️ TBT(总阻塞时间): ${tbtValue.toFixed(2)}ms`)
    }, 100)
  })
}

// TTFB（Time to First Byte，首字节时间）：
// 从浏览器发起请求到接收到服务器返回的第一个字节的时间
// 反映网络连接速度和服务器响应速度
export function setupLoadMetrics() {
  // 等待页面完全加载后获取数据（确保所有性能数据已生成）
  window.addEventListener('load', () => {
    // 获取导航相关的性能数据
    const navData = performance.getEntriesByType('navigation')[0]
    if (navData) {
      // 计算首字节时间：响应开始时间 - 请求开始时间
      performanceData.ttfb = navData.responseStart - navData.requestStart
      console.log(`🌐 TTFB(首字节时间): ${performanceData.ttfb.toFixed(2)}ms`)
    }
  })
}

// 初始化性能监控
export function initPerformanceMonitoring() {
  console.log('🚀 开始初始化性能监控...')
  setupPaintMetrics()        // 启动绘制指标监控
  setupInteractionMetrics()  // 启动交互指标监控
  setupLoadMetrics()         // 启动加载指标监控
  console.log('✅ 性能监控初始化完成，等待数据收集...')
  return 
}
