import Link from "next/link";

type Props = {
  href: string;
  label?: string;
};

export default function Breadcrumb({ href, label = "← 一覧へ戻る" }: Props) {
  return (
    <Link href={href} className="back-link">
      {label}
    </Link>
  );
}
