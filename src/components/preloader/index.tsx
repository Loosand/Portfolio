"use client";

import {
  useState,
  useEffect,
  createContext,
  ReactNode,
  useContext,
  useRef,
} from "react";
import { AnimatePresence } from "framer-motion";
import Loader from "./loader";
import gsap from "gsap";

/**
 * Preloader 上下文类型定义
 * @type PreloaderContextType
 * @property isLoading - 是否正在加载中
 * @property loadingPercent - 加载进度百分比
 * @property bypassLoading - 跳过加载动画的函数
 */
type PreloaderContextType = {
  isLoading: boolean;
  loadingPercent: number;
  bypassLoading: () => void;
};

/**
 * Preloader 上下文的初始值
 */
const INITIAL: PreloaderContextType = {
  isLoading: true,
  loadingPercent: 0,
  bypassLoading: () => {},
};

/**
 * 创建 Preloader 上下文
 */
export const preloaderContext = createContext<PreloaderContextType>(INITIAL);

/**
 * Preloader 组件的属性类型定义
 */
type PreloaderProps = {
  children: ReactNode;
  disabled?: boolean;
};

/**
 * 自定义 Hook，用于在组件中获取 Preloader 上下文
 * @throws 如果在 PreloaderProvider 外部使用会抛出错误
 */
export const usePreloader = () => {
  const context = useContext(preloaderContext);
  if (!context) {
    throw new Error("usePreloader must be used within a PreloaderProvider");
  }
  return context;
};

/**
 * 加载动画的持续时间（秒）
 */
const LOADING_TIME = 2.5;

/**
 * @keyword 加载动画
 * Preloader 组件
 * 实现网站的预加载动画效果
 * 
 * @component
 * @param {PreloaderProps} props - 组件属性
 * @param {ReactNode} props.children - 子组件
 * @param {boolean} [props.disabled] - 是否禁用预加载动画
 * 
 * @description
 * 该组件使用 GSAP 实现平滑的加载动画效果
 * 通过 Context API 向子组件提供加载状态
 * 支持手动跳过加载动画
 */
function Preloader({ children }: PreloaderProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [loadingPercent, setLoadingPercent] = useState(0);
  const loadingTween = useRef<gsap.core.Tween>();
  const loadingPercentRef = useRef<{ value: number }>({ value: 0 });

  /**
   * 跳过加载动画
   * 立即将进度设置为 100% 并结束加载状态
   */
  const bypassLoading = () => {
    loadingTween.current?.progress(0.99).kill();
    setLoadingPercent(100);
    setIsLoading(false);
  };
  
  /**
   * 初始化加载动画
   * 使用 GSAP 创建平滑的进度动画
   */
  useEffect(() => {
    loadingTween.current = gsap.to(loadingPercentRef.current, {
      value: 100,
      duration: LOADING_TIME,
      ease: "slow(0.7,0.7,false)",
      onUpdate: () => {
        setLoadingPercent(loadingPercentRef.current.value);
      },
      onComplete: () => {
        setIsLoading(false);
      },
    });
  }, []);

  return (
    <preloaderContext.Provider
      value={{ isLoading, bypassLoading, loadingPercent }}
    >
      <AnimatePresence mode="wait">{isLoading && <Loader />}</AnimatePresence>
      {children}
    </preloaderContext.Provider>
  );
}

export default Preloader;
