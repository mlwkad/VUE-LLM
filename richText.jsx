import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react'
import { Card, message } from 'antd'
import '@wangeditor/editor/dist/css/style.css' // 引入 css
import { Editor, Toolbar } from 'csr!@wangeditor/editor-for-react'
import { SlateEditor, SlateText } from '@wangeditor/editor'

function Index(props) {
  const { value = '', onChange, id } = props
  const [html, setHtml] = useState('')
  const [editor, setEditor] = useState(null)
  const editorRef = useRef()
  const [isMouseDown, setIsMouseDown] = useState(false);

  const handleMouseDown = useCallback(() => {
    setIsMouseDown(true);
  }, []);

  const handleMouseUp = useCallback(() => {
    const selectText = editor?.getSelectionText();
    if (isMouseDown && editor?.copyStyleObject && selectText) {
      // 先清除选中节点的样式
      // 获取所有 text node
      const nodeEntries = SlateEditor.nodes(editor, {
        match: (n) => SlateText.isText(n),
        universal: true,
      });
      for (const nodeEntry of nodeEntries) {
        // 单个 text node
        const n = nodeEntry[0];
        const keys = Object.keys(n);
        keys.forEach((key) => {
          if (key === 'text') {
            // 保留 text 属性，text node 必须的
            return;
          }
          // 其他属性，全部清除
          SlateEditor.removeMark(editor, key);
        });
      }
      // 再赋值新样式
      Object.entries(editor.copyStyleObject).forEach(([key, value]) => {
        if (key === 'text') {
          // 保留 text 属性，text node 必须的
          return;
        }
        editor.addMark(key, value);
      });

      editor.copyStyleObject = undefined;
      setIsMouseDown(false);
      message.success('格式应用成功。');
    }
  }, [editor, isMouseDown]);
  // 在useEffect中添加调试代码
  // 事件监听逻辑

  useEffect(() => {
    const handleUp = () => handleMouseUp();
    const handleDown = () => handleMouseDown();

    // 改为监听整个文档的鼠标事件
    document.addEventListener('mousedown', handleDown);
    document.addEventListener('mouseup', handleUp);

    return () => {
      document.removeEventListener('mousedown', handleDown);
      document.removeEventListener('mouseup', handleUp);
    };
  }, [handleMouseDown, handleMouseUp]);

  async function customCheckImageFn(src) {
    if (!src) {
      return
    }
    if (src.indexOf('http') !== 0 && !src.startsWith('data:image')) {
      message.warning('图片网址必须以 http/https 开头')
      return
    }
    let res = await checkImgExists(src)
    if (!res) {
      message.warning('请输入有效的图片网址')
      return
    }
    return true
  }

  // 工具栏配置
  const toolbarConfig = {
    excludeKeys: ['group-video', 'emotion'], // 排除不需要的按钮
    insertKeys: {
      // 在这里插入自定义按钮
      index: 9, // 插入位置
      keys: ['formatBrushMenu'] // 插入自定义菜单的 key
    }
  };
  // 编辑器配置
  const editorConfig = {
    placeholder: '请输入内容...',
    MENU_CONF: {
      uploadImage: {
        // base64LimitSize: 10 * 1024 * 1024, // 5kb
        uploadImgShowBase64: true,
        // 单个文件的最大体积限制，默认为 2M
        maxFileSize: 2 * 1024 * 1024,
        // 选择文件时的类型限制，默认为 ['image/*'] 。如不想限制，则设置为 []
        allowedFileTypes: ['image/*'],
        withCredentials: true, // 跨域是否传递 cookie ，默认为 false
        server: getServiceUrl(),
        fieldName: 'file',
        timeout: 10 * 1000,
        onBeforeUpload(file) {
          console.log('onBeforeUpload', file)
          return file // will upload this file
          // return false // prevent upload
        },
        onProgress(progress) {
          console.log('onProgress', progress)
        },
        onSuccess() {
          message.success('上传成功')
        },
        onFailed(file, res) {
          message.error(res.message || '上传失败')
        },
        onError(file, err, res) {
          message.error(err.message || res.message || '上传失败')
        },
        async customInsert(res, insertFn) {
          const imgInfo = res.data || {}
          const { id, fileType = 'png', name = '' } = imgInfo
          const imgUrl = getFetchUrl(env, 'financialCase/downloadImage')
          const url = `${imgUrl}/${id}.${fileType}`
          // const url = `${imgUrl}/${id}.${fileType}?disposition=inline`
          const base64Url = `${imgUrl}/${id}.${fileType}`
          // const base64Url = await getBase64(url, true)
          const alt = name
          insertFn(base64Url, alt, url)
        },
      },
      insertImage: {
        checkImage: customCheckImageFn, // 也支持 async 函数
      },
      insertLink: {
        checkLink: (text, url) => {
          if (!url) {
            return
          }
          if (url.indexOf('http') !== 0) {
            message.warning('链接必须以 http/https 开头')
            return
          }
          return true
        },
      },
    },
  }

  useEffect(() => {
    return () => {
      // 及时销毁 editor
      if (editor == null) return
      editor.destroy()
      setEditor(null)
    }
  }, [editor])

  useEffect(() => {
    if (value !== html) {
      setHtml(value || '<p></p>')
    }
  }, [value])

  return (
    <div className="MyEditor" ref={editorRef} key={id}>
      <Card id={`toolbar-container-${id}`} >
        <Toolbar
          editor={editor}
          defaultConfig={toolbarConfig}
          mode="default"
        />
        <Editor
          defaultConfig={editorConfig}
          value={html}
          onCreated={setEditor}
          onChange={(editor) => onChange?.(editor.getHtml())}
          mode="default"
        />
      </Card>
    </div>
  )
}

export default Index
