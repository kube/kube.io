import { Logo } from "../../components/Logo";

export default function WorkshopPage() {
  return (
    <div className="flex justify-center items-center align-middle">
      <div className="relative w-36 flex gap-1">
        <div className="absolute -left-80 w-36">
          <Logo className="w-80" />
        </div>
        <div className="z-10 text-black bg-[image:var(--kube-background-light)] bg-clip-text">
          <div className="flex justify-between text-[5.7rem] leading-[4.7rem] font-black">
            <span>W</span>
            <span>O</span>
          </div>
          <div className="flex justify-between text-[7rem] leading-[5rem] font-bold">
            <span>R</span>
            <span>K</span>
          </div>
          <div className="flex justify-between text-[6.7rem] leading-[5.2rem] font-medium">
            <span>S</span>
            <span>H</span>
          </div>
          <div className="flex justify-between text-[6.5rem] leading-[5.2rem] font-light">
            <span>O</span>
            <span>P</span>
          </div>
        </div>
      </div>
    </div>
  );
}
