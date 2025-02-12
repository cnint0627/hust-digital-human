// 云函数入口文件
const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV }) // 使用当前云环境
const db=cloud.database()

// 云函数入口函数
exports.main = async (event, context) => {
  const {id}=event;

  try{
    
    await db.collection('records').doc(id).update({
      data:{
        done:true
      }
    })
    return {
      success: true,
      message: 'Record updated successfully.'
    }
  } catch (error) {
    return {
      success: false,
      message: 'Failed to update record.',
      error: error
    }
  }
}
