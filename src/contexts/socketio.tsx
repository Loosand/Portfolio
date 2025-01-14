"use client";
import React, {
  createContext,
  Dispatch,
  ReactNode,
  SetStateAction,
  useEffect,
  useState,
} from "react";
import { io, Socket } from "socket.io-client";
import { generateRandomCursor } from "../lib/generate-random-cursor"

/**
 * 用户类型定义
 * @property socketId - Socket连接的唯一标识
 * @property name - 用户名称
 * @property color - 用户光标颜色
 * @property pos - 用户光标位置坐标
 * @property location - 用户当前所在页面位置
 * @property flag - 用户国家/地区标识
 */
export type User = {
  socketId: string;
  name: string;
  color: string;
  pos: {
    x: number;
    y: number;
  };
  location: string;
  flag: string;
};

/**
 * 消息类型定义
 * @property socketId - 发送消息的Socket ID
 * @property content - 消息内容
 * @property time - 发送时间
 * @property username - 发送者用户名
 */
export type Message = {
  socketId: string;
  content: string;
  time: Date;
  username: string;
};

/**
 * 用户Map类型，用于存储在线用户信息
 */
export type UserMap = Map<string, User>;

/**
 * Socket上下文类型定义
 * @property socket - Socket.IO客户端实例
 * @property users - 在线用户Map
 * @property setUsers - 更新用户Map的函数
 * @property msgs - 消息历史记录
 */
type SocketContextType = {
  socket: Socket | null;
  users: UserMap;
  setUsers: Dispatch<SetStateAction<UserMap>>;
  msgs: Message[];
};

/**
 * Socket上下文的初始状态
 */
const INITIAL_STATE: SocketContextType = {
  socket: null,
  users: new Map(),
  setUsers: () => {},
  msgs: [],
};

/**
 * 创建Socket上下文
 */
export const SocketContext = createContext<SocketContextType>(INITIAL_STATE);

/**
 * Socket上下文提供者组件
 * 负责:
 * 1. 建立和维护Socket连接
 * 2. 管理用户状态
 * 3. 处理实时消息
 */
const SocketContextProvider = ({ children }: { children: ReactNode }) => {
  /**
   * Socket实例状态
   */
  const [socket, setSocket] = useState<Socket | null>(null);
  /**
   * 在线用户状态
   */
  const [users, setUsers] = useState<UserMap>(new Map());
  /**
   * 消息历史记录状态
   */
  const [msgs, setMsgs] = useState<Message[]>([]);

  /**
   * 初始化Socket连接
   */
  useEffect(() => {
    /**
     * 获取用户名，如果本地存储没有则生成随机名称
     */
    const username =  localStorage.getItem("username") || generateRandomCursor().name
    /**
     * 创建Socket连接
     */
    const socket = io(process.env.NEXT_PUBLIC_WS_URL!, {
      query: { username },
    });
    setSocket(socket);

    /**
     * 监听连接事件
     */
    socket.on("connect", () => {});
    
    /**
     * 监听初始消息列表
     */
    socket.on("msgs-receive-init", (msgs) => {
      setMsgs(msgs);
    });
    
    /**
     * 监听新消息
     */
    socket.on("msg-receive", (msgs) => {
      setMsgs((p) => [...p, msgs]);
    });

    /**
     * 组件卸载时断开Socket连接
     */
    return () => {
      socket.disconnect();
    };
  }, []);

  return (
    <SocketContext.Provider value={{ socket: socket, users, setUsers, msgs }}>
      {children}
    </SocketContext.Provider>
  );
};

export default SocketContextProvider;
