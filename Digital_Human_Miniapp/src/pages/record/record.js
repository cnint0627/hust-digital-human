Page({
    data: {
        records: "",
        user: "",
        vedioUrl: ""
    },

    onLoad: function (options) {
        // 调用云函数获取数据
        let that = this
        wx.cloud.callFunction({
            name: "getUser", // 假设云函数名为 getRecords
            success: res => {
                // 成功调用云函数后，将返回的数据赋值给 records
                that.setData({
                    user: res.result.data.user,
                    records: res.result.data.records,
                });
                var records = JSON.parse(JSON.stringify(that.data.records));
                console.log(records)
                for(let i=0;i<records.length;i++){
                    let promises = [];
                    if (records[i].done === false) {
                        promises.push(
                          checkURLAvailability(records[i].genPath).then(isAvailable => {
                            if (isAvailable) {
                              records[i].done = true;
                              console.log(records[i]._id) // 如果可用，设置 done 为 true
                              wx.cloud.callFunction({
                                name:'updateRecords',
                                data:{
                                  id:records[i]._id
                                },success: res => {
                                  if (res.result.success) {
                                    console.log('更新成功', res.result.data)
                                  } else {
                                    console.error('更新失败', res.result.error)
                                  }
                                },
                                fail: err => {
                                  console.error('调用云函数失败', err)
                                }
                              })
                              console.log('URL 可用，done 已更新为 true');
                              that.setData({
                                records: [...records] // 使用扩展运算符重新生成新数组
                                //to do还差更新数据库。
                               });

                            } else {
                              console.log('URL 不可用');
                            }
                          })
                        );
                      }
                      
                }
                // updateDatabase(records); //更新数据库列表中的done字段
                // that.setData({
                //     records: [...records] // 使用扩展运算符重新生成新数组
                // });
                // var records = JSON.parse(JSON.stringify(that.data.records));
                // for (let i = 0; i < records.length; i++) {
                //     if (records[i].genPath && records[i].done === true) {
                //         const fileID = 'cloud://env-se-1gsyf12s2b24bc51.656e-env-se-1gsyf12s2b24bc51-1330677438/' + records[i].genPath; // 拼接完整的 fileID
                //         console.log("fileID", fileID)
                //         wx.cloud.getTempFileURL({
                //             fileList: [{
                //                 fileID: fileID // 获取云存储的文件 ID
                //             }],
                //             success: function (fileRes) {
                //                 console.log(fileRes)
                //                 console.log('Video file URL:', fileRes.fileList[0].tempFileURL);
                //                 records[i].videoUrl = fileRes.fileList[0].tempFileURL;
                //                 that.setData({
                //                     records: [...records] // 使用扩展运算符重新生成新数组
                //                 });
                //             },
                //             fail: function (error) {
                //                 console.error('获取视频 URL 失败', error);
                //             }
                //         });
                //     }
                // }
                // that.setData({
                //     records: records
                // })
                // console.log(that.data)
                // console.log(this.data);
            },
            fail: err => {
                console.error("调用云函数失败：", err);
            }
        });

    },

    goToHome: function () {
        wx.redirectTo({
            url: '../index/index'
        });

    },

    goToDetail: function (e) {
        let records = this.data.records;
        const recordId = e.currentTarget.dataset.item.genPath;
        console.log(e)
        getApp().globalData.id = e.currentTarget.dataset.item._id;
        getApp().globalData.genPath = recordId;
        // wx.cloud.callFunction({
        //     name: "launchModel_token",
        //     data: {
        //         token: records.token,
        //         id: records._id,
        //         finish_cloudpath: records.genPath,
        //     },
        //     success: res => {
        //         console.log(res.result)
        //     },
        //     fail: res => {
        //         console.log(res.result)
        //     }
        // })
        // console.log("test!!!")
        console.log(getApp().globalData.genPath);
        if (e.currentTarget.dataset.item.done === false) {
            wx.navigateTo({
                url: '/pages/loading/loading',
                success: (navRes) => {
                  // 使用 eventChannel 将数据传递到目标页面
                navRes.eventChannel.emit('acceptDataFromOpenerPage', { targetId: getApp().globalData.id });
                console.log("成功跳转")
                }
            });  
        } else {
            wx.navigateTo({
                url: `../process-done/process-done`,
                success: (navRes) => {
                    // 使用 eventChannel 将数据传递到目标页面
                    navRes.eventChannel.emit('acceptDataFromOpenerPage', {
                        targetId: getApp().globalData.id
                    });
                }
            });
        }
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

  // function updateDatabase(updatedRecords) {
  //   // 假设你使用的是某个数据库 API，例如云开发的数据库
  //   const db = wx.cloud.database();
  //   const recordCollection = db.collection('records');
  
  //   updatedRecords.forEach(record => {
  //     recordCollection.doc(record._id).update({
  //       data: {
  //         done: record.done
  //       }
  //     }).then(res => {
  //       console.log('数据库更新成功', res);
  //     }).catch(err => {
  //       console.error('数据库更新失败', err);
  //     });
  //   });
  // }