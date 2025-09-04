# Iframe 消息发送格式文档

## 概述

本文档定义了从 iframe 向父窗口发送消息的标准格式和使用方法。

## 快速开始

在 iframe 中发送消息到父窗口：

```javascript
// 基础用法
const eventData = {
  type: "IFRAME_EVENT",
  action: "button_clicked",
  eventId: crypto.randomUUID(), // 生成唯一标识符
  timestamp: new Date().toISOString(),
  payload: {
    message: "Hello from iframe!",
  },
};

window.parent.postMessage(eventData, "*");
```

## 标准消息格式

所有从 iframe 发送到父窗口的消息都遵循以下统一格式：

```javascript
{
  type: "IFRAME_EVENT",           // 固定消息类型
  action: "specific_action",      // 具体动作类型
  eventId: crypto.randomUUID(),    // 事件唯一标识符
  timestamp: "2025-01-09T15:30:45.123Z", // 事件时间戳
  payload: {                      // 消息载荷，可包含任意字段
    message: "描述性消息内容",
    // 可以包含其他任意字段
    data: {},
    userId: "user123",
    // ... 其他自定义字段
  }
}
```

## 字段说明

### 必需字段

| 字段名 | 类型 | 说明 |
|--------|------|------|
| `type` | string | 固定值: `"IFRAME_EVENT"` |
| `action` | string | 具体的动作类型，如 `"button_clicked"`, `"user_login"` 等 |
| `eventId` | string | 事件唯一标识符，可使用 UUID 或自定义格式 |
| `timestamp` | string | ISO 8601 格式的时间戳，使用 `new Date().toISOString()` |
| `payload` | object | 消息载荷，可包含任意字段和数据 |

### payload 字段

`payload` 对象可以包含任意字段，根据具体的业务需求定义。以下是一些常用字段示例：

| 字段名 | 类型 | 必需 | 说明 |
|--------|------|------|------|
| `message` | string | 可选 | 描述性消息内容 |
| `data` | any | 可选 | 具体的业务数据 |
| `userId` | string | 可选 | 用户标识 |
| `formData` | object | 可选 | 表单数据 |
| `status` | string | 可选 | 状态信息 |

**注意**: payload 中的字段完全由业务需求决定，可以是任意的 JSON 可序列化对象。

## 支持的 Action 类型

### 基础动作
- `button_clicked` - 通用按钮点击
- `user_login` - 用户登录事件
- `user_logout` - 用户登出事件
- `page_loaded` - 页面加载完成
- `form_submitted` - 表单提交事件
- `send_current_time` - 发送当前时间

### 扩展动作
- `generate_image` - 生成图片事件（基于颜色生成图片，需要父窗口响应）

## 消息示例

### 1. 基础按钮点击
```javascript
{
  type: "IFRAME_EVENT",
  action: "button_clicked",
  eventId: crypto.randomUUID(),
  timestamp: "2025-01-09T15:30:45.123Z",
  payload: {
    message: "Hello from iframe!"
  }
}
```

### 2. 用户登录
```javascript
{
  type: "IFRAME_EVENT",
  action: "user_login",
  eventId: crypto.randomUUID(),
  timestamp: "2025-01-09T15:30:45.123Z",
  payload: {
    message: "user_login event triggered"
  }
}
```

### 3. 发送当前时间
```javascript
{
  type: "IFRAME_EVENT",
  action: "send_current_time",
  eventId: crypto.randomUUID(),
  timestamp: "2025-01-09T15:30:45.123Z",
  payload: {
    message: "Current time: 2025/01/09 23:30:45 (Asia/Shanghai)"
  }
}
```

### 4. 表单提交事件
```javascript
{
  type: "IFRAME_EVENT",
  action: "form_submitted",
  eventId: crypto.randomUUID(),
  timestamp: "2025-01-09T15:30:45.123Z",
  payload: {
    message: "用户提交了表单",
    formData: {
      name: "张三",
      email: "zhangsan@example.com",
      age: 25
    },
    formId: "user-registration",
    isValid: true
  }
}
```

### 5. 生成图片事件
```javascript
{
  type: "IFRAME_EVENT",
  action: "generate_image",
  eventId: crypto.randomUUID(),
  timestamp: "2025-01-09T15:30:45.123Z",
  payload: {
    message: "请求生成图片，颜色: #ff6b6b",
    color: "#ff6b6b",
    width: 400,
    height: 300
  }
}
```

### 6. 用户操作事件
```javascript
{
  type: "IFRAME_EVENT",
  action: "user_action",
  eventId: crypto.randomUUID(),
  timestamp: "2025-01-09T15:30:45.123Z",
  payload: {
    message: "用户执行了操作",
    userId: "user_12345",
    actionType: "click",
    targetElement: "save-button",
    data: {
      pageId: "settings",
      section: "profile"
    },
    metadata: {
      userAgent: "Mozilla/5.0...",
      screenResolution: "1920x1080"
    }
  }
}
```


## 响应数据格式

当使用 Hook 发送需要响应的消息时，将接收到以下格式的响应数据：

### 成功响应格式
```javascript
{
  type: "IFRAME_EVENT_RESPONSE",
  eventId: "与请求相同的eventId",
  success: true,
  data: {
    // 具体的响应数据，由业务需求决定
    imageUrl: "https://example.com/generated-image.jpg",
    color: "#ff6b6b",
    generatedAt: "2025-01-09T15:30:47.123Z"
  }
}
```

### 错误响应格式
```javascript
{
  type: "IFRAME_EVENT_RESPONSE",
  eventId: "与请求相同的eventId",
  success: false,
  error: "错误描述信息"
}
```

### 响应字段说明

| 字段名 | 类型 | 必需 | 说明 |
|--------|------|------|------|
| `type` | string | 是 | 固定值: `"IFRAME_EVENT_RESPONSE"` |
| `eventId` | string | 是 | 必须与原始请求的 eventId 一致，用于 Hook 匹配请求和响应 |
| `success` | boolean | 是 | 响应是否成功 |
| `data` | any | 否 | 成功时返回的数据，根据具体业务需求定义 |
| `error` | string | 否 | 失败时的错误描述信息 |

## React Hook 用法 (useIframeMessage)

为了简化 iframe 与父窗口之间的异步通信，我们提供了一个 React Hook：`useIframeMessage`。

### Hook 特性

- ✅ **Promise API**: 发送消息返回 Promise，支持 async/await
- ✅ **自动匹配**: 通过 eventId 自动匹配请求和响应
- ✅ **超时处理**: 可配置超时时间，防止无限等待
- ✅ **类型安全**: 完整的 TypeScript 类型支持
- ✅ **状态管理**: 提供 loading 状态和请求计数
- ✅ **错误处理**: 统一的错误处理机制

### Hook 接口定义

```typescript
// 请求接口
interface IframeEventRequest {
  action: string;
  payload?: Record<string, any>;
  timeout?: number; // 毫秒，默认5000
}

// 响应接口
interface IframeEventResponse<T = any> {
  eventId: string;
  success: boolean;
  data?: T;
  error?: string;
}

// Hook 返回值
const {
  sendMessage,      // 发送消息函数
  isLoading,        // 是否有请求在处理中
  pendingCount,     // 待处理请求数量
  clearAllRequests  // 清理所有pending请求
} = useIframeMessage();
```

### 基础用法

```typescript
import { useIframeMessage } from '@/hooks/useIframeMessage';

function ColorPicker() {
  const { sendMessage, isLoading } = useIframeMessage();
  
  const handleGenerateImage = async () => {
    try {
      const response = await sendMessage({
        action: 'generate_image',
        payload: {
          color: '#ff6b6b',
          message: '请求生成图片，颜色: #ff6b6b',
          width: 400,
          height: 300
        },
        timeout: 10000 // 10秒超时
      });
      
      if (response.success) {
        console.log('收到图片URL:', response.data.imageUrl);
      } else {
        console.error('失败:', response.error);
      }
    } catch (error) {
      console.error('请求超时或发送失败:', error);
    }
  };
  
  return (
    <button onClick={handleGenerateImage} disabled={isLoading}>
      {isLoading ? '生成中...' : '生成图片'}
    </button>
  );
}
```

### 类型安全的用法

```typescript
// 定义响应数据类型
interface GenerationImageResponse {
  imageUrl: string;
  color: string;
  width: number;
  height: number;
  generatedAt: string;
}

const response = await sendMessage<GenerationImageResponse>({
  action: 'generate_image',
  payload: { 
    color: '#ff6b6b',
    width: 400,
    height: 300
  }
});

// response.data 现在有完整的类型提示
if (response.success && response.data) {
  const imageUrl: string = response.data.imageUrl; // 类型安全
}
```

### 完整的组件示例

```tsx
"use client";

import React, { useState } from 'react';
import { useIframeMessage, type IframeEventResponse } from '@/hooks/useIframeMessage';

interface GenerationImageResponse {
  imageUrl: string;
  color: string;
  width: number;
  height: number;
  generatedAt: string;
}

export function ColorMessenger() {
  const { sendMessage, isLoading, pendingCount } = useIframeMessage();
  const [imageUrl, setImageUrl] = useState<string>('');
  const [error, setError] = useState<string>('');

  const handleGenerateImage = async () => {
    setError('');
    setImageUrl('');

    try {
      const response: IframeEventResponse<GenerationImageResponse> = await sendMessage({
        action: 'generate_image',
        payload: {
          color: '#ff6b6b',
          message: '请求生成图片，颜色: #ff6b6b',
          width: 400,
          height: 300,
        },
        timeout: 10000,
      });

      if (response.success && response.data) {
        setImageUrl(response.data.imageUrl);
      } else {
        setError(response.error || '生成图片失败');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '发送消息失败');
    }
  };

  return (
    <div>
      <button onClick={handleGenerateImage} disabled={isLoading}>
        {isLoading ? '生成中...' : '生成图片'}
      </button>
      
      {error && <div>错误: {error}</div>}
      {imageUrl && <img src={imageUrl} alt="Generated" />}
      {pendingCount > 0 && <div>待处理: {pendingCount}</div>}
    </div>
  );
}
```

## 安全注意事项

**避免使用通配符**: 生产环境中避免使用 `"*"` 作为 targetOrigin
```javascript
// 开发环境
window.parent.postMessage(eventData, "*");

// 生产环境
window.parent.postMessage(eventData, "https://parent-domain.com");
```

## 使用指南

### 方法一：直接发送

```javascript
// 按钮点击事件处理
function handleButtonClick() {
  const eventData = {
    type: "IFRAME_EVENT",
    action: "button_clicked",
    eventId: crypto.randomUUID(), // 生成唯一标识符
    timestamp: new Date().toISOString(),
    payload: {
      message: "用户点击了按钮",
    },
  };

  window.parent.postMessage(eventData, "*");
}

// 在 HTML 中绑定
// <button onclick="handleButtonClick()">点击发送消息</button>
```

### 方法二：封装发送函数（推荐）

```javascript
/**
 * 发送 iframe 事件到父窗口
 * @param {string} action - 动作类型
 * @param {string} message - 消息内容
 * @returns {boolean} 发送成功返回 true
 */
function sendIframeEvent(action, message = '') {
  try {
    const eventData = {
      type: "IFRAME_EVENT",
      action: action,
      eventId: crypto.randomUUID(), // 生成唯一标识符
      timestamp: new Date().toISOString(),
      payload: {
        message: message || `${action} event triggered`,
      },
    };

    window.parent.postMessage(eventData, "*");
    console.log("Event sent to parent:", eventData);
    
    return true;
  } catch (error) {
    console.error("Failed to send event:", error);
    return false;
  }
}

// 使用示例
sendIframeEvent('button_clicked', '用户点击了保存按钮');
sendIframeEvent('user_login', '用户登录成功');
sendIframeEvent('form_submitted', '表单提交完成');
```

## 发送方式选择指南

根据是否需要等待父窗口响应，可以选择不同的发送方式：

### 🔄 需要等待响应时 - 使用 Hook（推荐）

当你的操作需要等待父窗口处理并返回结果时（如生成图片、获取数据、验证信息等），**必须使用 `useIframeMessage` Hook**：

```tsx
// ✅ 推荐：需要响应时使用 Hook
const { sendMessage, isLoading } = useIframeMessage();

const handleGenerateImage = async () => {
  try {
    // 等待父窗口处理并返回图片URL
    const response = await sendMessage({
      action: 'generate_image',
      payload: { color: '#ff6b6b' }
    });
    
    if (response.success) {
      setImageUrl(response.data.imageUrl);
    }
  } catch (error) {
    console.error('请求失败:', error);
  }
};
```

**适用场景**：
- 🖼️ 图片生成、文件上传
- 📊 数据获取、API调用
- ✅ 表单验证、权限检查
- 💾 保存操作的确认
- 🔍 搜索结果获取

### 🚀 不需要响应时 - 使用简单方式或Hook

当你只需要通知父窗口某个事件发生，不需要等待响应时，可以选择：

#### 方式1：简单直接发送（轻量）
```javascript
// ✅ 简单：仅通知，不等待响应
function notifyParent(action, data) {
  const eventData = {
    type: "IFRAME_EVENT",
    action: action,
    eventId: crypto.randomUUID(),
    timestamp: new Date().toISOString(),
    payload: {
      message: `${action} event triggered`,
      ...data
    }
  };
  
  window.parent.postMessage(eventData, "*");
}

// 使用示例
notifyParent('button_clicked', { buttonId: 'save-btn' });
notifyParent('user_logout', { userId: '12345' });
notifyParent('page_viewed', { pageId: 'settings' });
```

#### 方式2：使用Hook（推荐，统一接口）
```tsx
// ✅ 推荐：使用Hook，但不等待响应
const { sendMessage } = useIframeMessage();

const notifyParent = (action: string, data: any) => {
  // 发送但不等待响应
  sendMessage({ action, payload: data }).catch(console.error);
};

// 使用示例
notifyParent('button_clicked', { buttonId: 'save-btn' });
```

**适用场景**：
- 🎯 用户行为追踪
- 📝 日志记录
- 🔔 状态通知
- ⚡ 事件广播
- 📊 埋点统计

### 📋 选择建议

| 场景 | 推荐方式 | 原因 |
|------|----------|------|
| **需要响应** | Hook (await) | 必须等待结果，需要错误处理 |
| **不需要响应** | Hook (不await) | 统一接口，更好的类型安全 |
| **性能敏感** | 简单方式 | 更轻量，减少Hook开销 |
| **复杂应用** | Hook | 统一管理，更好的状态追踪 |

### 💡 最佳实践

```tsx
// ✅ 推荐：统一使用Hook，根据需要决定是否等待
const { sendMessage } = useIframeMessage();

// 需要响应的操作
const handleUpload = async () => {
  try {
    const result = await sendMessage({
      action: 'upload_file',
      payload: { file: fileData }
    });
    console.log('上传成功:', result.data);
  } catch (error) {
    console.error('上传失败:', error);
  }
};

// 不需要响应的操作
const trackEvent = (eventName: string, data: any) => {
  sendMessage({
    action: 'track_event',
    payload: { event: eventName, ...data }
  }).catch(console.error); // 可选：捕获错误但不等待
};
```

## 最佳实践

### 1. 安全性最佳实践

```javascript
// ✅ 推荐：验证消息来源
window.addEventListener('message', (event) => {
  const allowedOrigins = [
    'https://your-domain.com',
    'https://sub.your-domain.com'
  ];
  
  if (!allowedOrigins.includes(event.origin)) {
    console.warn('拒绝来自未授权来源的消息:', event.origin);
    return;
  }
  // 处理消息...
});

// ❌ 不推荐：接受所有来源的消息
window.addEventListener('message', (event) => {
  // 直接处理，没有来源验证
});
```

### 2. 错误处理最佳实践

```typescript
// ✅ 推荐：完整的错误处理
const handleRequest = async () => {
  try {
    const response = await sendMessage({
      action: 'generate_image',
      payload: { color: '#ff6b6b' },
      timeout: 10000
    });

    if (response.success) {
      // 处理成功响应
      setImageUrl(response.data.imageUrl);
    } else {
      // 处理业务错误
      setError(`操作失败: ${response.error}`);
    }
  } catch (error) {
    // 处理网络错误、超时等
    if (error.message.includes('超时')) {
      setError('请求超时，请重试');
    } else {
      setError('网络错误，请检查连接');
    }
  }
};
```

### 3. 性能优化最佳实践

```typescript
// ✅ 推荐：使用 useCallback 优化性能
const { sendMessage, isLoading } = useIframeMessage();

const handleGenerateImage = useCallback(async (color: string) => {
  if (isLoading) return; // 防止重复请求
  
  try {
    const response = await sendMessage({
      action: 'generate_image',
      payload: { color },
      timeout: 15000 // 适当的超时时间
    });
    
    // 处理响应...
  } catch (error) {
    // 错误处理...
  }
}, [sendMessage, isLoading]);

// ✅ 推荐：清理资源
useEffect(() => {
  return () => {
    // 组件卸载时清理所有待处理的请求
    clearAllRequests();
  };
}, [clearAllRequests]);
```

### 4. 调试和监控最佳实践

```typescript
// ✅ 推荐：添加详细的日志
const { sendMessage } = useIframeMessage();

const handleRequest = async () => {
  const startTime = Date.now();
  
  try {
    console.log('🚀 开始发送请求:', { action: 'generate_image', color: '#ff6b6b' });
    
    const response = await sendMessage({
      action: 'generate_image',
      payload: { color: '#ff6b6b' },
      timeout: 10000
    });
    
    const endTime = Date.now();
    console.log(`✅ 请求完成，耗时: ${endTime - startTime}ms`, response);
    
  } catch (error) {
    const endTime = Date.now();
    console.error(`❌ 请求失败，耗时: ${endTime - startTime}ms`, error);
  }
};
```

### 5. 类型安全最佳实践

```typescript
// ✅ 推荐：定义明确的类型接口
interface ImageGenerationRequest {
  color: string;
  width?: number;
  height?: number;
  format?: 'png' | 'jpg' | 'webp';
}

interface ImageGenerationResponse {
  imageUrl: string;
  color: string;
  width: number;
  height: number;
  format: string;
  generatedAt: string;
}

// 使用类型化的请求
const response = await sendMessage<ImageGenerationResponse>({
  action: 'generate_image',
  payload: {
    color: '#ff6b6b',
    width: 800,
    height: 600,
    format: 'png'
  } as ImageGenerationRequest
});
```

## 完整示例项目

### iframe 内容页面 (iframe.html)
```html
<!DOCTYPE html>
<html>
<head>
    <title>Iframe Content</title>
</head>
<body>
    <h1>Iframe 内容页面</h1>
    
    <button onclick="sendButtonClick()">发送按钮点击</button>
    <button onclick="sendLogin()">发送登录事件</button>
    <button onclick="sendTime()">发送当前时间</button>
    
    <input type="text" id="customMessage" placeholder="输入自定义消息">
    <button onclick="sendCustomMessage()">发送自定义消息</button>

    <script>
        // 发送消息的通用函数
        function sendIframeEvent(action, message = '') {
            try {
                const eventData = {
                    type: "IFRAME_EVENT",
                    action: action,
                    eventId: crypto.randomUUID(),
                    timestamp: new Date().toISOString(),
                    payload: {
                        message: message || `${action} event triggered`,
                    },
                };

                window.parent.postMessage(eventData, "*");
                console.log("Event sent:", eventData);
            } catch (error) {
                console.error("发送失败:", error);
            }
        }

        function sendButtonClick() {
            sendIframeEvent('button_clicked', '用户点击了按钮');
        }

        function sendLogin() {
            sendIframeEvent('user_login', '用户已成功登录');
        }

        function sendTime() {
            const now = new Date();
            const timeStr = now.toLocaleString('zh-CN');
            sendIframeEvent('send_current_time', `当前时间: ${timeStr}`);
        }

        function sendCustomMessage() {
            const input = document.getElementById('customMessage');
            const message = input.value.trim();
            if (message) {
                sendIframeEvent('button_clicked', message);
                input.value = '';
            }
        }
    </script>
</body>
</html>
```


## Hook 实现源码

### useIframeMessage.ts
```typescript
import { useCallback, useRef, useEffect, useState } from "react";

// 请求接口
export interface IframeEventRequest {
  action: string;
  payload?: Record<string, any>;
  timeout?: number; // 毫秒，默认5000
}

// 响应接口
export interface IframeEventResponse<T = any> {
  eventId: string;
  success: boolean;
  data?: T;
  error?: string;
}

// Promise 存储结构
interface PendingPromise {
  resolve: (value: IframeEventResponse) => void;
  reject: (reason: any) => void;
  timer: NodeJS.Timeout;
}

export function useIframeMessage() {
  const [isLoading, setIsLoading] = useState(false);
  const pendingPromisesRef = useRef<Map<string, PendingPromise>>(new Map());
  const activeRequestsRef = useRef<Set<string>>(new Set());

  // 监听父窗口响应
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      // 检查消息类型是否为响应
      if (event.data?.type === "IFRAME_EVENT_RESPONSE") {
        const { eventId, success, data, error } = event.data;

        const pendingPromise = pendingPromisesRef.current.get(eventId);
        if (pendingPromise) {
          // 清理定时器和Promise存储
          clearTimeout(pendingPromise.timer);
          pendingPromisesRef.current.delete(eventId);
          activeRequestsRef.current.delete(eventId);

          // 更新loading状态
          if (activeRequestsRef.current.size === 0) {
            setIsLoading(false);
          }

          // 解析Promise
          if (success) {
            pendingPromise.resolve({ eventId, success, data });
          } else {
            pendingPromise.resolve({ eventId, success: false, error });
          }
        }
      }
    };

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, []);

  // 发送消息的核心函数
  const sendMessage = useCallback(
    <T = any>(request: IframeEventRequest): Promise<IframeEventResponse<T>> => {
      return new Promise((resolve, reject) => {
        // 生成唯一事件ID
        const eventId = crypto.randomUUID();
        const timeout = request.timeout || 5000;

        // 构建标准格式消息
        const eventData = {
          type: "IFRAME_EVENT",
          action: request.action,
          eventId,
          timestamp: new Date().toISOString(),
          payload: {
            message: `${request.action} event triggered`,
            ...request.payload,
          },
        };

        // 设置超时定时器
        const timer = setTimeout(() => {
          pendingPromisesRef.current.delete(eventId);
          activeRequestsRef.current.delete(eventId);

          if (activeRequestsRef.current.size === 0) {
            setIsLoading(false);
          }

          reject(new Error(`请求超时: ${request.action} (${timeout}ms)`));
        }, timeout);

        // 存储Promise相关信息
        pendingPromisesRef.current.set(eventId, { resolve, reject, timer });
        activeRequestsRef.current.add(eventId);

        // 更新loading状态
        setIsLoading(true);

        try {
          // 发送消息到父窗口
          window.parent.postMessage(eventData, "*");
          console.log("🚀 发送事件到父窗口:", eventData);
        } catch (error) {
          // 发送失败时清理
          clearTimeout(timer);
          pendingPromisesRef.current.delete(eventId);
          activeRequestsRef.current.delete(eventId);

          if (activeRequestsRef.current.size === 0) {
            setIsLoading(false);
          }

          reject(error);
        }
      });
    },
    [],
  );

  // 清理所有pending的请求
  const clearAllRequests = useCallback(() => {
    pendingPromisesRef.current.forEach(({ timer, reject }) => {
      clearTimeout(timer);
      reject(new Error("请求被取消"));
    });
    pendingPromisesRef.current.clear();
    activeRequestsRef.current.clear();
    setIsLoading(false);
  }, []);

  return {
    sendMessage,
    isLoading,
    pendingCount: activeRequestsRef.current.size,
    clearAllRequests,
  };
}

// 便捷的类型化发送函数
export function createTypedSender<
  TRequest extends Record<string, any>,
  TResponse = any,
>(action: string) {
  return (useIframeMessage: ReturnType<typeof useIframeMessage>) => {
    return (
      payload: TRequest,
      timeout?: number,
    ): Promise<IframeEventResponse<TResponse>> => {
      return useIframeMessage.sendMessage({ action, payload, timeout });
    };
  };
}
```

### ColorMessenger.tsx
```tsx
"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2 } from "lucide-react";
import {
  useIframeMessage,
  type IframeEventResponse,
} from "@/hooks/useIframeMessage";

// 定义图片生成响应类型
interface ImageGenerationResponse {
  imageUrl: string;
  color: string;
  width: number;
  height: number;
  generatedAt: string;
}

export function ColorMessenger() {
  const { sendMessage, isLoading, pendingCount } = useIframeMessage();
  const [imageUrl, setImageUrl] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [lastColor, setLastColor] = useState<string>("");

  // 固定的测试颜色
  const testColor = "#ff6b6b";

  const handleGenerateImage = async () => {
    setError("");
    setImageUrl("");
    setLastColor(testColor);

    try {
      // 发送图片生成事件，等待父窗口响应
      const response: IframeEventResponse<ImageGenerationResponse> = await sendMessage({
        action: "generate_image",
        payload: {
          color: testColor,
          message: `请求生成图片，颜色: ${testColor}`,
          width: 400,
          height: 300,
          timestamp: new Date().toISOString(),
        },
        timeout: 10000, // 10秒超时
      });

      console.log("📨 收到父窗口响应:", response);

      if (response.success && response.data) {
        setImageUrl(response.data.imageUrl);
        console.log("🎨 设置图片URL:", response.data.imageUrl);
      } else {
        setError(response.error || "生成图片失败");
      }
    } catch (err) {
      console.error("❌ 发送图片生成请求失败:", err);
      setError(err instanceof Error ? err.message : "发送消息失败");
    }
  };

  return (
    <div className="max-w-md mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-center">图片生成器</CardTitle>
          <p className="text-sm text-muted-foreground text-center">
            iframe ↔ 父窗口通信演示
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* 颜色显示 */}
          <div className="flex items-center justify-center gap-2">
            <div
              className="w-8 h-8 rounded border-2 border-gray-300"
              style={{ backgroundColor: testColor }}
            />
            <Badge variant="secondary">{testColor}</Badge>
          </div>

          {/* 发送按钮 */}
          <Button
            onClick={handleGenerateImage}
            disabled={isLoading}
            className="w-full"
            size="lg"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                等待父窗口响应...
              </>
            ) : (
              "生成图片"
            )}
          </Button>

          {/* 状态信息 */}
          {pendingCount > 0 && (
            <div className="text-center text-sm text-muted-foreground">
              待处理请求: {pendingCount}
            </div>
          )}

          {/* 错误显示 */}
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
              ❌ {error}
            </div>
          )}

          {/* 生成的图片显示 */}
          {imageUrl && (
            <div className="space-y-2">
              <p className="text-sm font-medium text-center">生成的图片:</p>
              <div className="border rounded-lg overflow-hidden">
                <img
                  src={imageUrl}
                  alt={`Generated image for color ${lastColor}`}
                  className="w-full h-48 object-cover"
                  onLoad={() => console.log("🖼️ 图片加载完成")}
                  onError={() => {
                    console.error("❌ 图片加载失败");
                    setError("图片加载失败");
                  }}
                />
              </div>
              <p className="text-xs text-muted-foreground text-center">
                基于颜色 {lastColor} 生成
              </p>
            </div>
          )}

          {/* 调试信息 */}
          <details className="text-xs text-muted-foreground">
            <summary className="cursor-pointer hover:text-foreground">
              调试信息
            </summary>
            <div className="mt-2 p-2 bg-gray-50 rounded font-mono">
              <div>Loading: {isLoading.toString()}</div>
              <div>Pending: {pendingCount}</div>
              <div>Last Color: {lastColor || "none"}</div>
              <div>Image URL: {imageUrl || "none"}</div>
              <div>Error: {error || "none"}</div>
            </div>
          </details>
        </CardContent>
      </Card>
    </div>
  );
}
```

## 技术要点总结

### 1. **事件匹配机制**
- 使用 `crypto.randomUUID()` 生成唯一的 `eventId`
- 父窗口响应必须包含相同的 `eventId` 用于匹配
- Hook 内部维护 `Map<eventId, Promise>` 实现异步响应

### 2. **超时处理**
- 每个请求都有独立的超时定时器
- 超时后自动清理资源，避免内存泄漏
- 支持自定义超时时间（默认 5 秒）

### 3. **状态管理**
- `isLoading`: 是否有请求在处理中
- `pendingCount`: 当前待处理请求数量
- 支持多个并发请求，独立状态管理

### 4. **类型安全**
- 完整的 TypeScript 类型定义
- 泛型支持，可指定具体的响应数据类型
- 编译时类型检查和运行时类型安全

### 5. **错误处理**
- 网络错误、超时错误、业务逻辑错误分离处理
- 统一的错误响应格式
- 自动资源清理，防止内存泄漏

## 版本历史

- v1.0 (2025-01-09): 初始版本，定义统一的 IFRAME_EVENT 格式
- v1.1 (2025-01-09): 更新 generate_image 动作类型，完善 Hook 实现和文档