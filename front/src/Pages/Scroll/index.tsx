import React, { useState, useEffect } from "react";
import "./index.scss";
function ScrollPage(props: any) {
  const list = new Array(10000).fill("哈哈哈哈");
  // 列表容器的dom
  const container = useRef<any>(null);
  // 开始位置
  const [start, setStart] = useState(0);
  // 视图中的数据
  const [visibleData, setVisibleData] = useState<any[]>([]);
  // 控制偏移量
  const [viewTransfrom, setViewTransfrom] =
    useState<string>("translate3d(0,0,0)");

  const HEIGHT = 20;

  const handleScroll = (e) => {
    const scrollTop = e.currentTarget.scrollTop; // 滚动的距离
    const containerDom = container.current;
    const viewHeight = containerDom?.clientHeight || 500; // 视窗高度
    const start = Math.floor(scrollTop / HEIGHT);
    const end = start + Math.ceil(viewHeight / HEIGHT);
    setVisibleData(list.slice(start, end));
    setStart(start);
    setViewTransfrom(`translate3d(0,${start * HEIGHT}px,0)`);
  };
  useEffect(() => {
    const containerDom = container.current;
    const viewHeight = containerDom?.clientHeight || 500; // 视窗高度
    const visibleCount = Math.ceil(viewHeight / HEIGHT); // 视窗内有几个元素
    const end = start + visibleCount;
    setVisibleData(list.slice(start, end));
  }, []);
  return (
    <div
      className="list"
      ref={container}
      style={{ transform: viewTransfrom }}
      onScroll={(e) => {
        handleScroll(e);
      }}
    >
      {visibleData.map((d, idx) => {
        return (
          <div className="list_item" key={idx}>
            {d}-{idx}
          </div>
        );
      })}
    </div>
  );
}
export default ScrollPage;
