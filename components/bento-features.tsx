import { BentoCard, BentoGrid } from "@/components/magicui/bento-grid";
import Image from "next/image";
import {
  BellIcon,
  CalendarIcon,
  FileTextIcon,
  GlobeIcon,
  InputIcon,
  Share1Icon,
  CopyIcon,
  BookmarkIcon
} from "@radix-ui/react-icons";

const features = [
  {
    Icon: CopyIcon,
    name: "Hire Top Talent",
    description: "Browse and hire from thousands of vetted freelancers.",
    href: "/login",
    cta: "Learn more",
    background: <Image src="" alt="" width={200} height={200} className="absolute -right-20 -top-20 opacity-60" />,
    className: "lg:row-start-1 lg:row-end-4 lg:col-start-2 lg:col-end-3",
  },
  {
    Icon: InputIcon,
    name: "Find Templates",
    description: "Explore premium templates for your next project.",
    href: "/login",
    cta: "Learn more",
    background: <Image src="" alt="" width={200} height={200} className="absolute -right-20 -top-20 opacity-60" />,
    className: "lg:col-start-1 lg:col-end-2 lg:row-start-1 lg:row-end-3",
  },
  {
    Icon: GlobeIcon,
    name: "Build Projects",
    description: "Manage your projects and collaborate with teams seamlessly.",
    href: "/login",
    cta: "Learn more",
    background: <Image src="" alt="" width={200} height={200} className="absolute -right-20 -top-20 opacity-60" />,
    className: "lg:col-start-1 lg:col-end-2 lg:row-start-3 lg:row-end-4",
  },
  {
    Icon: BookmarkIcon,
    name: "Get Expert Support",
    description: "24/7 support from experienced professionals.",
    href: "/login",
    cta: "Learn more",
    background: <Image src="" alt="" width={200} height={200} className="absolute -right-20 -top-20 opacity-60" />,
    className: "lg:col-start-3 lg:col-end-3 lg:row-start-1 lg:row-end-2",
  },
  {
    Icon: BellIcon,
    name: "Secure Profiles",
    description:
      "Advanced verification system to protect buyers and sellers.",
    href: "/login",
    cta: "Learn more",
    background: <Image src="" alt="" width={200} height={200} className="absolute -right-20 -top-20 opacity-60" />,
    className: "lg:col-start-3 lg:col-end-3 lg:row-start-2 lg:row-end-4",
  },
];

export async function BentoDemo() {
  return (
    <BentoGrid className="lg:grid-rows-3">
      {features.map((feature) => (
        <BentoCard key={feature.name} {...feature} />
      ))}
    </BentoGrid>
  );
}
