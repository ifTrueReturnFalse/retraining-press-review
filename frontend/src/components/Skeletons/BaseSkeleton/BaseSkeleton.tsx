import { ComponentPropsWithoutRef } from "react";

export default function BaseSkeleton({
  className,
  ...props
}: ComponentPropsWithoutRef<"div">) {
  return <div className={`skeleton-shimmer ${className}`} {...props} />;
}
