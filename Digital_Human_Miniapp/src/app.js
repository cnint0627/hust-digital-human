// app.js

App({
    globalData:{
        name:"",
        id:0,
        openid: null,
        genPath:"",
        fileID:""
    },

    onLaunch(){
      // 小程序首次加载时调用
      
      // 初始化云环境（只用在app.js这里初始化一次，后面任何地方都不用再初始化）
      wx.cloud.init({
        env: 'env-se-1gsyf12s2b24bc51'
      })
      console.log("云开发环境初始化成功")

      // 调用云函数，获取用户信息（openid）
      wx.cloud.callFunction({
        name: "getUser",
        complete: (res)=>{
          console.log(res.result)
          console.log("用户的openid为：", res.result.data.user.openid)
          this.globalData.openid = res.result.data.user.openid
          this.globalData.name = res.result.data.user.name
        }
      });

      // 测试通过云函数从数据库获取数据
      wx.cloud.callFunction({
        name: "testGetDataFromDatabase",
        complete: (res)=>{
          console.log("从数据库集合users中获取到了数据！openid为1的用户的用户名如下：")
          console.log(res.result)
        }
      })
    }
})
