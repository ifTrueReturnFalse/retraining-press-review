import classNames from "classnames";
import styles from "./IconButton.module.css";
import { ComponentPropsWithoutRef } from "react";

export enum IconColoringMethod {
  Stroke,
  Fill,
}

interface IconButtonProps extends ComponentPropsWithoutRef<"button"> {
  icon: React.ReactNode;
  label: string;
  isSelected: boolean;
  coloringMethod: IconColoringMethod;
}

export default function IconButton({
  icon,
  label,
  isSelected,
  coloringMethod,
  ...props
}: IconButtonProps) {
  const iconClass = classNames({
    [styles.stroke]: coloringMethod === IconColoringMethod.Stroke,
    [styles.fill]: coloringMethod === IconColoringMethod.Fill,
  });

  return (
    <button
      className={classNames(styles.button, { [styles.selected]: isSelected })}
      type="button"
      {...props}
    >
      <span className={iconClass}>{icon}</span>
      <span>{label}</span>
    </button>
  );
}
