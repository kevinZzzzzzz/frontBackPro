import path from "path";
import fse from "fs-extra";
import multiparty from "multiparty";

const extractExt = (filename) =>
  filename.slice(filename.lastIndexOf("."), filename.length);
class Controller {
  constructor(uploadDir) {
    this.uploadPath = uploadDir; // 上传文件存放的地址
  }

  async handleUpload(req, res) {
    const multipart = new multiparty.Form({
      uploadDir: this.uploadPat,
    });
    multipart.parse(req, async (err, fields, files) => {
      if (err) {
        console.log(err);
        res.json({
          code: 500,
          msg: `上传失败,失败原因${err.message}`,
        });
        return false;
      }
      const [chunk] = files.chunk;
      const [hash] = fields.hash;
      const [filename] = fields.filename;
      const [fileHash] = fields.fileHash;
      const filePath = path.resolve(
        this.uploadPath,
        `${fileHash}${extractExt(filename)}`
      );
      const chunkDir = path.resolve(this.uploadPath, fileHash);
      try {
        // 文件存在直接返回
        if (fse.existsSync(filePath)) {
          res.statusCode = 200;
          res.json({
            code: 500,
            msg: `file exist`,
          });
          res.send();
          return false;
        }
        /* 检测文件夹是否存在 */
        if (!fse.existsSync(chunkDir)) {
          await fse.mkdirs(chunkDir);
        }
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
          code: 500,
          msg: e.toString(),
        });
      }
    });
  }
}

export default Controller;
