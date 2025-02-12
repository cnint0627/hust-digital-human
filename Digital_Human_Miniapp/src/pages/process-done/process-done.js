// pages/process-done/process-done.js
Page({
  /**
   * 页面的初始数据
   */
  data: {
    imagePath: '', // 用于存储传递的图片路径
    performance: '', // 性能信息
    time: '',        // 合成时间
    synthesisType: '',
    expressionLevel: '',
    voiceStyle:'',
    backgroundScene:'',
    actionType:'',
    RecordId:'',
    done:false,
    date:'',
    time:'',
    dialogue:'',
    token:'',
    fileType:'',
    fileExtension:'',
    videoUrl:''
  },
  
  onLoad(options){
    // 获取当前页面的 eventChannel
    const eventChannel = this.getOpenerEventChannel();
    
    // 监听 'acceptDataFromOpenerPage' 事件
    eventChannel.on('acceptDataFromOpenerPage', (data) => {
      console.log('从上一页面接收到的数据:', data);

      this.setData({
        RecordId: data.targetId
      });

      //查询记录
      this.fetchRecordById(data.targetId);
    });
  },

  save(){
    wx.downloadFile({
      url: this.data.videoUrl, // 视频资源地址
      filePath: wx.env.USER_DATA_PATH + '/output.mp4',
      header: {
        "Content-Type":"video/mp4"
        },
      success: res => {
        console.log('downloadFile成功回调res:', res)
        wx.hideLoading()
        let FilePath= res.filePath; // 下载到本地获取临时路径
        let fileManager = wx.getFileSystemManager();
        // 保存到相册
        wx.saveVideoToPhotosAlbum({ // 保存到相册
          filePath: FilePath,
          success: file => {
            // console.log('saveVideoToPhotosAlbum成功回调file:', file)
            wx.showToast({
              title: '视频保存成功',
              duration: 3000,
              icon: 'success'
            })
            fileManager.unlink({ // 删除临时文件
              filePath: wx.env.USER_DATA_PATH + '/' + fileName + '.mp4',
            })
          },
          fail: err => {
            // console.log('saveVideoToPhotosAlbum失败回调err:', err)
            fileManager.unlink({ // 删除临时文件
              filePath: wx.env.USER_DATA_PATH + '/' + fileName + '.mp4'
            })
            wx.showToast({
              title: '视频保存失败',
              duration: 3000,
              icon: 'fail'
            })
          },
          complete() {
            wx.hideLoading()
          }
        })
        //
      },
      fail(e) {
        console.log('失败e', e)
        wx.showToast({
          title: '视频保存失败1',
          duration:3000,
          icon:'none'
        })
      },
      complete() {
        // wx.hideLoading();
      }
})
  },

  fetchRecordById(_id) {
    let that=this
    console.log('Fetching record with _id:', _id); // 确认 _id 是否有效
        // 调用云函数以根据 _id 查询记录
    wx.showLoading({
      title: 'loading',
    })
    wx.cloud.callFunction({
      name: 'SelectById',
      data: { _id: _id },
      success: (res) => {
        if (res.result.success) {
          wx.hideLoading()
          console.log("sss:",res);
          this.setData({
            actionType: res.result.data.param.actionType, // 设置查询到的记录
            backgroundScene: res.result.data.param.backgroundScene,
            expressionLevel: res.result.data.param.expressionLevel,
            synthesisType: res.result.data.param.synthesisType,
            voiceStyle: res.result.data.param.voiceStyle,
            filePath: res.result.data.genPath,
            done: res.result.data.done,
            time: res.result.data.time,
            date: res.result.data.date,
            dialogue: res.result.data.param.dialogue,
            token: res.result.data.token,
            fileExtension: res.result.data.fileExtension
          });
          console.log('Record fetched successfully:', res.result.data);
          this.setData({videoUrl:res.result.data.genPath});
           // 获取视频文件的临时 URL
        //    if (res.result.data.genPath) {
        //     const fileID = 'cloud://env-se-1gsyf12s2b24bc51.656e-env-se-1gsyf12s2b24bc51-1330677438/' + res.result.data.genPath; // 拼接完整的 fileID
        //     console.log("fileID",fileID)
        //     wx.cloud.getTempFileURL({
        //       fileList: [{
        //         fileID: fileID  // 获取云存储的文件 ID
        //       }],
        //       success: function (fileRes) {
        //         console.log(fileRes)
        //         console.log('Video file URL:', fileRes.fileList[0].tempFileURL);
        //         that.setData({
        //           videoUrl: fileRes.fileList[0].tempFileURL  // 设置视频临时 URL
        //         });
        //       },
        //       fail: function (error) {
        //         console.error('获取视频 URL 失败', error);
        //       }
        //     });
        //   }
          
        } else {
          wx.showToast({
            title: '记录未找到',
            icon: 'error',
          });
          console.error('Failed to fetch record:', res.result.message);
        }
        // if(!that.data.done){
        //   wx.cloud.callFunction({
        //     name:"launchModel_token",
        //     data:{
        //       token:token,
        //       id:_id,
        //       finish_cloudpath:genPath
        //     },
        //     success: res =>{
        //       console.log(res)
        //     },
        //     fail: res =>{
        //       console.log(res)
        //     }
        //   })
        // }
      },
      fail: (err) => {
        wx.showToast({
          title: '查询失败',
          icon: 'error',
        });
        console.error('Failed to call selectById:', err);
      },
    });
  },

  goToHome: function () {
    wx.redirectTo({
        url: '../index/index'
    });

},
})