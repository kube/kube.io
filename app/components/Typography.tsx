export const H1: React.FC<React.PropsWithChildren> = ({ children }) => {
  return (
    <div className="[view-transition-name:hero-title]">
      <h1 className="text-[4rem] leading-[4rem] lg:text-[6rem] lg:leading-[5.8rem] md:text-[5rem] md:leading-[4.8rem] tracking-wide font-bold">
        {children}
      </h1>
    </div>
  );
};

export const H2: React.FC<React.PropsWithChildren> = ({ children }) => (
  <h2 className="text-[3rem] max-sm:text-[2.5rem] tracking-wide leading-[2.8rem] max-sm:leading-[2.3rem] font-light">
    {children}
  </h2>
);
