import http from '@/Http'
import { type AxiosResponse } from 'axios'
// 设置代理
const setProxy = (url: string): string => {
  return !import.meta.env.PROD ? '/api' + url : url
}
console.log(import.meta.env, '环境变量')

export default {
  /*
    for example：
  */
  async xxx (data: any = {}): Promise<AxiosResponse<any, any>> {
    return await http.post(setProxy('/xxx'), { data }, false, false)
  },
  /* 
    uploadFile 上传文件
  */
  async uploadFile (data: any = {}): Promise<AxiosResponse<any, any>> {
    return await http.post(setProxy('/kevin/upload'), { data }, {
      'Content-Type': 'multipart/form-data'
    }, false, false)
  },
  /* 
    verifyFile 获取已上传的切片列表
  */
  async verifyFile (data: any = {}): Promise<AxiosResponse<any, any>> {
    return await http.post(setProxy('/kevin/verify'), { data }, null, false, false)
  },
  /* 
    mergeFile 全部上传完后合并切片
  */
  async mergeFile (data: any = {}): Promise<AxiosResponse<any, any>> {
    return await http.post(setProxy('/kevin/mergeFile'), { data }, null, false, false)
  }
}
