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

        // 构建标准格式消息（按照您的文档格式）
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
