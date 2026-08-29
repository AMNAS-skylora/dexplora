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
  let sizeClasses = "w-[130px] sm:w-[155px] lg:w-[170px] max-w-[170px] h-auto max-h-[42px] object-contain object-left";
  let logoSrc = "/images/logo/logoblack.png";

  if (variant === "footer") {
    sizeClasses = "w-[130px] sm:w-[155px] max-w-[160px] h-auto max-h-[46px] object-contain object-left";
    logoSrc = "/images/logo/logowhite.png";
  } else if (variant === "admin") {
    sizeClasses = "w-[170px] max-w-[180px] h-auto max-h-[54px] object-contain object-left";
    logoSrc = "/images/logo/logowhite.png";
  } else if (variant === "admin_mobile") {
    sizeClasses = "w-[130px] max-w-[140px] h-auto max-h-[38px] object-contain object-left";
    logoSrc = "/images/logo/logoblack.png";
  }

  const isAboveFold = priority || variant === "header" || variant === "admin" || variant === "admin_mobile";

  return (
    <div className={`inline-flex items-center shrink-0 min-w-0 group hover:opacity-92 transition-opacity ${className}`}>
      <Image
        src={logoSrc}
        alt="Dexplora Tour Planners"
        width={170}
        height={44}
        priority={isAboveFold}
        loading={isAboveFold ? "eager" : "lazy"}
        className={`w-auto object-contain shrink-0 block ${sizeClasses} ${imageClassName}`}
      />
    </div>
  );
}
