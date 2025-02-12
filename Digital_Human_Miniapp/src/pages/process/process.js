// pages/process/process.js
Page({
  data: {
    imagePath: '', // 上传的文件路径
    synthesisType:['3D模型','2D卡通','写实风格'], // 生成类型
    expressionLevels:['微笑','严肃','愤怒'],
    voiceStyle:['温暖','沉稳','活泼'],
    backgroundScenes:['城市','自然','室内'],
    actionTypes:['站立','挥手','坐定'],
    dialogue:'',
    targetId:'',
    // 选择的值
    selectedSynthesisType: '3D 模型',
    selectedExpressionLevel: '微笑',
    selectedVoiceStyle: '温暖',
    selectedBackgroundScene: '城市',
    selectedActionType: '站立',

    isImage:false,
    isVedio:false,
  },
  
  //  // 事件处理函数
  //  onSynthesisTypeChange: function(e) {
  //   this.setData({
  //     selectedSynthesisType: this.data.synthesisType[e.detail.value]
  //   });
  // },
  // onExpressionLevelChange: function(e) {
  //   this.setData({
  //     selectedExpressionLevel: this.data.expressionLevels[e.detail.value]
  //   });
  // },
  // onVoiceStyleChange: function(e) {
  //   this.setData({
  //     selectedVoiceStyle: this.data.voiceStyle[e.detail.value]
  //   });
  // },
  // onBackgroundSceneChange: function(e) {
  //   this.setData({
  //     selectedBackgroundScene: this.data.backgroundScenes[e.detail.value]
  //   });
  // },
  // onActionTypeChange: function(e) {
  //   this.setData({
  //     selectedActionType: this.data.actionTypes[e.detail.value]
  //   });
  // },
  onDialogueInput: function(e) {
    this.setData({
      dialogue: e.detail.value
    });
  },
  // 选择合成选项
  selectOption(e) {
    this.setData({
      selectedOption: e.detail.value, // 获取用户选择的选项
    });
  },

//<<<<<<< HEAD:pages/process/process.js
  // 上传文件
  uploadFile() {
    wx.showActionSheet({
      itemList: ['从相册导入','相机拍摄'],
      success:(res)=>{
        if(res.tapIndex===0){
          this.chooseFromAlbum();
        }else if(res.tapIndex==1){
          this.takePhotoOrVideo();
        }
      },
      fail:(err)=>{
        console.log(err.errMsg);
      }
    })

  },

  goToHome: function () {
    wx.redirectTo({
        url: '../index/index'
    });

},

  chooseFromAlbum(){
    let that = this;
    wx.chooseMedia({
      count:1,
      mediaType:['image','video'],
      sourceType:['album'],
      success:(res)=>{
        console.log('文件路径:',res.tempFiles[0].tempFilePath);
        that.setData({
          imagePath: res.tempFiles[0].tempFilePath
        })
        wx.showToast({
          title: '成功从相册导入',
          icon: 'success'
        });
      },
      fail: (err) =>{
        console.log('从相册导入失败:', err);
      }
    });
  },

  // 使用相机拍摄
  takePhotoOrVideo() {
    let that = this;
    wx.chooseMedia({
      count: 1,
      mediaType: ['image', 'video'], // 选择图片或视频
      sourceType: ['camera'], // 仅使用相机
      success: (res) => {
        console.log('文件路径:', res.tempFiles[0].tempFilePath);
        that.setData({
          imagePath: res.tempFiles[0].tempFilePath
        })
        wx.showToast({
          title: '成功拍摄',
          icon: 'success'
        });
      },
      fail: (err) => {
        console.log('拍摄失败:', err);
      }
    });
  },
  startSynthesis(){
    
    // 收集所选参数
    const Allparams = {
      // synthesisType: this.data.selectedSynthesisType,
      // expressionLevel: this.data.selectedExpressionLevel,
      // voiceStyle: this.data.selectedVoiceStyle,
      // backgroundScene: this.data.selectedBackgroundScene,
      // actionType: this.data.selectedActionType,
      dialogue: this.data.dialogue,
    };
    // 逻辑：使用所选参数进行生成
    // console.log('参数:', this.data.selectedSynthesisType, this.data.selectedExpressionLevel, this.data.selectedVoiceStyle, this.data.selectedBackgroundScene, this.data.selectedActionType);
    let that=this;

    //构造云存储路径
    const fileExtension=that.data.imagePath.split('.').pop();
    let finish_fileID='';
    const finish_cloudpath=''
    let fileID='';
    let number_of_id=(Number(getApp().globalData.id)+1).toString()
    const cloudpath=`refFiles/${number_of_id}.${fileExtension}`;
    let token=''
    wx.showLoading({
      title: 'loading',
    })
    wx.cloud.uploadFile({
      cloudPath:cloudpath,
      filePath:that.data.imagePath,
      success: res => {
        console.log('上传成功，文件 ID:', res.fileID);
        fileID=res.fileID;
        console.log(fileID);
        //输入：fileID和用户选择的参数。输出finish_fileID
        wx.cloud.callFunction({
          name:'launchModel',
          data:{
            faceID:res.fileID,
            text:that.data.dialogue
          },
          success:res=>{
            console.log('生成成功，生成token:',res);
            finish_fileID=res.result.finish_fileID;
            token=res.result.token;
            
            console.log(finish_cloudpath);
                //存数据库
            
            wx.cloud.callFunction({
              name:'InsertUser',
              data:{
                name:'Bobby',
                refPath:cloudpath,
                done:false,
                genPath:`https://u489482-b162-7d3f8240.westb.seetacloud.com:8443/query?token=${res.result.token.token.toString()}`,
                param:Allparams,
                token:res.result.token.token.toString(),
                fileExtension:fileExtension,
              },
              success: (res)=>{
                console.log('Data inserted successfully:', res.result)
                console.log(fileID)
                that.setData({
                  targetId: res.result.data.newId.toString()
                });

                //更新全局数据id
                getApp().globalData.id=that.data.targetId;
                console.log('全局数据 id更新为',getApp().globalData.id)
                // 确保 targetId 已经赋值后再导航到新页面
                wx.navigateTo({
                url: '/pages/loading/loading',
                success: (navRes) => {
                  // 使用 eventChannel 将数据传递到目标页面
                  // navRes.eventChannel.emit('acceptDataFromOpenerPage', { targetId: that.data.targetId });
                  console.log("成功跳转")
                }
              });  

              wx.showToast({
                title: '数据上传成功',
                icon: 'success'
              })
              },
              fail: (err)=> {
                console.error('Failed to insert data:', err)
                wx.showToast({
                  title: '数据上传失败',
                  icon: 'error'
                })
              }
            })
          }
        })
        },
        fail:err=>{
          console.error('上传失败',err)
        }
      })
    
  
    // wx.showToast({
    //   title: '开始生成...',
    //   icon:'loading'
    // })

    // wx.navigateTo({
    //   url: '/pages/process-done/process-done',
    //   success: (res) => {
    //     // 使用 eventChannel 将数据传递到目标页面
    //     res.eventChannel.emit('acceptDataFromOpenerPage', { targetId: that.data.targetId });
    //   }
    // })
  }
});
