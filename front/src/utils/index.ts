export const SIZE: number = .2 * 1024 * 1024; // 限制切片大小
export const Status = {
  wait: "wait",
  pause: "pause",
  uploading: "uploading",
  error: "error",
  done: "done",
};
/* 
  getFileSize  文件大小计算
    字节单位进制转换
*/
export function getFileSize(size) {
  if (!size) return "";
  const num = 1024.00;
  if (size < num)
    return size + "B"; // Btye
  if (size < Math.pow(num, 2))
    return (size / num).toFixed(2) + "KB"; //kb
  if (size < Math.pow(num, 3))
    return (size / Math.pow(num, 2)).toFixed(2) + "MB"; //M
  if (size < Math.pow(num, 4))
    return (size / Math.pow(num, 3)).toFixed(2) + "GB"; //G
  else
    return (size / Math.pow(num, 4)).toFixed(2) + "TB"; //T
}

/* 
  sliceFile 文件切片(支持多个)
  @params
    file: 上传文件
    size: 文件大小
  @return
    chunks: 切完的文件分段列表
*/
export const sliceFile = (file: any[], size = SIZE) => {
  const chunks: any[] = [];
  let curs = 0; // 所有文件已切进度
  for (let i = 0; i < file.length; i++) {
    const chunk = file[i];
    const filename = file[i].name
    const chunkSize = chunk.size;
    let cur = 0 // 当前文件已切进度
    while (cur < chunkSize) {
      const curSize = cur + size > chunkSize ? chunkSize - cur : size;
      const chunkBlob = chunk.slice(cur, cur + curSize);
      chunks.push({
        file: chunkBlob,
        filename
      });
      cur += curSize;
      curs += curSize;
    }
  }
  return chunks;
}
/* 
  calculateHash 异步创建hash值
    @params
      chunks 文件分片
*/
export const calculateHash = async (chunks: any[], cb: Function) => {
  console.log(chunks, 'calculateHash===========')
  return new Promise((resolve, reject) => {
    const worker = new Worker('/hash.js') 
    worker.postMessage({chunks})
    worker.onmessage = (e) => {
      const { data } = e
      console.log('监听webworker的通知----------------', data)
      const {progress, hash} = data
      if (progress === 100 && hash) {
        cb(progress, hash)
        resolve(hash)
      } else if  (progress < 100) {
        cb(progress)
        resolve(progress)
      } else {
        reject(new Error('hash计算失败'))
      }
    }
  })
}