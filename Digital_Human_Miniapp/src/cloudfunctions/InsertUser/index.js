// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV }) // 使用当前云环境

// 获取云数据库引用
const db = cloud.database()
const _ = db.command

// 云函数入口函数
exports.main = async (event, context) => {
  try{
    // 获取当前用户的 openid
    const openid = cloud.getWXContext().OPENID

    // 获取当前日期和时间
    const now = new Date()
    now.setHours(now.getHours() + 8); // 调整时区
    const date = now.toISOString().split('T')[0] // YYYY-MM-DD 格式
    const time = now.toTimeString().split(' ')[0] // HH:MM:SS 格式
    // 获取自增的_id
    const countResult=await db.collection('records').count()
    const newId = countResult.total + 1 // 记录数加1作为新的 _id
    // 插入用户记录
    
    const userResult = await db.collection('users').add({
      data: {
        openid: openid,
        name: event.name || 'Anonymous' // 从 event 中获取用户名称
      }
    })
    console.log('User record added:', userResult)
    // 插入记录到 records 表
    const recordResult = await db.collection('records').add({
      data: {
        _id: newId.toString(),
        openid: openid,
        refPath: event.refPath || 'Not yet onload',
        refText: event.refText || 'Default text',
        done: event.done || false,
        genPath: event.genPath || 'Not yet generated',
        date: event.date || date, 
        time: event.time || time ,
        param: event.param ,
        token: event.token,
        fileExtension: event.fileExtension,
      }
    })
    console.log('Record added:', recordResult)
    // 返回插入结果
    return {
      success: true,
      data: {
        userResult,
        recordResult,
        newId,
      }
    }

  }catch (err) {
    console.error(err)
    return {
      success: false,
      error: err
    }
  }
}