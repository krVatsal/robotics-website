import { SVGProps } from "react";

export function AvatarFallback(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 200 200"
      fill="none"
      {...props}
    >
      <circle cx="100" cy="100" r="100" fill="#f3f4f6" />
      <circle cx="100" cy="85" r="30" fill="#d1d5db" />
      <path
        d="M160 155a60 60 0 00-120 0"
        stroke="#d1d5db"
        strokeWidth="12"
        strokeLinecap="round"
      />
    </svg>
  );
}
