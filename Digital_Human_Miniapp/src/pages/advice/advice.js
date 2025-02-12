Page({
    data: {
        name: '',
        email: '',
        feedback: '',
    },

    onLoad() {
        // 兼容
        console.log(this.renderer);
        if (this.renderer == 'skyline') {
            this.setData({
                placeholderStyle: {
                    color: '#F76260'
                }
            });
        } else {
            this.setData({
                placeholderStyle: "color:#F76260"
            });
        }
    },

    goBack: function () {
        wx.navigateBack({
            delta: 1
        });
    },

    bindNameInput: function (e) {
        this.setData({
            name: e.detail.value
        });
    },

    bindEmailInput: function (e) {
        this.setData({
            email: e.detail.value
        });
    },

    bindFeedBackInput: function (e) {
        this.setData({
            feedback: e.detail.value
        });
    },

    submitFeedback: function () {
        const { name, email, feedback } = this.data;

        console.log('提交的反馈数据:', { name, email, feedback });

        // 检查输入是否完整
        if (name && email && feedback) {
            // 调用云函数
            wx.cloud.callFunction({
                name: 'submitAdvice', // 云函数名称
                data: {
                    name: name,
                    email: email,
                    feedback: feedback
                },
                success: res => {
                    console.log('云函数返回:', res);
                    console.log(res.result.success);
                    if (res.result.success) {
                        wx.showToast({
                            title: '提交成功',
                            icon: 'success',
                            duration: 2000
                        });

                        // 提交成功后返回首页
                        setTimeout(() => {
                            wx.reLaunch({
                                url: '/pages/index/index'
                            });
                        }, 2000);
                    } else {
                        wx.showToast({
                            title: '提交失败',
                            icon: 'error',
                            duration: 2000
                        });
                    }
                },
                fail: err => {
                    console.error('调用云函数失败:', err);
                    wx.showToast({
                        title: '提交失败，请重试',
                        icon: 'error',
                        duration: 2000
                    });
                }
            });
        } else {
            wx.showToast({
                title: '信息不完整',
                icon: 'error',
                duration: 2000
            });
        }
    }
});
