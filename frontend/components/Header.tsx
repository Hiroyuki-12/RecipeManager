import Link from "next/link";

export default function Header() {
  return (
    <header className="header">
      <h1>
        <Link href="/recipes">RecipeManager</Link>
      </h1>
    </header>
  );
}
