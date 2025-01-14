/**
 * RemoteCursors 组件 - 实时显示其他用户的鼠标光标位置
 * 功能：
 * 1. 实时追踪并显示其他用户的鼠标位置
 * 2. 显示用户的位置信息和发送的消息
 * 3. 支持动画效果和悬停交互
 */
"use client";
import { SocketContext, User, UserMap } from "@/contexts/socketio";
import { useMouse } from "@/hooks/use-mouse";
import { useThrottle } from "@/hooks/use-throttle";
import { MousePointer2 } from "lucide-react";
import React, { useContext, useEffect, useRef, useState } from "react";

import { AnimatePresence, motion, useAnimation } from "framer-motion";
import { useMediaQuery } from "@/hooks/use-media-query";

// TODO: 添加点击动画效果
// TODO: 监听socket断开连接事件
const RemoteCursors = () => {
  // 从SocketContext获取socket实例和用户信息
  const { socket, users: _users, setUsers } = useContext(SocketContext);
  // 检测是否为移动设备
  const isMobile = useMediaQuery("(max-width: 768px)");
  // 获取当前用户的鼠标位置
  const { x, y } = useMouse({ allowPage: true });

  useEffect(() => {
    if (typeof window === "undefined" || !socket || isMobile) return;

    // 监听其他用户光标位置变化
    socket.on("cursor-changed", (data) => {
      setUsers((prev: UserMap) => {
        const newMap = new Map(prev);
        if (!prev.has(data.socketId)) {
          // 新用户加入
          newMap.set(data.socketId, {
            ...data,
          });
        } else {
          // 更新现有用户信息
          newMap.set(data.socketId, { ...prev.get(data.socketId), ...data });
        }
        return newMap;
      });
    });

    // 监听用户列表更新
    socket.on("users-updated", (data: User[]) => {
      const newMap = new Map();
      data.forEach((user) => {
        newMap.set(user.socketId, { ...user });
      });
      setUsers(newMap);
    });

    return () => {
      socket.off("cursor-changed");
    };
  }, [socket, isMobile]);

  // 节流处理鼠标移动事件，200ms发送一次位置更新
  const handleMouseMove = useThrottle((x, y) => {
    socket?.emit("cursor-change", {
      pos: { x, y },
      socketId: socket.id,
    });
  }, 200);

  // 当鼠标位置改变时，发送位置更新
  useEffect(() => {
    if (isMobile) return;
    handleMouseMove(x, y);
  }, [x, y, isMobile]);

  const users = Array.from(_users.values());
  return (
    <div className="h-0 z-10 relative">
      {users
        .filter((user) => user.socketId !== socket?.id)
        .map((user) => (
          <Cursor
            key={user.socketId}
            x={user.pos.x}
            y={user.pos.y}
            color={user.color}
            socketId={user.socketId}
            headerText={`${user.location} ${user.flag}`}
          />
        ))}
    </div>
  );
};

/**
 * Cursor 组件 - 显示单个用户的光标
 * @param x - 光标X坐标
 * @param y - 光标Y坐标
 * @param color - 光标颜色
 * @param headerText - 显示的用户信息
 * @param socketId - 用户的socket ID
 */
const Cursor = ({
  color,
  x,
  y,
  headerText,
  socketId,
}: {
  x: number;
  y: number;
  color?: string;
  headerText: string;
  socketId: string;
}) => {
  // 控制信息提示框的显示状态
  const [showText, setShowText] = useState(false);
  // 存储用户发送的消息文本
  const [msgText, setMsgText] = useState("");
  const { msgs } = useContext(SocketContext);

  // 处理光标移动时的信息提示框显示逻辑
  useEffect(() => {
    setShowText(true);
    // 3秒后自动隐藏提示框
    const fadeOutTimeout = setTimeout(() => {
      setShowText(false);
    }, 3000);

    return () => {
      clearTimeout(fadeOutTimeout);
    };
  }, [x, y, msgText]);

  // 处理新消息显示逻辑
  useEffect(() => {
    if (msgs.at(-1)?.socketId === socketId) {
      // 获取最新消息，如果超过30个字符则截断
      const lastMsgContent = msgs.at(-1)?.content || "";
      const textSlice =
        lastMsgContent.slice(0, 30) + (lastMsgContent.length > 30 ? "..." : "");
      // 根据消息长度计算显示时间，最短1秒，最长4秒
      const timeToRead = Math.min(4000, Math.max(textSlice.length * 100, 1000));
      setMsgText(textSlice);

      // 设置定时器清除消息
      const t = setTimeout(() => {
        setMsgText("");
        clearTimeout(t);
      }, timeToRead);
    }
  }, [msgs]);

  return (
    <motion.div
      // 光标位置动画
      animate={{
        x: x,
        y: y,
      }}
      className="w-6 h-6"
      transition={{
        duration: 0.2,
        ease: "easeOut",
      }}
      onMouseEnter={() => setShowText(true)}
      onMouseLeave={() => setShowText(false)}
    >
      {/* 光标图标 */}
      <MousePointer2
        className="w-6 h-6 z-[9999999]"
        style={{ color: color }}
        strokeWidth={7.2}
      />
      {/* 信息提示框动画 */}
      <AnimatePresence>
        {showText && headerText && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: -7 }}
            exit={{ opacity: 0, y: -20 }}
            className="text-xs rounded-xl w-fit p-2 px-4 ml-4 cursor-can-hover cursor-can-hover cursor-can-hover cursor-can-hover"
            style={{
              backgroundColor: color + "f0",
            }}
          >
            {/* 显示用户位置信息 */}
            <div className="text-nowrap">{headerText}</div>
            {/* 显示用户发送的消息 */}
            {msgText && <div className="font-mono w-44">{msgText}</div>}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default RemoteCursors;
