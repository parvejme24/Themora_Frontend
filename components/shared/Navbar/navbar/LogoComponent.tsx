import Link from "next/link";
import { motion } from "framer-motion";
import ThemoraLogo from "@/components/shared/Logo/ThemoraLogo";

export const LogoComponent = () => (
  <motion.div
    initial={{ opacity: 0, x: -20 }}
    animate={{ opacity: 1, x: 0 }}
    transition={{ duration: 0.5 }}
    className="flex items-center"
  >
    <Link href="/" aria-label="Themora home" className="group flex items-center">
      <ThemoraLogo
        size={34}
        className="transition-transform duration-300 group-hover:scale-[1.03]"
      />
    </Link>
  </motion.div>
);
