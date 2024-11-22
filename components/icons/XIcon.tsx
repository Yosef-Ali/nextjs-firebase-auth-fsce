import Image from 'next/image';

interface XIconProps {
  className?: string;
}

const XIcon: React.FC<XIconProps> = ({ className = "h-5 w-5" }) => {
  return (
    <Image
      src="/images/x-logo.svg"
      alt="X (Twitter) Logo"
      width={20}
      height={20}
      className={className}
    />
  );
};

export default XIcon;
