const FILE_TYPE_CONFIG = {
    pdf: {
        mime: 'application/pdf',
        extension: '.pdf'
    },
    word: {
        mime: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        extension: '.docx'
    },
    excel: {
        mime: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        extension: '.xlsx'
    },
    image: {
        mime: 'image/jpeg',
        extension: '.jpg'
    }
}

export const fetchAndDownloadFile = async (url, fileType, fileName, headers = {}) => {
    try {
        const config = FILE_TYPE_CONFIG[fileType]
        const response = await axios({
            url: url,
            method: 'GET',
            responseType: 'blob',  // 请求文件时,后端一般返回二进制数据,将二进制数据转换成Blob对象
            headers: {
                token: 'sss',     // 可以携带token
                Accept: config.mime  // 期望格式
            }
        })
        // 创建下载链接
        const url = URL.createObjectURL(response.data)
        const a = document.createElement('a')
        a.href = url
        a.download = `${fileName}${config.extension}`  // 更改文件名
        a.click()
    } catch (error) { }
}
