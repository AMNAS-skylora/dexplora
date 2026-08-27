import Image from "next/image";

interface BrandLogoProps {
  className?: string;
  imageClassName?: string;
  priority?: boolean;
  variant?: "header" | "footer" | "admin";
}

export function BrandLogo({
  className = "",
  imageClassName = "",
  priority = false,
  variant = "header",
}: BrandLogoProps) {
  let sizeClasses = "h-[clamp(32px,8vw,44px)] max-w-[clamp(130px,38vw,160px)] sm:max-w-[170px] lg:max-w-[180px]";
  let logoSrc = "/images/logo/logoblack.png";

  if (variant === "footer" || variant === "admin") {
    sizeClasses = variant === "footer" ? "h-[clamp(38px,6vw,50px)] max-w-[200px]" : "h-[32px] max-w-[140px]";
    logoSrc = "/images/logo/logowhite.png";
  }

  return (
    <div className={`inline-flex items-center shrink-0 min-w-0 group hover:opacity-92 transition-opacity ${className}`}>
      <Image
        src={logoSrc}
        alt="Dexplora Tour Planners"
        width={180}
        height={44}
        priority={priority}
        className={`w-auto object-contain shrink-0 block ${sizeClasses} ${imageClassName}`}
      />
    </div>
  );
}
