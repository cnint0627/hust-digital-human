// 云函数入口文件
const cloud = require('wx-server-sdk')
const axios = require('axios')
const FormData = require('form-data')

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV }) // 使用当前云环境

// 云函数入口函数
exports.main = async (event, context) => {
  const {token, id, finish_cloudpath}=event
  try{
    
    const response = await axios.get(
      'https://u489482-b162-7d3f8240.westb.seetacloud.com:8443/query',{
        params:{token:token}
      }
    )
    if(response.data.err_code===0){
      wx.cloud.uploadFile({
        cloudPath:finish_cloudpath,
        filePath:response.data.file,
        
      },
      wx.cloud.callFunction({
        name:'uploadRecords',
        data:{
          id:id,
          genPath:finish_cloudpath,
        },
        fail:err=>{
          success:false;
          message:err;
        }
      })
      )
      return{
        success:true,
        message:'生成文件已成功写入存储'
      }
    }
    else if(response.data.err_code===1){
      console.log(response.data);
      return{
        success:false,
        message:response.data.msg
      }
    }
    else if(response.data.err_code===0){
      return{
        success:false,
        message:response.data.msg
      }
    }
  }catch (error) {
    return {
      success: false,
      error: error.message
    }
  }

  
}
