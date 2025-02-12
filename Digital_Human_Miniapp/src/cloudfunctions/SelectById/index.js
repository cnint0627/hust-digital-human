// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV }) // 使用当前云环境

// 获取云数据库引用
const db = cloud.database()
const _ = db.command

// 云函数入口函数
exports.main = async (event, context) => {
  try {
    // 获取传入的 _id 参数
    const { _id } = event;

    // 查询 records 集合中与 _id 匹配的记录
    const recordResult = await db.collection('records')
      .where({ _id: _id.toString() }) // 确保 _id 是字符串
      .get();
    console.log('Query result:', recordResult); // 打印查询结果
    // 如果找不到记录，则返回错误信息
    if (recordResult.data.length === 0) {
      return {
        success: false,
        message: 'Record not found'
      };
    }

    // 返回查询到的记录
    return {
      success: true,
      data: recordResult.data[0] // 假设 _id 唯一，取第一条记录
    };

  } catch (err) {
    console.error(err);
    return {
      success: false,
      error: err
    };
  }
}