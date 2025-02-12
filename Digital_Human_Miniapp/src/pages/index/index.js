// index.js
Page({
  // 当前页面的全局数据
  // 前端页面通过data对象（JSON）进行数据交互
  data:{
    cnt: 0,
    user: {
      name: "小明",
      age: 18
    },
    globalData: {}
  },

  onLoad() {
    // 兼容
    console.log(this.renderer)
    if (this.renderer == 'skyline') {
      this.setData({
        placeholderStyle: {color:'#F76260'}
      })
    } else {
      this.setData({
        placeholderStyle: "color:#F76260"
      })
    }
   

  },

  // 页面生命周期函数，除了onLoad还有onShow，onHide等等，请参看文档
  onLoad: function(){
    // 页面初次加载时调用
    console.log("第一次加载")

    const app = getApp()
    this.setData({
      globalData: getApp().globalData,
      user:{name : getApp().name}
    })
    console.log(this.data)
    
  },

  // 自定义函数
  navigateToSynthesize:function(){
    wx.navigateTo({
        url: '../process/process',//要跳转到的页面路径
    })
  },

  navigateToFeedback:function(){
    wx.navigateTo({
        url: '../advice/advice',//要跳转到的页面路径
    })
  },
  navigateToHistory:function(){
    wx.navigateTo({
        url: '../record/record',//要跳转到的页面路径
    })
  },
})
