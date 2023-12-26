import path from "path";
import fse from "fs-extra";
import multiparty from "multiparty";
import {resolvePost, extractExt, getUploadedList, mergeFiles} from './utils/index.js'

class Controller {
  constructor(uploadDir) {
    this.uploadPath = uploadDir; // 上传文件存放的地址
  }

  async mergeFileChunk(filePath, fileHash, size){
    // cpmspe/pg)
    const chunkDir = path.resolve(this.uploadPath, fileHash)
    let chunkPaths = await fse.readdir(chunkDir)
    // 根据切片下标进行排序
    // 否则直接读取目录的获得的顺序可能会错乱
    chunkPaths
      .sort((a, b) => a.split("-")[1] - b.split("-")[1])
    chunkPaths = chunkPaths.map(cp=>path.resolve(chunkDir, cp)) // 转成文件路径
    await mergeFiles(chunkPaths,filePath,size)
  }

  /* 存入文件 */
  async handleUpload(req, res) {
    const multipart = new multiparty.Form();
    multipart.parse(req, async (err, fields, files) => {
      if (err) {
        console.log(err);
        res.json({
          code: 500,
          msg: `上传失败,失败原因${err.message}`,
        });
        return false;
      }
      const [chunk] = files?.chunk;
      const [hash] = fields?.hash;
      const [filename] = fields.filename;
      const [fileHash] = fields.fileHash;
      const filePath = path.resolve(
        this.uploadPath,
        `${fileHash}${extractExt(filename)}`
      );
      const chunkDir = path.resolve(this.uploadPath, fileHash);
      // if(Math.random() < 0.5){
      //   // 概率报错
      //   console.log('概率报错了')
      //   res.statusCode=500
      //   res.end()
      //   return 
      // }
      try {
        // 文件存在直接返回
        // if (fse.existsSync(filePath)) {
        //   res.statusCode = 200;
        //   res.json({
        //     code: 500,
        //     msg: `file exist`,
        //   });
        //   res.send();
        // }
        /* 检测文件夹是否存在 */
        // if (!fse.existsSync(chunkDir)) {
        //   await fse.mkdirs(chunkDir);
        // }
        await fse.move(chunk.path, `${chunkDir}/${hash}`);
        res.statusCode = 200;
        res.json({
          code: 0,
          msg: `上传成功`,
        });
        res.send();
      } catch (e) {
        res.statusCode = 200;
        res.json({
          code: 501,
          msg: e.toString(),
        });
      }
    });
  }
  /* 查询已经上传的列表 */
  async handleVerify(req, res) {
    const data = await resolvePost(req)
    const { filename, hash } = data
    const ext = extractExt(filename)
    const filePath = path.resolve(this.uploadPath, `${hash}${ext}`)

    // 文件是否存在
    let uploaded = false
    let uploadedList = [] // 文件切片列表
    if (fse.existsSync(filePath)) {
      uploaded = true
    } else {
      // 文件可能没有完全上传完毕，存在部分切片上传完毕了
      uploadedList = await getUploadedList(path.resolve(this.uploadPath, hash))
    }
    res.statusCode = 200;
    res.end(
      JSON.stringify({
        code: 0,
        uploaded,
        uploadedList // 过滤诡异的隐藏文件
      })
    )
  }
  /* 
    合并文件
  */
  async handleMergeFile(req, res) {
    const data = await resolvePost(req)
    const { filename, hash, size } = data
    const ext = extractExt(filename)
    const filePath = path.resolve(this.uploadPath, `${hash}${ext}`)
    await this.mergeFileChunk(filePath, hash, size)
    res.statusCode = 200;
    res.end(
      JSON.stringify({
        code: 0,
        message: "file merged success"
      })
    )
  }
}

export default Controller;
