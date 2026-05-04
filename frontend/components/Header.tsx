import Link from "next/link";
import { useRouter } from "next/router";

export default function Header() {
  const router = useRouter();
  const showNewButton = router.pathname !== "/recipes/new";
  return (
    <header className="header">
      <div className="header-inner">
        <h1>
          <Link href="/recipes">RecipeManager</Link>
        </h1>
        {showNewButton && (
          <Link href="/recipes/new" className="btn btn-primary">
            + 新規登録
          </Link>
        )}
      </div>
    </header>
  );
}
