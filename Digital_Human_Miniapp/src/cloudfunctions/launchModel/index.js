// 云函数入口文件
const cloud = require('wx-server-sdk')
const axios = require('axios')
const FormData = require('form-data')

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV }) // 使用当前云环境

// 输入：
exports.main = async (event, context) => {
  const {faceID, text}=event
  try{
    // 下载 face 文件
    const file=await cloud.downloadFile({
      fileID: faceID,
    })
    // 创建form-data实例
    const form=new FormData()
    
    form.append('text', text)
    form.append('face', file.fileContent, 'video.mp4')
    //发送请求
    const response = await axios.post(
      'https://u489482-b162-7d3f8240.westb.seetacloud.com:8443/infer',
      form,
      {
        headers: {
          ...form.getHeaders()
        },
        maxContentLength: Infinity,  // 允许大的请求体
        maxBodyLength: Infinity
      }
    )
    
    
    // wx.cloud.uploadFile({
    //   cloudPath:finish_cloudpath,
    //   filePath:response.data,
    //   success: res=>{
    //     console.log('生成成功，文件ID',res.fileID);
    //     finish_fileID=res.fileID;
    //   }
    // })
    return{
      success:true,
      token:response.data
    }
  }catch (error) {
    return {
      success: false,
      error: error.message
    }
  }
}