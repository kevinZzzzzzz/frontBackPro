import { calculateHash, getFileSize, sliceFile } from "@/utils";
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
  // const hashPress = useRef(0); // 文件hash值计算进度
  const [hashPress, setHashPress] = useState(0); // 文件hash值计算进度
  const [chunksList, setChunksList] = useState([]) // 切片文件列表
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
      ...container,
      file: files,
    };
  };
  /* 
    handleUpload 上传文件按钮触发
  */
  const handleUpload = async () => {
    if (container.current.file.length === 0) {
      return 
    }
    // 文件切片
    const fileChunk = sliceFile(container.current.file, fileSize);
    console.log("handleUpload", fileChunk);
    console.time("samplehash");
    await calculateHash(fileChunk, (progress, hash) => {
      if (hash) {
        container.current = {
          ...container.current,
          hash: hash,
        };
        console.timeEnd("samplehash");
        const fileChunkTemp = fileChunk.map((chunk, index) => {
          const chunkName = container.current.hash + "-" + index;
          return {
            fileHash: container.current.hash,
            chunk: chunk.file,
            index,
            hash: chunkName,
            // progress: uploadedList.indexOf(chunkName) > -1 ? 100 : 0,
            size: chunk.file.size
          }
        })
        console.log(fileChunkTemp, 'fileChunkTemp')
      }
      setHashPress(progress)
    })
  }
  return (
    <div className={styles.container}>
      <input type="file" multiple onChange={handleFileChange} />
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
