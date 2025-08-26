import { useNavigate } from "react-router";

type PageProps = {
  title: string;
  navRoutes?: { name: string; route: string }[];
  children: React.ReactNode;
};

export default function Page({
  title = "",
  navRoutes = [],
  children,
}: PageProps) {
  const navigate = useNavigate();

  return (
    <>
      <header className='h-20 p-5 font-bold text-3xl flex justify-between items-center gap-10 border-b-1 border-border-1 bg-bg-surface-1'>
        {title}

        <nav className='h-15 flex grow justify-end items-center gap-10'>
          {navRoutes.map(({ name, route }) => {
            return (
              <button
                onClick={() => navigate(route)}
                className='p-3 text-xl bg-bg-surface-1 rounded-xl border-3 border-border-1 transition-all duration-100 active:-translate-y-1 active:bg-bg-surface-2'
              >
                {name}
              </button>
            );
          })}
        </nav>
      </header>
      <main>{children}</main>
    </>
  );
}
