import { DotLottieReact } from "@lottiefiles/dotlottie-react";
import { CSSProperties } from "react";

type LottieLoaderProps = {
  src: string;
  className?: string;
  style?: CSSProperties;
};

export default function LottieLoader({
  src,
  className = "",
  style,
}: LottieLoaderProps) {
  return (
    <DotLottieReact
      src={src}
      loop
      autoplay
      className={className}
      style={style}
    />
  );
}
