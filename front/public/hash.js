/* 
  web-worker
    计算获取文件分片hash值
*/

self.importScripts('spark-md5.min.js')
self.onmessage = function(e) {
  const { data } = e
  console.log('worker监听主线程的通知---------------------', data)
  const {chunks} = data
  const spark = new self.SparkMD5.ArrayBuffer() // 创建一个buffer实例
  let progress = 0 // 进度
  let count = 0 // 累加器
  
  const loadNext = index => {
    const reader = new FileReader()
    reader.readAsArrayBuffer(chunks[index].chunkBlob)
    reader.onload = e => {
      // 累加器自增, 不要依赖index
      count++
      // 计算md5
      spark.append(e.target.result)
      if (count === chunks.length) {
        console.log('计算完毕', spark)
        // 计算完毕
        self.postMessage({
          msg: 'worker计算完毕',
          progress: 100,
          hash: spark.end()
        })
      } else {
        progress = +((count / chunks.length) * 100).toFixed(0) // 进度
        self.postMessage({
          progress
        })
        loadNext(count)
      }
    }
  }
  // 启动
  loadNext(0)
  // setTimeout(() => {
  //   self.postMessage({
  //     msg: 'worker计算完毕',
  //   })
  // }, 2000)
}


