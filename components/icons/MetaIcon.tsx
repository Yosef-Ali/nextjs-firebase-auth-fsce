import Image from 'next/image';

interface MetaIconProps {
  className?: string;
}

const MetaIcon: React.FC<MetaIconProps> = ({ className = "h-5 w-5" }) => {
  return (
    <Image
      src="/images/meta-logo-facebook.svg"
      alt="Meta Logo"
      width={20}
      height={20}
      className={className}
    />
  );
};

export default MetaIcon;
