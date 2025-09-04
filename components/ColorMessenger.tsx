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
interface GenerationImageResponse {
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

  const handleColorSelect = async () => {
    setError("");
    setImageUrl("");
    setLastColor(testColor);

    try {
      // 发送图片生成事件，等待父窗口响应
      const response: IframeEventResponse<GenerationImageResponse> =
        await sendMessage({
          action: "generate_image",
          payload: {
            color: testColor,
            message: `请求生成图片，颜色: ${testColor}`,
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
            onClick={handleColorSelect}
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
