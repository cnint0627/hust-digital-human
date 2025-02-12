/* loading.js */
Page({
  data: {
    loadingID:'',
    genPath:'',
  },
  intervalID:null,
  onLoad(options){
    // 获取当前页面的 eventChannel
    const eventChannel = this.getOpenerEventChannel();
    let that=this
    // 监听 'acceptDataFromOpenerPage' 事件
    eventChannel.on('acceptDataFromOpenerPage', (data) => {
      console.log('从上一页面接收到的数据:', data);
      that.setData({
        loadingID: data.targetId
      });
      console.log(that.data.loadingID)
      //查询记录,也相当于初始化
      this.fetchRecordById(data.targetId);
      
      this.intervalID = setInterval(() => {
        this.check();
      }, 3000);
    });
  },
  onUnload() {
    // 页面卸载时清除定时器
    clearInterval(this.intervalID);
  },


  fetchRecordById(_id) {
    let that=this;
    console.log('Fetching record with _id:', _id); // 确认 _id 是否有效
        // 调用云函数以根据 _id 查询记录
    wx.cloud.callFunction({
      name: 'SelectById',
      data: { _id: _id },
      success: (res) => {
        if (res.result.success) {
          console.log('Record fetched successfully:', res.result.data);
          that.setData({
            genPath: res.result.data.genPath,
          });
          console.log(this.data.genPath);
          this.check();
          
        } else {
          wx.showToast({
            title: '记录未找到',
            icon: 'error',
          });
          console.error('Failed to fetch record:', res.result.message);
        }
      },
    })
  },

  stopInterval() {
    clearInterval(this.intervalID);
    console.log('定时器已停止');
  },
  goToHome: function () {
    wx.redirectTo({
        url: '../index/index'
    });
  },

  goToDetails: function(){
    wx.navigateTo({
      url: `../process-done/process-done`,
      success: (navRes) => {
          // 使用 eventChannel 将数据传递到目标页面
          navRes.eventChannel.emit('acceptDataFromOpenerPage', {
              targetId: this.data.loadingID
          });
      }
  });
  },
  check(){
    console.log(this.data.genPath)
    checkURLAvailability(this.data.genPath).then(isAvailable =>{
      if(isAvailable) {
        this.stopInterval();
        console.log('URL 可用，done 已更新为 true');
        // updateDatabase(this.loadingID);
        this.goToDetails();
      }
      else{
        console.log('URL 不可用');
      }
    })
  }
});

function checkURLAvailability(url) {
  return new Promise((resolve, reject) => {
    wx.request({
      url: url,
      method: 'HEAD',
      success: function(res) {
        console.log(res)
        if (res.header['Content-Type'] === "video/mp4") {
          resolve(true); // 请求成功，返回 true
        } else {
          resolve(false); // 请求失败，返回 false
        }
      },
      fail: function() {
        resolve(false); // 请求失败，返回 false
      }
    });
  });
}

function updateDatabase(_id) {
  // 假设你使用的是某个数据库 API，例如云开发的数据库
  const db = wx.cloud.database();
  const recordCollection = db.collection('records');

  
  recordCollection.doc(_id).update({
    data: {
      done: true
    }
  }).then(res => {
    console.log('数据库更新成功', res);
  }).catch(err => {
    console.error('数据库更新失败', err);
  });
    
}