import { useNavigate } from "react-router";

type PageProps = {
  title: string;
  navItems?: { name: string; route: string }[];
  children: React.ReactNode;
  contentClassName?: string;
};

export default function Page({
  title = "",
  navItems = [],
  contentClassName = "",
  children,
}: PageProps) {
  const navigate = useNavigate();

  return (
    <>
      <header className='h-20 p-5 font-bold text-3xl flex justify-between items-center gap-10 border-b-1 border-border-1 bg-bg-surface-1'>
        {title}

        <nav className='h-15 flex grow justify-end items-center gap-8'>
          {navItems.map(({ name, route }) => {
            return (
              <button
                key={route}
                onClick={() => navigate(route)}
                className='p-3 text-xl bg-bg-surface-1 rounded-xl border-3 border-border-1 transition-all duration-200 active:bg-bg-surface-2 active:shadow-md'
              >
                {name}
              </button>
            );
          })}
        </nav>
      </header>
      <main className={contentClassName}>{children}</main>
    </>
  );
}
