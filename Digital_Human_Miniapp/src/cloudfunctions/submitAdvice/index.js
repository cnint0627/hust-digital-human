const cloud = require('wx-server-sdk');
const fs = require('fs')
const path = require('path')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });

exports.main = async (event) => {
    const { name, email, feedback } = event;
    
    // 生成文件名，格式为 name_email.txt
    const fileName = `${name}_${email}.txt`;
    const filePath = `advice/${fileName}`;

    // 将反馈内容格式化
    const content = `Name: ${name}\nEmail: ${email}\nFeedback: ${feedback}\n`;

    try {
        // 将内容上传到云存储
        const res = await cloud.uploadFile({
            cloudPath: filePath,
            fileContent: content, // 文件内容
        });

        return { success: true };
    } catch (error) {
        console.error('上传失败:', error);
        return { success: false };
    }
};
