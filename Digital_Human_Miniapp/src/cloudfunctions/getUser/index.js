const cloud = require('wx-server-sdk');
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV }); // 使用当前云环境

// 获取云数据库引用
const db = cloud.database();
const _ = db.command;

// 云函数入口函数
exports.main = async (event, context) => {
  try {
    // 获取当前用户的 openid
    const openid = cloud.getWXContext().OPENID;

    // 查询用户信息
    const userRes = await db.collection('users')
      .where({ openid: openid })
      .get();

    // 检查用户是否存在
    if (userRes.data.length === 0) {
      // 用户不存在，添加用户到数据库
      await db.collection('users').add({
        data: {
          openid: openid,
          name: openid
        }
      });
    }

    // 查询合成记录
    const recordsRes = await db.collection('records')
      .where({ openid: openid })
      .orderBy("_id", "desc")
      .get();

    // 合并结果
    const user = userRes.data[0] || { openid: openid }; // 如果用户刚被添加，确保返回用户信息
    const records = recordsRes.data;

    // 返回合并后的结果
    return {
      success: true,
      data: {
        user: user,
        records: records
      }
    };
  } catch (err) {
    console.error(err);
    return {
      success: false,
      error: err
    };
  }
};