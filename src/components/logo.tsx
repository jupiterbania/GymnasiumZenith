import Link from "next/link";
import { Dumbbell } from "lucide-react";

const Logo = () => {
  return (
    <Link href="/" className="flex items-center gap-2">
      <Dumbbell className="h-6 w-6 text-primary" />
      <span className="font-headline text-xl font-bold text-primary">
        Gymnasium Zenith
      </span>
    </Link>
  );
};

export default Logo;
