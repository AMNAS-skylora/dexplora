import Image from "next/image";

interface BrandLogoProps {
  className?: string;
  imageClassName?: string;
  priority?: boolean;
  variant?: "header" | "footer" | "admin" | "admin_mobile";
}

export function BrandLogo({
  className = "",
  imageClassName = "",
  priority = false,
  variant = "header",
}: BrandLogoProps) {
  let logoSrc = "/images/logo/logoblack.png";
  let sizeClasses = "h-[36px] sm:h-[40px] lg:h-[42px] w-auto object-contain object-left";

  if (variant === "footer") {
    sizeClasses = "h-[38px] sm:h-[42px] w-auto object-contain object-left";
    logoSrc = "/images/logo/logowhite.png";
  } else if (variant === "admin") {
    sizeClasses = "h-[42px] sm:h-[48px] w-auto object-contain object-left";
    logoSrc = "/images/logo/logowhite.png";
  } else if (variant === "admin_mobile") {
    sizeClasses = "h-[34px] sm:h-[38px] w-auto object-contain object-left";
    logoSrc = "/images/logo/logoblack.png";
  }

  const isAboveFold = priority || variant === "header" || variant === "admin" || variant === "admin_mobile";

  return (
    <div className={`inline-flex items-center shrink-0 min-w-0 group hover:opacity-95 transition-opacity ${className}`}>
      <Image
        src={logoSrc}
        alt="Dexplora Tour Planners"
        width={170}
        height={44}
        priority={isAboveFold}
        loading={isAboveFold ? "eager" : "lazy"}
        className={`shrink-0 block ${sizeClasses} ${imageClassName}`}
      />
    </div>
  );
}
