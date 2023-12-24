import { calculateHash, getFileSize, sliceFile, Status } from "@/utils";
import { Flex, Progress } from "antd";
import React, { useState, useEffect } from "react";
import styles from "./styles/index.module.scss";
function UploadPage(props: any) {
  const container = useRef<{
    file: any[],
    hash?: string,
  }>({
    file: [],
    hash: '',
  }); // 储存文件
  const [isPause, setIsPause] = useState(false); // 是否暂停
  const [fileSize, setFileSize] = useState(""); // 文件大小
  const [hashPress, setHashPress] = useState(0); // 文件hash值计算进度
  const chunksList = useRef([]) // 切片文件列表
  /* 
    handleFileChange 监听文件上传框导入文件信息
  */
  const handleFileChange = (e) => {
    // 先清空
    container.current = {
      file: [],
      hash: '',
    };
    setHashPress(0)
    setFileSize('')
    /* **************** */
    const files = e.target.files;
    console.log(files, 'files===============')
    let sizeAll = 0;
    // files 数据类型是FileList需要先转数组
    Array.from(files)?.forEach((file: {
      size: number
    }) => {
      sizeAll += file.size;
    });
    if (sizeAll) {
      setFileSize(getFileSize(sizeAll));
    }
    if (!files || !files.length) return;
    container.current = {
      ...container.current,
      file: files,
    };
    console.log(container.current, 'container.current======')
  };
  /* 
    handleUpload 上传文件按钮触发
  */
  const handleUpload = async () => {
    if (container.current.file.length === 0) {
      return 
    }
    // 文件切片
    const fileChunk = sliceFile(container.current.file);
    console.log("handleUpload", fileChunk);
    // console.time("samplehash=========================");
    await calculateHash(fileChunk, (progress, hash) => {
      if (hash) {
        container.current = {
          ...container.current,
          hash: hash, // 每个文件都有独一无二的hash！！！
        };
        // console.timeEnd("samplehash");
        const fileChunkTemp = fileChunk.map((chunk, index) => {
          const chunkName = container.current.hash + "-" + index;
          return {
            fileHash: container.current.hash,
            chunk: chunk.file,
            filename: chunk.filename,
            index,
            hash: chunkName,
            progress: 0,
            // progress: uploadedList.indexOf(chunkName) > -1 ? 100 : 0,
            size: chunk.file.size
          }
        })
        chunksList.current = fileChunkTemp
        uploadChunks()
      }
      setHashPress(progress)
    })
  }
  const uploadChunks = async () => {
    console.log(chunksList.current, 'chunksList')
    const list = chunksList.current.map(({ fileHash, chunk, index, hash, filename}, idx) => {
      const form = new FormData()
      form.append('fileHash', fileHash)
      form.append('hash', hash)
      form.append('filename', filename)
      form.append('chunk', chunk)
      return { form, index, status: Status.wait };
    })
    try {
      await sendRequest(list)
    } catch (e) {
      console.error()
    }
  }
  /* 
    sendRequest 上传处理
    @param list: 文件数组
            max: 通道 并发控制4个
  */
  const sendRequest = async (list, max = 4) => {
    return new Promise<void>((resolve, reject) => {
      const len = list.length - 1
      let counter = 0 // 操作数
      const retryArr = []
      const start = async() => {
        while ( counter < len - 1 && max > 0 ) {
          max--
          console.log(max, 'start')
          const i = list.findIndex(v => v.status === Status.wait || v.status === Status.error)
          if (i < 0) {
            break
          }
          list[i].status = Status.uploading
          const form = list[i].form
          const index = list[i].index
          if (typeof retryArr[index] === 'number') {
            console.log(index, '开始重试===========')
          }
          window.$api.uploadFile(form).then(() => {
            list[i].status = Status.done
            max++ // 让出通道
            counter++
            list[counter].done = true
            if (counter == len) {
              resolve()
            } else {
              start()
            }
          }).catch(e => {
            if (e.code !== 501) {
              list[i].status = Status.error
              if (typeof retryArr[index] !== 'number') {
                retryArr[index] = 0
              }
              // 累计失败的次数
              retryArr[index]++
              if (retryArr[index] >= 2) { // 失败超过三次
                console.log(retryArr, 'reject')
                return reject()
              }
              chunksList.current[index].process = 0
            }
            max++ // 释放通道
            start()
          })
        }
      }
      start()
    })
  }
  return (
    <div className={styles.container}>
      {/* multiple */}
      <input type="file"  onChange={handleFileChange} />
      <br />
      <hr />
      <Flex gap="small" wrap="wrap">
        <Button type="primary" className={!container.current.file.length && styles.container_nofile} onClick={handleUpload}>上传</Button>
        {isPause ? (
          <Button type="primary" danger>
            恢复
          </Button>
        ) : (
          <Button type="default">暂停</Button>
        )}
      </Flex>

      <div>{fileSize && (
        <>
          <p>文件大小： {fileSize}</p>
          <p>计算hash值</p>
          <Progress percent={hashPress} />
        </>
      )}</div>
    </div>
  );
}
export default UploadPage;
